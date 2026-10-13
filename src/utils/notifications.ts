import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reservation, TimeSlot } from '../types';

// Configure foreground notification behavior safely
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.warn('[Notifications] setNotificationHandler not available:', e);
}

/**
 * Initializes notification channels and requests permissions.
 */
export async function initNotifications(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('booking-reminders', {
        name: 'VKU Study Room Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0F52BA',
        sound: 'default',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (err) {
    console.warn('[Notifications] Permission init error:', err);
    return false;
  }
}

/**
 * Schedules a check-in reminder 15 minutes before the booked slot starts.
 * Returns notification identifier if scheduled.
 */
export async function scheduleCheckInReminder(
  reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>,
  timeSlot?: TimeSlot
): Promise<string | undefined> {
  try {
    const hasPermission = await initNotifications();
    if (!hasPermission) {
      console.warn('[Notifications] No notification permission granted.');
    }

    // Determine slot start hour & minute
    const startParts = timeSlot ? timeSlot.startTime.split(':') : reservation.timeRange.split('–')[0].trim().split(':');
    const startHour = parseInt(startParts[0], 10);
    const startMinute = parseInt(startParts[1] || '0', 10);

    // Calculate target date: reservation.date (YYYY-MM-DD)
    const [year, month, day] = reservation.date.split('-').map(Number);
    const targetStartDate = new Date(year, month - 1, day, startHour, startMinute, 0);

    // 15 minutes before
    const reminderTimeMs = targetStartDate.getTime() - 15 * 60 * 1000;
    const nowMs = Date.now();

    let trigger: Notifications.NotificationTriggerInput;

    if (reminderTimeMs > nowMs) {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(reminderTimeMs),
        channelId: Platform.OS === 'android' ? 'booking-reminders' : undefined,
      };
    } else {
      // If the slot is today and starts soon or is active, trigger test demo alert in 5 seconds
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        repeats: false,
        channelId: Platform.OS === 'android' ? 'booking-reminders' : undefined,
      };
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `VKU Study Room Alert: ${reservation.roomName}`,
        body: `Your reserved slot (${reservation.timeRange}) begins in 15 minutes! Open the app for your QR check-in pass.`,
        sound: true,
        data: {
          roomId: reservation.roomId,
          date: reservation.date,
          slotId: reservation.slotId,
        },
      },
      trigger,
    });

    return notificationId;
  } catch (err) {
    console.warn('[Notifications] Failed to schedule notification:', err);
    return undefined;
  }
}

/**
 * Cancels a previously scheduled notification reminder.
 */
export async function cancelBookingReminder(notificationId?: string): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.warn('[Notifications] Failed to cancel notification:', err);
  }
}
