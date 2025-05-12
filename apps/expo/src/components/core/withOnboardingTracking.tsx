import React from 'react';
import { useOnboardingTracking } from '@/hooks/useOnboardingTracking';

// Higher-Order Component (HOC) for tracking onboarding screens
export function withOnboardingTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName: string
): React.FC<P> {
  // Return a new component that includes tracking
  const WithTracking = (props: P) => {
    // Use the tracking hook
    useOnboardingTracking(screenName);
    
    // Render the original component with its props
    return <WrappedComponent {...props} />;
  };
  
  // Set display name for debugging purposes
  WithTracking.displayName = `WithOnboardingTracking(${WrappedComponent.displayName ?? 'Component'})`;
  
  return WithTracking;
} 