import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Updates from 'expo-updates';
import { logger } from '@/lib/logger';
import { storage, STORAGE_KEYS } from '@/lib/storage';

// Task name for our background update checker
const BACKGROUND_UPDATE_TASK = 'background-update-task';

// Check interval - 24 hours in milliseconds
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Register the task definition
TaskManager.defineTask(BACKGROUND_UPDATE_TASK, async () => {
  try {
    logger.info('Background update check task running');
    
    // Check if we should skip the check based on interval
    const lastCheck = storage.getNumber(STORAGE_KEYS.LAST_UPDATE_CHECK);
    if (lastCheck) {
      if (Date.now() - lastCheck < CHECK_INTERVAL_MS) {
        logger.info('Skipping update check - too recent');
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }
    }

    // Check for updates using expo-updates
    const update = await Updates.checkForUpdateAsync();
    
    if (update.isAvailable) {
      logger.info('Update available - fetching update');
      
      // Store that an update is available
      storage.set(STORAGE_KEYS.UPDATE_AVAILABLE, true);
      storage.set(STORAGE_KEYS.LATEST_MANIFEST, JSON.stringify(update.manifest));
      
      // Fetch the update but don't reload automatically
      await Updates.fetchUpdateAsync();
      
      logger.info('Update fetched successfully');
      
      // Update last check time
      storage.set(STORAGE_KEYS.LAST_UPDATE_CHECK, Date.now());
      
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      logger.info('No update available');
      
      // Clear update available flag
      storage.delete(STORAGE_KEYS.UPDATE_AVAILABLE);
      
      // Update last check time
      storage.set(STORAGE_KEYS.LAST_UPDATE_CHECK, Date.now());
      
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
  } catch (err) {
    const error = err as Error;
    logger.error('Error in background update task:', error.message);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background fetch task
export const registerBackgroundUpdateTask = async () => {
  try {
    // Check if task is already registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_UPDATE_TASK);
    
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_UPDATE_TASK, {
        minimumInterval: 30 * 60, // 30 minutes in seconds (minimum allowed)
        stopOnTerminate: false,
        startOnBoot: true,
      });
      
      logger.info('Background update task registered');
    } else {
      logger.info('Background update task already registered');
    }
    
    return true;
  } catch (err) {
    const error = err as Error;
    logger.error('Error registering background update task:', error.message);
    return false;
  }
};

// Unregister the background fetch task
export const unregisterBackgroundUpdateTask = async (): Promise<boolean> => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_UPDATE_TASK);
    logger.info('Background update task unregistered');
    return true;
  } catch (err) {
    const error = err as Error;
    logger.error('Error unregistering background update task:', error.message);
    return false;
  }
};

// Check if the task is registered
export const isBackgroundUpdateTaskRegistered = async (): Promise<boolean> => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_UPDATE_TASK);
    return isRegistered;
  } catch (err) {
    const error = err as Error;
    logger.error('Error checking update task registration:', error.message);
    return false;
  }
};

// Manual update check function
export const checkForUpdateManually = async (): Promise<{
  isAvailable: boolean;
  manifest?: Updates.Manifest;
}> => {
  try {
    const update = await Updates.checkForUpdateAsync();
    
    if (update.isAvailable) {
      storage.set(STORAGE_KEYS.UPDATE_AVAILABLE, true);
      storage.set(STORAGE_KEYS.LATEST_MANIFEST, JSON.stringify(update.manifest));
      
      // Fetch the update
      await Updates.fetchUpdateAsync();
      
      return {
        isAvailable: true,
        manifest: update.manifest,
      };
    } else {
      storage.delete(STORAGE_KEYS.UPDATE_AVAILABLE);
      return {
        isAvailable: false,
      };
    }
  } catch (error) {
    logger.error('Error checking for update manually:', error);
    throw error;
  }
};

// Apply the downloaded update (reload the app)
export const applyUpdate = async (): Promise<void> => {
  try {
    await Updates.reloadAsync();
  } catch (error) {
    logger.error('Error applying update:', error);
    throw error;
  }
};

// Check if an update was dismissed
export const isUpdateDismissed = (manifestId?: string): boolean => {
  try {
    if (!manifestId) return false;
    
    const dismissedVersion = storage.getString(STORAGE_KEYS.UPDATE_DISMISSED);
    return dismissedVersion === manifestId;
  } catch (error) {
    logger.error('Error checking if update was dismissed:', error);
    return false;
  }
};

// Dismiss an update
export const dismissUpdate = (manifestId?: string): void => {
  try {
    if (manifestId) {
      storage.set(STORAGE_KEYS.UPDATE_DISMISSED, manifestId);
    }
  } catch (error) {
    logger.error('Error dismissing update:', error);
  }
};

// Reset dismissed update
export const resetDismissedUpdate = (): void => {
  try {
    storage.delete(STORAGE_KEYS.UPDATE_DISMISSED);
  } catch (error) {
    logger.error('Error resetting dismissed update:', error);
  }
}; 