import "@bacons/text-decoder/install";

import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
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

export default function RootLayout() {
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
        <StatusBar style="auto" translucent={true} />
        <Stack screenOptions={{ headerShown: false }}>
          {/* The `app/index.tsx` will handle redirection logic */}
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(modals)" options={{ presentation: "modal" }} />
        </Stack>
      </GestureHandlerRootView>
    </TRPCProvider>
  );
}
