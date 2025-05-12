import "@bacons/text-decoder/install";

import { useCallback, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { Stack, useNavigationContainerRef } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";

import "react-native-reanimated";

import { TRPCProvider } from "~/utils/api";

import "../styles.css";

import { Platform } from "react-native";
import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
import {
  appVariant,
  mixpanel,
  revenuecatProjectAppleApiKey,
  revenuecatProjectGoogleApiKey,
} from "@/lib/utils";
import * as Sentry from "@sentry/react-native";
import { vexo } from "vexo-analytics";
import { getOrCreateDeviceId } from "@/utils/device-id";

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: "https://255eae722d27d164a8584b7972656ae7@o4504963099262976.ingest.us.sentry.io/4509253973901312",
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  environment: appVariant,
  tracesSampleRate: 1.0,
  integrations: [navigationIntegration, Sentry.mobileReplayIntegration()],
  release: String(Constants.expoConfig?.version),
  enableNativeFramesTracking: !isRunningInExpoGo(),
  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  sendDefaultPii: true,
  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  spotlight: __DEV__,
});

if (appVariant === "production") {
  vexo("d78c38b5-7df7-44b0-beca-a067b12c15a5");
}

// Set up an instance of Mixpanel
void mixpanel.init();
mixpanel.track("app_opened");

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "/(onboarding)/body-positivity",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const ref = useNavigationContainerRef();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    "Fredoka-Light": require("../assets/fonts/Fredoka/Fredoka-Light.ttf"),
    "Fredoka-Regular": require("../assets/fonts/Fredoka/Fredoka-Regular.ttf"),
    "Fredoka-Medium": require("../assets/fonts/Fredoka/Fredoka-Medium.ttf"),
    "Fredoka-SemiBold": require("../assets/fonts/Fredoka/Fredoka-SemiBold.ttf"),
    "Fredoka-Bold": require("../assets/fonts/Fredoka/Fredoka-Bold.ttf"), // Load custom font
  });

  const initRevenueCat = useCallback(async () => {
    if (appVariant !== "production") {
      await Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    }
    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: revenuecatProjectAppleApiKey });
    } else if (Platform.OS === "android") {
      Purchases.configure({ apiKey: revenuecatProjectGoogleApiKey });
    }
  }, []);

  useEffect(() => {
    void getOrCreateDeviceId();
    void initRevenueCat();
  }, []);

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded or an error occurred
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Prevent rendering until the fonts have loaded or an error occurred
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Render the navigator
  return (
    <TRPCProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" translucent={true} />
        <Stack screenOptions={{ headerShown: false }}>
          {/* The `app/index.tsx` will handle redirection logic */}
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          {/* <Stack.Screen name="(modals)" options={{ presentation: "modal" }} /> */}
          <Stack.Screen name="(modals)" />
        </Stack>
      </GestureHandlerRootView>
    </TRPCProvider>
  );
}

export default Sentry.wrap(RootLayout);
