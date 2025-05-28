import { logger } from './logger';
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
      logger.debug("trackOnboardingScreenView", {
        screenName,
        deviceId,
        userId,
        visitedScreens: Array.from(visitedScreens),
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
    console.log({visitedScreens});
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
      interval: 'week' | 'month' | 'year';
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

  trackPrepareScanAction: (deviceId: string, userId: string | undefined, action: 'continue' | 'skip') => {
    void mixpanel.track('prepare_scan_action', {
      device_id: deviceId,
      user_id: userId,
      action,
      timestamp: new Date().toISOString(),
    });
  },

  trackSpecialOfferView: (deviceId: string, userId?: string) => {
    void mixpanel.track('special_offer_viewed', {
      device_id: deviceId,
      user_id: userId,
      discount_percentage: 80,
      timestamp: new Date().toISOString(),
    });
  },

  trackSpecialOfferPurchase: (
    deviceId: string,
    userId: string,
    planDetails: {
      planId: string;
      planName: string;
      price: number;
      currency: string;
    }
  ) => {
    void mixpanel.track('special_offer_purchased', {
      device_id: deviceId,
      user_id: userId,
      ...planDetails,
      discount_percentage: 80,
      timestamp: new Date().toISOString(),
    });
  },
}; 