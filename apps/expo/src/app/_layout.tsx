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
import {
  appVariant,
  revenuecatProjectAppleApiKey,
  revenuecatProjectGoogleApiKey,
} from "@/lib/utils";

import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { isRunningInExpoGo } from "expo";

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: "https://2e5eb231c32a471fb517c336a9e13a54@o4504963099262976.ingest.us.sentry.io/4504963101818880",
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  environment: appVariant,
  tracesSampleRate: 1.0,
  integrations: [navigationIntegration],
  release: String(Constants.expoConfig?.version),
  enableNativeFramesTracking: !isRunningInExpoGo(),
  sendDefaultPii: true,
});

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
    await Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: revenuecatProjectAppleApiKey });
    } else if (Platform.OS === "android") {
      Purchases.configure({ apiKey: revenuecatProjectGoogleApiKey });
    }
  }, []);


  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    void initRevenueCat();
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded or an error occurred
      void SplashScreen.hideAsync();
      Sentry.captureException(new Error("First error"));
    }
  }, [fontsLoaded, fontError, initRevenueCat]);

  // Prevent rendering until the fonts have loaded or an error occurred
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Render the navigator
  return (
    <TRPCProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" translucent={true} />
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
