import { useEffect, useState } from 'react';
import VersionCheck from 'react-native-version-check';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_UPDATE_CHECK_KEY = '@app_last_update_check';
const UPDATE_DISMISSED_KEY = '@app_update_dismissed_version';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface AppUpdateInfo {
  isUpdateAvailable: boolean;
  currentVersion: string;
  latestVersion: string | null;
  storeUrl: string | null;
  isUpdateDismissed: boolean;
}

export const useAppUpdateCheck = () => {
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo>({
    isUpdateAvailable: false,
    currentVersion: VersionCheck.getCurrentVersion(),
    latestVersion: null,
    storeUrl: null,
    isUpdateDismissed: false,
  });
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdate = async (forceCheck = false) => {
    try {
      setIsChecking(true);
      setError(null);

      // Check if we should skip the check (unless forced)
      if (!forceCheck) {
        const lastCheck = await AsyncStorage.getItem(LAST_UPDATE_CHECK_KEY);
        if (lastCheck) {
          const lastCheckTime = parseInt(lastCheck, 10);
          if (Date.now() - lastCheckTime < CHECK_INTERVAL_MS) {
            setIsChecking(false);
            return;
          }
        }
      }

      // Get current version
      const currentVersion = VersionCheck.getCurrentVersion();

      // Get latest version from store
      let latestVersion: string | null = null;
      let storeUrl: string | null = null;

      if (Platform.OS === 'ios') {
        // For iOS, we need to use the app ID
        const appId = '6744844397'; // From the App Store URL
        latestVersion = await VersionCheck.getLatestVersion({
          provider: 'appStore',
          appID: appId,
        });
        storeUrl = `https://apps.apple.com/app/id${appId}`;
      } else if (Platform.OS === 'android') {
        // For Android, we need the package name
        const packageName = await VersionCheck.getPackageName();
        latestVersion = await VersionCheck.getLatestVersion({
          provider: 'playStore',
          packageName,
        });
        storeUrl = await VersionCheck.getStoreUrl();
      }

      // Check if update is available
      const needUpdate = latestVersion ? await VersionCheck.needUpdate({
        currentVersion,
        latestVersion,
      }) : null;

      // Check if this version was previously dismissed
      const dismissedVersion = await AsyncStorage.getItem(UPDATE_DISMISSED_KEY);
      const isUpdateDismissed = dismissedVersion === latestVersion;

      setUpdateInfo({
        isUpdateAvailable: needUpdate?.isNeeded || false,
        currentVersion,
        latestVersion,
        storeUrl,
        isUpdateDismissed,
      });

      // Save last check time
      await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());
    } catch (err) {
      console.error('Error checking for app update:', err);
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
    } finally {
      setIsChecking(false);
    }
  };

  const openStore = async () => {
    if (updateInfo.storeUrl) {
      try {
        await Linking.openURL(updateInfo.storeUrl);
      } catch (err) {
        console.error('Error opening store URL:', err);
      }
    }
  };

  const dismissUpdate = async () => {
    if (updateInfo.latestVersion) {
      await AsyncStorage.setItem(UPDATE_DISMISSED_KEY, updateInfo.latestVersion);
      setUpdateInfo(prev => ({ ...prev, isUpdateDismissed: true }));
    }
  };

  const resetDismissedUpdate = async () => {
    await AsyncStorage.removeItem(UPDATE_DISMISSED_KEY);
    setUpdateInfo(prev => ({ ...prev, isUpdateDismissed: false }));
  };

  useEffect(() => {
    // Check for updates on mount
    checkForUpdate();
  }, []);

  return {
    updateInfo,
    isChecking,
    error,
    checkForUpdate,
    openStore,
    dismissUpdate,
    resetDismissedUpdate,
  };
};