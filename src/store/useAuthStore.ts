import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  name: string;
  givenName?: string;
  email: string;
  picture?: string;
  provider: 'google' | 'demo';
}

interface AuthState {
  authUser: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authUser: null,
      setAuthUser: (user) => set({ authUser: user }),
      signOut: () => set({ authUser: null }),
    }),
    {
      name: 'vku-auth-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
