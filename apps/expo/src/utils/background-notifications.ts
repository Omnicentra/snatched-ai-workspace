import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { logger } from '@/lib/logger';
import { 
  MORNING_NOTIFICATIONS, 
  LUNCH_NOTIFICATIONS, 
  DINNER_NOTIFICATIONS, 
  getRandomNotificationTemplate 
} from '@/lib/notifications';
import { 
  getMorningNotificationTime, 
  getLunchNotificationTime, 
  getDinnerNotificationTime 
} from '@/stores/notifications.store';

// Task name for our background notification scheduler
const BACKGROUND_NOTIFICATION_TASK = 'background-notification-task';

// Register the task definition
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    const now = new Date();
    logger.info(`Background task running at ${now.toLocaleTimeString()}`);
    
    // Get user's preferred notification times from the store
    const morningTime = getMorningNotificationTime();
    const lunchTime = getLunchNotificationTime();
    const dinnerTime = getDinnerNotificationTime();
    
    // Get notification templates
    const morningTemplate = getRandomNotificationTemplate(MORNING_NOTIFICATIONS);
    const lunchTemplate = getRandomNotificationTemplate(LUNCH_NOTIFICATIONS);
    const dinnerTemplate = getRandomNotificationTemplate(DINNER_NOTIFICATIONS);
    
    // Schedule tomorrow's notifications at user's preferred times
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Morning notification
    const morningDate = new Date(tomorrow);
    morningDate.setHours(morningTime.hour, morningTime.minute, 0, 0);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: morningTemplate.title,
        body: morningTemplate.body,
        sound: true,
        priority: 'high',
        data: { type: 'morning-motivation' },
      },
      trigger: {
        date: morningDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      },
    });
    
    // Lunch notification
    const lunchDate = new Date(tomorrow);
    lunchDate.setHours(lunchTime.hour, lunchTime.minute, 0, 0);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: lunchTemplate.title,
        body: lunchTemplate.body,
        sound: true,
        priority: 'high',
        data: { type: 'lunch-motivation' },
      },
      trigger: {
        date: lunchDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      },
    });
    
    // Dinner notification
    const dinnerDate = new Date(tomorrow);
    dinnerDate.setHours(dinnerTime.hour, dinnerTime.minute, 0, 0);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: dinnerTemplate.title,
        body: dinnerTemplate.body,
        sound: true,
        priority: 'high',
        data: { type: 'dinner-motivation' },
      },
      trigger: {
        date: dinnerDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      },
    });
    
    logger.info(`Scheduled background notifications for tomorrow at:
      Morning: ${morningTime.hour}:${morningTime.minute},
      Lunch: ${lunchTime.hour}:${lunchTime.minute},
      Dinner: ${dinnerTime.hour}:${dinnerTime.minute}`);
      
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    const error = err as Error;
    logger.error('Error in background task:', error.message);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background fetch task
export const registerBackgroundNotificationTask = async (): Promise<boolean> => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
      minimumInterval: 60 * 60, // 1 hour in seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
    
    logger.info('Background notification task registered');
    return true;
  } catch (err) {
    const error = err as Error;
    logger.error('Error registering background task:', error.message);
    return false;
  }
};

// Unregister the background fetch task
export const unregisterBackgroundNotificationTask = async (): Promise<boolean> => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    logger.info('Background notification task unregistered');
    return true;
  } catch (err) {
    const error = err as Error;
    logger.error('Error unregistering background task:', error.message);
    return false;
  }
};

// Check if the task is registered
export const isBackgroundNotificationTaskRegistered = async (): Promise<boolean> => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK);
    return isRegistered;
  } catch (err) {
    const error = err as Error;
    logger.error('Error checking task registration:', error.message);
    return false;
  }
}; 