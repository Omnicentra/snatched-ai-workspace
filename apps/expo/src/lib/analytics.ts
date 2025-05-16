import { mixpanel } from './utils';

export interface UserProfile {
  email: string;
  name?: string | null;
  image?: string | null;
}

// Keep track of visited screens in the current session
const visitedScreens = new Set<string>();

export const Analytics = {
  trackOnboardingStart: (deviceId: string) => {
    // Reset visited screens when onboarding starts
    visitedScreens.clear();
    void mixpanel.track('onboarding_started', {
      device_id: deviceId,
      timestamp: new Date().toISOString(),
    });
  },

  trackOnboardingScreenView: (screenName: string, deviceId: string, userId?: string) => {
    // Only track if this screen hasn't been visited in this session
    if (!visitedScreens.has(screenName)) {
      visitedScreens.add(screenName);
      void mixpanel.track('onboarding_screen_viewed', {
        screen_name: screenName,
        device_id: deviceId,
        user_id: userId,
        visited_screens: Array.from(visitedScreens),
        timestamp: new Date().toISOString(),
      });
    }
  },

  trackPhotoScanStart: (photoType: 'front' | 'side' | 'back', deviceId: string) => {
    void mixpanel.track('photo_scan_started', {
      photo_type: photoType,
      device_id: deviceId,
      timestamp: new Date().toISOString(),
    });
  },

  trackAllPhotosScanned: (deviceId: string) => {
    void mixpanel.track('all_photos_scanned', {
      device_id: deviceId,
      timestamp: new Date().toISOString(),
    });
  },

  trackUserSignIn: (deviceId: string, userProfile: UserProfile) => {
    // First, identify the user with their email
    void mixpanel.identify(userProfile.email);
    
    // Set user properties
    void mixpanel.getPeople().set({
      $email: userProfile.email,
      $name: userProfile.name,
      avatar: userProfile.image,
      device_id: deviceId,
    });

    // Track the sign-in event
    void mixpanel.track('user_signed_in', {
      device_id: deviceId,
      email: userProfile.email,
      timestamp: new Date().toISOString(),
    });
  },

  trackPaywallView: (deviceId: string, userId?: string) => {
    void mixpanel.track('paywall_viewed', {
      device_id: deviceId,
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  },

  trackSubscriptionPurchase: (
    deviceId: string, 
    userId: string,
    planDetails: {
      planId: string;
      planName: string;
      price: number;
      currency: string;
      interval: 'week' | 'year';
    }
  ) => {
    void mixpanel.track('subscription_purchased', {
      device_id: deviceId,
      user_id: userId,
      ...planDetails,
      timestamp: new Date().toISOString(),
    });
  },

  trackOnboardingComplete: (deviceId: string, userId?: string) => {
    void mixpanel.track('onboarding_completed', {
      device_id: deviceId,
      user_id: userId,
      visited_screens: Array.from(visitedScreens),
      timestamp: new Date().toISOString(),
    });
  },
}; 