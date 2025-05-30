import { ReactNativeLDClient, AutoEnvAttributes } from "@launchdarkly/react-native-client-sdk";
import Constants from "expo-constants";
import { appVariant } from "./utils";
import { logger } from "./logger";

class LaunchDarklyClient {
  private static instance: ReactNativeLDClient | null = null;
  // private static readonly CLIENT_KEY = launchdarklyClientKey;

  private constructor() {
    // Private constructor to prevent direct construction calls with the `new` operator
  }

  public static getInstance(): ReactNativeLDClient {
    LaunchDarklyClient.instance ??= new ReactNativeLDClient(
      appVariant === 'development' ? 'mob-a16cc7b3-1fbb-465c-a5f4-d23c83d5858c' : 'mob-d140af0b-c264-48cf-be94-09afc4eb6682',
      AutoEnvAttributes.Enabled,
      {
        debug: false,
        applicationInfo: {
          id: "snatched-ai",
          version: Constants.expoConfig?.version,
          name: "snatched-ai",
        },
      }
    );
    return LaunchDarklyClient.instance;
  }
}

export const launchDarklyClient = LaunchDarklyClient.getInstance();

// Helper functions for A/B testing
export const LaunchDarklyFlags = {
  // Onboarding A/B test flag
  SKIP_BLOCKERS_FREQUENCY: 'skip-blockers-frequency-screens',
  CAN_RESET_ONBOARDING: 'can-reset-onboarding',
} as const;

export const ExperimentService = {
  /**
   * Check if user should skip blockers and frequency screens
   * Returns true if user is in Test B (skip screens)
   */
  shouldSkipBlockersFrequency: (deviceId?: string): boolean => {
    try {
      // If we have a device ID, identify them with LaunchDarkly
      if (deviceId) {
        void launchDarklyClient.identify({ key: deviceId, kind: 'ld_device' });
      }
      
      return launchDarklyClient.boolVariation(
        LaunchDarklyFlags.SKIP_BLOCKERS_FREQUENCY, 
        false // default to false (show screens)
      );
    } catch (error) {
      logger.error('Error checking skip blockers frequency flag:', error);
      return false; // Default to showing screens on error
    }
  },

  /**
   * Track experiment participation for analytics
   */
  trackExperimentParticipation: (
    deviceId?: string,
    email?: string,
    skipScreens = false
  ): void => {
    try {
      // Track which variant the user is in
      const variant = skipScreens ? 'test_b_skip' : 'test_a_show';
      
      // LaunchDarkly will automatically track this as an experiment event
      // when the flag is tied to an experiment in the dashboard
      logger.info('User in onboarding experiment variant:', variant, { deviceId, email });
    } catch (error) {
      logger.error('Error tracking experiment participation:', error);
    }
  },
}; 