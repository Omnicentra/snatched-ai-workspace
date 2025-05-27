import React, { useEffect } from 'react';
import { Analytics } from '@/lib/analytics';
import { getOrCreateDeviceId } from '@/utils/device-id';
import { authClient } from '@/utils/auth';
import * as Sentry from '@sentry/react-native';

// Higher-Order Component (HOC) for tracking onboarding screens
export function withOnboardingTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName: string
): React.FC<P> {
  // Return a new component that includes tracking
  const WithTracking = (props: P) => {
    const { data: session } = authClient.useSession();

    // Track screen view
    useEffect(() => {
      void (async () => {
        try {
          const deviceId = await getOrCreateDeviceId();
          const userId = session?.user.id;
          Analytics.trackOnboardingScreenView(screenName, deviceId, userId);
        } catch (error: unknown) {
          if (error instanceof Error) {
            Sentry.captureException(error);
          }
        }
      })();
    }, [session?.user.id]);
    
    // Render the original component with its props
    return <WrappedComponent {...props} />;
  };
  
  // Set display name for debugging purposes
  WithTracking.displayName = `WithOnboardingTracking(${WrappedComponent.displayName ?? 'Component'})`;
  
  return WithTracking;
} 