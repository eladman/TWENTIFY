import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { usePlanStore } from '@/stores/usePlanStore';
import { useUserStore } from '@/stores/useUserStore';

/**
 * Request notification permission from the OS.
 * Returns true if granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Schedule weekly workout reminders for the given days.
 * @param time  "HH:MM" format
 * @param days  weekday numbers using 0=Sunday convention
 */
export async function scheduleWorkoutReminder(
  time: string,
  days: number[],
): Promise<void> {
  const [hour, minute] = time.split(':').map(Number);
  const weeklySchedule = usePlanStore.getState().weeklySchedule;

  for (const day of days) {
    // Convert 0=Sunday user spec → 0=Monday DayPlan convention
    const dayPlanIndex = (day + 6) % 7;
    const dayPlan = weeklySchedule.find((d) => d.dayOfWeek === dayPlanIndex);

    if (!dayPlan) continue;

    let title: string;
    let body: string;

    if (dayPlan.activity === 'gym') {
      const exerciseCount = dayPlan.workoutTemplate?.exercises.length ?? 0;
      const minutes = dayPlan.estimatedDurationMin;
      title = 'Time for your 20%';
      body = `Strength session ready. ${exerciseCount} exercises, ~${minutes} min.`;
    } else if (dayPlan.activity === 'run') {
      title = 'Time for your 20%';
      body = 'Run day. Lace up and keep it easy.';
    } else {
      // rest / nutrition_only — skip
      continue;
    }

    // User spec → expo trigger: day + 1 (expo weekday: 1=Sunday)
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: day + 1,
        hour,
        minute,
      },
    });
  }
}

/**
 * Cancel all scheduled notification reminders.
 */
export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Re-schedule all reminders based on current plan and user settings.
 */
export async function rescheduleReminders(): Promise<void> {
  await cancelAllReminders();

  const { settings } = useUserStore.getState();
  if (!settings.notifications) return;

  const weeklySchedule = usePlanStore.getState().weeklySchedule;

  // Find active days (gym or run) and convert DayPlan dayOfWeek → 0=Sunday user spec
  const activeDays = weeklySchedule
    .filter((d) => d.activity === 'gym' || d.activity === 'run')
    .map((d) => (d.dayOfWeek + 1) % 7);

  if (activeDays.length === 0) return;

  await scheduleWorkoutReminder(settings.reminderTime, activeDays);
}

/**
 * Set up the notification handler for foreground display and Android channel.
 */
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('reminders', {
      name: 'Workout Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
}
