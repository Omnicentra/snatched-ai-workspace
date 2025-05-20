import { ReactNativeLDClient, AutoEnvAttributes } from "@launchdarkly/react-native-client-sdk";
import Constants from "expo-constants";
import { launchdarklyClientKey } from "./utils";

class LaunchDarklyClient {
  private static instance: ReactNativeLDClient | null = null;
  private static readonly CLIENT_KEY = launchdarklyClientKey;

  private constructor() {
    // Private constructor to prevent direct construction calls with the `new` operator
  }

  public static getInstance(): ReactNativeLDClient {
    LaunchDarklyClient.instance ??= new ReactNativeLDClient(
      LaunchDarklyClient.CLIENT_KEY,
      AutoEnvAttributes.Enabled,
      {
        debug: true,
        applicationInfo: {
          id: "snatched-ai",
          version: Constants.expoConfig?.version,
          name: "snatched-ai",
        },
        initialConnectionMode: 'polling'
      }
    );
    return LaunchDarklyClient.instance;
  }
}

export const launchDarklyClient = LaunchDarklyClient.getInstance(); 