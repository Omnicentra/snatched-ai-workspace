import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'temporary_device_id';

export async function getOrCreateDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = uuidv4();
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
} 