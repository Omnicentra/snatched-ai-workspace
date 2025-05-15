import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { logger } from "./logger";
import { getOrCreateDeviceId } from "@/utils/device-id";
import { getMorningNotificationTime, getLunchNotificationTime, getDinnerNotificationTime } from "@/stores/notifications.store";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => {
    // Using await to satisfy linter even though it's not needed
    const result = await Promise.resolve({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    });
    return result;
  },
});

// Morning kickstart notification templates
export const MORNING_NOTIFICATIONS = [
  {
    title: "Snatched O'Clock",
    body: "New day, new body. Your morning workout is live 💖🔥",
  },
  {
    title: "Morning Magic Awaits",
    body: "Your AI workout is ready. Time to sculpt that waist ✨👙",
  },
  {
    title: "Wake Up, Snatch Up",
    body: "You slept, we planned. Your routine's ready. Let's move, queen 💪🏽👑",
  },
];

// Lunch notification templates
export const LUNCH_NOTIFICATIONS = [
  {
    title: "Lunch Break, Workout Time",
    body: "Use your lunch break wisely. Quick 20-min session ready for you 🥗💪",
  },
  {
    title: "Midday Energy Boost",
    body: "Beat the afternoon slump with your personalized workout 🔋✨",
  },
  {
    title: "Lunchtime Fitness Check",
    body: "Your midday routine is ready. Small steps, big results 🌟🏋️‍♀️",
  },
];

// Dinner notification templates
export const DINNER_NOTIFICATIONS = [
  {
    title: "Evening Workout Ready",
    body: "End your day strong with tonight's routine 🌙💫",
  },
  {
    title: "Nighttime Sculpt Session",
    body: "Your evening workout is waiting. Burn before bedtime 🔥😴",
  },
  {
    title: "Wind Down & Work Out",
    body: "Perfect way to end your day: your evening routine is ready 🌆💕",
  },
];

// Track index of last used template using the observable store
let morningTemplateIndex = 0;
let lunchTemplateIndex = 0;
let dinnerTemplateIndex = 0;

// Get the next notification template in sequence to ensure rotation
export const getNextNotificationTemplate = (templates: typeof MORNING_NOTIFICATIONS, templateIndexRef: number) => {
  try {
    // Get the template for the current index
    const template = templates[templateIndexRef];
    
    // Increment the index for next time (wrap around if needed)
    templateIndexRef = (templateIndexRef + 1) % templates.length;
    
    return template;
  } catch (error) {
    // In case of error, return a random template as fallback
    logger.error(
      "Error getting sequential template:",
      error instanceof Error ? error.message : String(error),
    );
    return getRandomNotificationTemplate(templates);
  }
};

// Get a random notification template (fallback)
export const getRandomNotificationTemplate = (
  templates: typeof MORNING_NOTIFICATIONS,
) => {
  const randomIndex = Math.floor(Math.random() * templates.length);
  const template = templates[randomIndex];
  logger.info(`Random template: ${JSON.stringify(template)}`);
  if (!template) {
    return {
      title: "Snatched O'Clock",
      body: "New day, new body. Your morning workout is live 💖🔥",
    } satisfies typeof MORNING_NOTIFICATIONS[number];
  }
  return template;
};

// Check notification permissions
export const checkNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === Notifications.PermissionStatus.GRANTED;
  } catch (error) {
    logger.error("Error checking notification permissions:", error instanceof Error ? error.message : String(error));
    return false;
  }
};

// Request notification permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === Notifications.PermissionStatus.GRANTED;
  } catch (error) {
    logger.error("Error requesting notification permissions:", error instanceof Error ? error.message : String(error));
    return false;
  }
};

// Register for push notifications
export const registerForPushNotificationsAsync = async (): Promise<
  string | undefined
> => {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF1493",
    });
  }

  if (Device.isDevice) {
    const permissionGranted = await checkNotificationPermissions();
    
    if (!permissionGranted) {
      logger.warn("No permission for push notifications!");
      return;
    }
    
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "8bcf08a2-4cad-4b0d-a2c0-197528f19cc7",
      })
    ).data;
  } else {
    logger.warn("Must use physical device for Push Notifications");
  }

  return token;
};

// Schedule notification helper
const scheduleNotification = async (
  title: string,
  body: string,
  scheduledTime: Date,
  type: string
) => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: { type },
      },
      trigger: {
        date: scheduledTime,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      },
    });

    logger.info(
      `Scheduled ${type} notification for ${scheduledTime.toLocaleString()} with ID: ${id}`,
    );
    return id;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`Failed to schedule ${type} notification:`, error.message);
    return null;
  }
};

// Schedule morning notification for user's preferred time
export const scheduleMorningNotification = async () => {
  try {
    // Check permissions first
    const permissionGranted = await checkNotificationPermissions();
    if (!permissionGranted) {
      logger.warn("Cannot schedule notifications: no permission granted");
      return false;
    }

    // Get the template using rotation system
    const template = getNextNotificationTemplate(MORNING_NOTIFICATIONS, morningTemplateIndex);
    morningTemplateIndex = (morningTemplateIndex + 1) % MORNING_NOTIFICATIONS.length;

    if (!template) {
      logger.error("Failed to get morning notification template");
      return false;
    }

    // Get the user's preferred time from the store
    const { hour, minute } = getMorningNotificationTime();
    
    // Calculate the time for the notification
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setDate(now.getDate() + (now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute) ? 1 : 0));
    scheduledTime.setHours(hour, minute, 0, 0);

    // Schedule the notification
    await scheduleNotification(
      template.title,
      template.body,
      scheduledTime,
      "morning-motivation"
    );
    
    return true;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("Failed to schedule morning notification:", error.message);
    return false;
  }
};

// Schedule lunch notification for user's preferred time
export const scheduleLunchNotification = async () => {
  try {
    // Check permissions first
    const permissionGranted = await checkNotificationPermissions();
    if (!permissionGranted) {
      logger.warn("Cannot schedule notifications: no permission granted");
      return false;
    }

    // Get the template using rotation system
    const template = getNextNotificationTemplate(LUNCH_NOTIFICATIONS, lunchTemplateIndex);
    lunchTemplateIndex = (lunchTemplateIndex + 1) % LUNCH_NOTIFICATIONS.length;

    if (!template) {
      logger.error("Failed to get lunch notification template");
      return false;
    }

    // Get the user's preferred time from the store
    const { hour, minute } = getLunchNotificationTime();
    
    // Calculate the time for the notification
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setDate(now.getDate() + (now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute) ? 1 : 0));
    scheduledTime.setHours(hour, minute, 0, 0);

    // Schedule the notification
    await scheduleNotification(
      template.title,
      template.body,
      scheduledTime,
      "lunch-motivation"
    );
    
    return true;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("Failed to schedule lunch notification:", error.message);
    return false;
  }
};

// Schedule dinner notification for user's preferred time
export const scheduleDinnerNotification = async () => {
  try {
    // Check permissions first
    const permissionGranted = await checkNotificationPermissions();
    if (!permissionGranted) {
      logger.warn("Cannot schedule notifications: no permission granted");
      return false;
    }

    // Get the template using rotation system
    const template = getNextNotificationTemplate(DINNER_NOTIFICATIONS, dinnerTemplateIndex);
    dinnerTemplateIndex = (dinnerTemplateIndex + 1) % DINNER_NOTIFICATIONS.length;

    if (!template) {
      logger.error("Failed to get dinner notification template");
      return false;
    }

    // Get the user's preferred time from the store
    const { hour, minute } = getDinnerNotificationTime();
    
    // Calculate the time for the notification
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setDate(now.getDate() + (now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute) ? 1 : 0));
    scheduledTime.setHours(hour, minute, 0, 0);

    // Schedule the notification
    await scheduleNotification(
      template.title,
      template.body,
      scheduledTime,
      "dinner-motivation"
    );
    
    return true;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("Failed to schedule dinner notification:", error.message);
    return false;
  }
};

// Initialize notifications system - now this can be called from our setup screens
export const initializeNotifications = async (): Promise<boolean> => {
  try {
    // Check if notifications permission is granted
    const permissionGranted = await checkNotificationPermissions();
    if (!permissionGranted) {
      logger.warn("Notification permissions not granted");
      return false;
    }

    // Cancel any existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule all meal-time notifications
    const morningSuccess = await scheduleMorningNotification();
    const lunchSuccess = await scheduleLunchNotification();
    const dinnerSuccess = await scheduleDinnerNotification();
    
    if (morningSuccess || lunchSuccess || dinnerSuccess) {
      logger.info("Notifications system initialized successfully");
      return true;
    }
    
    logger.warn("Failed to schedule any notifications");
    return false;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("Failed to initialize notifications:", error.message);
    return false;
  }
};

// Track a user's device for push notifications
export const trackUserForPushNotifications = async (userId: string) => {
  try {
    const token = await registerForPushNotificationsAsync();
    const _deviceId = await getOrCreateDeviceId();

    if (token) {
      // Here you would send the token to your backend or a notification service
      logger.info(`Push token registered for user ${userId}: ${token}`);

      // Example API call to register token (implement according to your backend)
      // await api.post('/register-push-token', { userId, token, deviceId });

      return token;
    }
    return null;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("Error tracking user for push notifications:", error.message);
    return null;
  }
};
