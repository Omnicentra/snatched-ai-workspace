import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { logger } from '@/lib/logger';
import {
  checkForUpdateManually,
  applyUpdate,
  isUpdateDismissed,
  dismissUpdate as dismissUpdateStorage,
  resetDismissedUpdate,
  registerBackgroundUpdateTask,
} from '@/utils/background-updates';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface AppUpdateInfo {
  isUpdateAvailable: boolean;
  currentVersion: string;
  hasDownloadedUpdate: boolean;
  isUpdateDismissed: boolean;
  manifestId?: string;
}

export const useAppUpdateCheck = () => {
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo>({
    isUpdateAvailable: false,
    currentVersion: Constants.expoConfig?.version ?? '1.0.0',
    hasDownloadedUpdate: false,
    isUpdateDismissed: false,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStoredUpdateStatus = () => {
    try {
      // Check if there's a stored update available
      const isStoredUpdateAvailable = storage.getBoolean(STORAGE_KEYS.UPDATE_AVAILABLE) ?? false;
      
      // Get manifest if available
      const storedManifest = storage.getString(STORAGE_KEYS.LATEST_MANIFEST);
      let manifestId: string | undefined;
      
      if (storedManifest) {
        try {
          const manifest = JSON.parse(storedManifest) as { id?: string };
          manifestId = manifest.id;
        } catch (e) {
          logger.error('Error parsing stored manifest:', e);
        }
      }
      
      // Check if this update was dismissed
      const isDismissed = manifestId ? isUpdateDismissed(manifestId) : false;
      
      setUpdateInfo(prev => ({
        ...prev,
        isUpdateAvailable: isStoredUpdateAvailable,
        hasDownloadedUpdate: isStoredUpdateAvailable,
        isUpdateDismissed: isDismissed,
        manifestId,
      }));
    } catch (err) {
      logger.error('Error checking stored update status:', err);
    }
  };

  const checkForUpdate = async (forceCheck = false) => {
    try {
      setIsChecking(true);
      setError(null);

      if (forceCheck) {
        // Manual check - use the utility function
        const result = await checkForUpdateManually();
        
        const manifestId = result.manifest?.id;
        const isDismissed = manifestId ? isUpdateDismissed(manifestId) : false;
        
        setUpdateInfo(prev => ({
          ...prev,
          isUpdateAvailable: result.isAvailable,
          hasDownloadedUpdate: result.isAvailable,
          isUpdateDismissed: isDismissed,
          manifestId,
        }));
      } else {
        // Just check stored status (background task handles actual checking)
        checkStoredUpdateStatus();
      }
    } catch (err) {
      console.error('Error checking for app update:', err);
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
    } finally {
      setIsChecking(false);
    }
  };

  const applyUpdateNow = async () => {
    try {
      await applyUpdate();
    } catch (err) {
      console.error('Error applying update:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply update');
    }
  };

  const dismissUpdate = () => {
    if (updateInfo.manifestId) {
      dismissUpdateStorage(updateInfo.manifestId);
      setUpdateInfo(prev => ({ ...prev, isUpdateDismissed: true }));
    }
  };

  const resetDismissedUpdateStatus = () => {
    resetDismissedUpdate();
    setUpdateInfo(prev => ({ ...prev, isUpdateDismissed: false }));
  };

  // Initialize background update checking and check stored status
  useEffect(() => {
    const initializeUpdateSystem = async () => {
      try {
        // Register background update task
        await registerBackgroundUpdateTask();
        
        // Check stored update status
        checkStoredUpdateStatus();
      } catch (err) {
        logger.error('Error initializing update system:', err);
      }
    };

    void initializeUpdateSystem();
  }, []);

  // Set up interval to check stored status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkStoredUpdateStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    updateInfo,
    isChecking,
    error,
    checkForUpdate,
    openStore: applyUpdateNow, // For compatibility with existing components
    dismissUpdate,
    resetDismissedUpdate: resetDismissedUpdateStatus,
    applyUpdate: applyUpdateNow,
  };
};