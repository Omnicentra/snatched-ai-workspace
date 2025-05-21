import { mixpanel } from "@/lib/utils";
import { api } from "@/utils/api";
import { authClient } from "@/utils/auth";
import { getOrCreateDeviceId } from "@/utils/device-id";
import { useLDClient } from "@launchdarkly/react-native-client-sdk";
import * as Sentry from "@sentry/react-native";
import * as Device from "expo-device";
import { useEffect } from "react";
import { Platform } from "react-native";
import type { CustomerInfo } from "react-native-purchases";
import Purchases from "react-native-purchases";

interface UsePostAuthProps {
  onSuccess?: (info: CustomerInfo) => void;
  onTrack?: (deviceId: string) => void;
}

export function usePostAuth({ onSuccess, onTrack }: UsePostAuthProps) {
  const { mutate: createUserDevice } = api.userDevices.create.useMutation();
  const ldc = useLDClient();
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      void (async () => {
        try {
          const deviceId = await getOrCreateDeviceId();

          // Create user device record
          createUserDevice({
            userId: session.user.id,
            deviceId,
            deviceType: Platform.OS,
            deviceName: Device.deviceName,
          });

          // Set up RevenueCat
          const info = await Purchases.logIn(session.user.email);

          // Set up analytics
          void mixpanel.identify(session.user.id);
          void mixpanel.getPeople().setOnce({
            email: session.user.email,
            name: session.user.name,
            avatar: session.user.image,
            device_id: deviceId,
            device_type: Platform.OS,
            device_name: Device.deviceName,
          });
          
          // Set up Sentry
          Sentry.setUser({
            email: session.user.email,
            id: session.user.id,
          });

          // Set up LaunchDarkly
          void ldc.identify({
            kind: "user",
            key: session.user.email,
            name: session.user.name,
            email: session.user.email,
          });

          // Call success callback if provided
          onSuccess?.(info.customerInfo);
          onTrack?.(deviceId);
        } catch (error) {
          console.error("Failed to complete post-authentication setup:", error);
        }
      })();
    }
  }, [session]);

  return {
    ldc,
  };
}
