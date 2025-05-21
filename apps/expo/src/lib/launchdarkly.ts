import { ReactNativeLDClient, AutoEnvAttributes } from "@launchdarkly/react-native-client-sdk";
import Constants from "expo-constants";
import { appVariant, launchdarklyClientKey } from "./utils";
import { logger } from "./logger";

class LaunchDarklyClient {
  private static instance: ReactNativeLDClient | null = null;
  private static readonly CLIENT_KEY = launchdarklyClientKey;

  private constructor() {
    // Private constructor to prevent direct construction calls with the `new` operator
  }

  public static getInstance(): ReactNativeLDClient {
    logger.info(launchdarklyClientKey);
    LaunchDarklyClient.instance ??= new ReactNativeLDClient(
      LaunchDarklyClient.CLIENT_KEY,
      AutoEnvAttributes.Enabled,
      {
        debug: appVariant === 'development',
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