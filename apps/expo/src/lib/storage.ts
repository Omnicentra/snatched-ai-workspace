import { MMKV } from 'react-native-mmkv';

// Create a shared storage instance
export const storage = new MMKV({
  id: 'app-storage',
  encryptionKey: 'snatched-ai-storage-key'
});

// Storage keys
export const STORAGE_KEYS = {
  LAST_UPDATE_CHECK: '@app_last_update_check',
  UPDATE_AVAILABLE: '@app_update_available',
  UPDATE_DISMISSED: '@app_update_dismissed_version',
  LATEST_MANIFEST: '@app_latest_manifest',
} as const; 