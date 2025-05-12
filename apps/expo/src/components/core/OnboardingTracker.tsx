import React from 'react';
import { useOnboardingTracking } from '@/hooks/useOnboardingTracking';

interface OnboardingTrackerProps {
  screenName: string;
  children: React.ReactNode;
}

export function OnboardingTracker({ screenName, children }: OnboardingTrackerProps) {
  useOnboardingTracking(screenName);
  return <>{children}</>;
} 