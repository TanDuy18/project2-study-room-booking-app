import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useBookingStore } from '../store/useBookingStore';

// 1) Create an OAuth client (type: Web application) in Google Cloud Console
// 2) Add  http://localhost:8081  to "Authorized JavaScript origins"
// 3) Paste the client ID here
export const GOOGLE_WEB_CLIENT_ID = '736961046686-7ff1a9e0lokscfpkg1aogau8unecl75r.apps.googleusercontent.com';

const loadGoogleScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const w = window as any;
    if (w.google?.accounts?.oauth2) return resolve();

    const existing = document.getElementById('google-gsi') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Could not load Google script')));
      return;
    }
    const s = document.createElement('script');
    s.id = 'google-gsi';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load Google script'));
    document.head.appendChild(s);
  });

const requestAccessToken = (): Promise<string> =>
  new Promise((resolve, reject) => {
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_WEB_CLIENT_ID,
      scope: 'openid profile email',
      callback: (resp: any) =>
        resp.error
          ? reject(new Error(resp.error_description || resp.error))
          : resolve(resp.access_token),
      error_callback: (err: any) =>
        reject(new Error(err?.type === 'popup_closed' ? 'Sign-in window was closed' : err?.type || 'Sign-in failed')),
    });
    client.requestAccessToken({ prompt: 'select_account' });
  });

export function useGoogleAuth() {
  const setAuthUser = useAuthStore((s) => s.setAuthUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setError(null);

    if (Platform.OS !== 'web') {
      setError('Google sign-in currently works in the web version. Native needs a development build.');
      return;
    }
    if (GOOGLE_WEB_CLIENT_ID.startsWith('YOUR_')) {
      setError('Set GOOGLE_WEB_CLIENT_ID in src/auth/useGoogleAuth.ts first.');
      return;
    }

    try {
      setLoading(true);
      await loadGoogleScript();
      const accessToken = await requestAccessToken();

      // Fetch the Google profile: name, email, avatar
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`Could not read profile (${res.status})`);
      const p = await res.json();

      setAuthUser({
        id: p.sub,
        name: p.name || p.email,
        givenName: p.given_name,
        email: p.email,
        picture: p.picture,
        provider: 'google',
      });

      // Use the Google identity for new bookings (keeps the student ID)
      useBookingStore.setState((s) => ({
        userSession: {
          ...s.userSession,
          name: p.name || s.userSession.name,
          email: p.email || s.userSession.email,
          avatar: p.picture || s.userSession.avatar,
        },
      }));
    } catch (e: any) {
      setError(e?.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }, [setAuthUser]);

  return { signIn, loading, error };
}
