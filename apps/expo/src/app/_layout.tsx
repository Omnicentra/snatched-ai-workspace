import "@bacons/text-decoder/install";

import { useCallback, useEffect, useRef } from "react";
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
import { useAssets } from 'expo-asset';
import { launchDarklyClient } from "@/lib/launchdarkly";

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
import { checkNotificationPermissions, initializeNotifications } from "@/lib/notifications";
import { logger } from "@/lib/logger";
import * as Notifications from "expo-notifications";
import { LDProvider } from "@launchdarkly/react-native-client-sdk";

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: "https://255eae722d27d164a8584b7972656ae7@o4504963099262976.ingest.us.sentry.io/4509253973901312",
  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  environment: appVariant,
  tracesSampleRate: 1.0,
  integrations: [],
  release: String(Constants.expoConfig?.version),
  enableNativeFramesTracking: !isRunningInExpoGo(),
  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  sendDefaultPii: true,
  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  spotlight: __DEV__,
});

// Setup Vexo
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
  // Use a ref to track whether notifications were initialized in this session
  const notificationsInitialized = useRef(false);
  
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

  const [assetsLoaded, assetsError] = useAssets([
    require('@/assets/images/yoga_pose.png'),
    require('@/assets/images/wreath.png'),
    require('@/assets/images/logo_dark.png'),
    require('@/assets/images/body_silhouette.png'),
    require('@/assets/images/logo2.png'),
    require('@/assets/images/silhouette_back.png'),
    require('@/assets/images/body_positivity.png'),
    require('@/assets/images/silhouette_front.png'),
    require('@/assets/images/before_after.jpeg'),
    require('@/assets/images/silhouette_side.png'),
    require('@/assets/images/testimonials/image1.jpeg'),
    require('@/assets/images/testimonials/image2.jpeg'),
    require('@/assets/images/testimonials/image3.jpeg'),
    require('@/assets/icons/body-parts/waist_definition.png'),
    require('@/assets/icons/body-parts/arm_shape.png'),
    require('@/assets/icons/body-parts/glute_shape.png'),
    require('@/assets/icons/body-parts/hip_curve.png'),
    require('@/assets/icons/body-parts/back_definition.png'),
    require('@/assets/icons/body-parts/posture.png'),
  ]);

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

  // Set up notification response listeners only once
  const setupNotificationListeners = useCallback(() => {
    // Set up listener for notification received while app is running
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        logger.info("Notification received in foreground:", notification);
      },
    );
    
    // Set up listener for notification interactions
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        logger.info("Notification interaction:", data);
        // Handle notification interaction here
      },
    );
    
    // Return cleanup function
    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const checkAndSetupNotifications = useCallback(async () => {
    try {
      // Only run once per app session
      if (notificationsInitialized.current) {
        return;
      }
      
      // Check if notifications permission is granted
      const permissionGranted = await checkNotificationPermissions();
      
      // Only verify notifications if permission is granted
      if (permissionGranted) {
        // Check for pending notifications to see if we need to reschedule
        const pendingNotifications = await Notifications.getAllScheduledNotificationsAsync();
        
        // Initialize only if there are no pending notifications
        if (pendingNotifications.length === 0) {
          logger.info("No scheduled notifications found, initializing now");
          await initializeNotifications();
        } else {
          logger.info(`Found ${pendingNotifications.length} scheduled notifications, skipping initialization`);
        }
      } else {
        logger.info("Notifications not initialized: no permission");
      }
      
      // Mark as initialized for this session
      notificationsInitialized.current = true;
    } catch (error) {
      logger.error("Error checking notifications:", error instanceof Error ? error.message : String(error));
    }
  }, []);

  useEffect(() => {
    void getOrCreateDeviceId();
    void initRevenueCat();
    void checkAndSetupNotifications();
    
    // Set up notification listeners
    const cleanupListeners = setupNotificationListeners();
    
    // Return cleanup function
    return cleanupListeners;
  }, [initRevenueCat, checkAndSetupNotifications, setupNotificationListeners]);

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  // Prevent rendering until the fonts and assets have loaded or an error occurred
  if ((!fontsLoaded && !fontError) || !assetsLoaded) {
    return null;
  }

  // Render the navigator
  return (
    <LDProvider client={launchDarklyClient}>
      <TRPCProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark" translucent={true} />
        <Stack screenOptions={{ headerShown: false }}>
          {/* The `app/index.tsx` will handle redirection logic */}
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          {/* <Stack.Screen name="(modals)" options={{ presentation: "modal" }} /> */}
          <Stack.Screen name="(modals)" />
        </Stack>
      </GestureHandlerRootView>
    </TRPCProvider>
    </LDProvider>
  );
}

export default Sentry.wrap(RootLayout);
