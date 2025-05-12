import { useEffect } from 'react';
import { Analytics } from '@/lib/analytics';
import { getOrCreateDeviceId } from '@/utils/device-id';
import { authClient } from '@/utils/auth';

export const useOnboardingTracking = (screenName: string) => {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    void (async () => {
      try {
        const deviceId = await getOrCreateDeviceId();
        const userId = session?.user.id;
        Analytics.trackOnboardingScreenView(screenName, deviceId, userId);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Failed to track onboarding screen view:', error.message);
        }
      }
    })();
  }, [screenName, session?.user.id]);
}; 