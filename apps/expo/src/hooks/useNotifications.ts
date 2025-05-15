import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { logger } from '@/lib/logger';
import { scheduleMorningNotification } from '@/lib/notifications';

/**
 * A hook for handling notifications permissions and status in components
 */
export function useNotifications() {
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check if the user has notification permissions
  useEffect(() => {
    async function checkPermissions() {
      try {
        setIsLoading(true);
        const { status } = await Notifications.getPermissionsAsync();
        setHasPermissions(status === Notifications.PermissionStatus.GRANTED);
      } catch (error) {
        logger.error('Error checking notification permissions:', error instanceof Error ? error.message : String(error));
      } finally {
        setIsLoading(false);
      }
    }

    void checkPermissions();
  }, []);

  /**
   * Request notification permissions from the user
   */
  const requestPermissions = async () => {
    try {
      setIsLoading(true);
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status === Notifications.PermissionStatus.GRANTED) {
        setHasPermissions(true);
        // Schedule notifications once permission is granted
        await scheduleMorningNotification();
        return true;
      } else {
        setHasPermissions(false);
        
        // On iOS, guide the user to enable notifications in settings
        if (Platform.OS === 'ios') {
          Alert.alert(
            'Enable Notifications',
            'To receive workout reminders, please enable notifications in your device settings.',
            [
              { text: 'Not Now', style: 'cancel' },
              { text: 'Open Settings', onPress: () => void Notifications.requestPermissionsAsync() }
            ]
          );
        }
        return false;
      }
    } catch (error) {
      logger.error('Error requesting notification permissions:', error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Re-schedule morning notifications
   */
  const refreshNotifications = async () => {
    if (!hasPermissions) {
      return false;
    }
    
    try {
      setIsLoading(true);
      await scheduleMorningNotification();
      return true;
    } catch (error) {
      logger.error('Error scheduling notifications:', error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasPermissions,
    isLoading,
    requestPermissions,
    refreshNotifications,
  };
} 