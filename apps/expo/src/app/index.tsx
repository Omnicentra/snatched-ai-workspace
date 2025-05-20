import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { authClient } from "@/utils/auth";
import * as SplashScreen from "expo-splash-screen";
import { logger } from "@/lib/logger";

// Check onboarding completion status from SecureStore
const checkOnboardingStatus = async () => {
  try {
    const secureStoreFlag = await SecureStore.getItemAsync("onboarding_complete");
    return secureStoreFlag === "true";
  } catch {
    return false; // Default to showing onboarding if error
  }
};

export default function AppEntry() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState(false);
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  useEffect(() => {
    async function initializeApp() {
      try {
        // Check onboarding status
        const completed = await checkOnboardingStatus();
        setIsOnboardingComplete(completed);
        
        // Wait for session check to complete
        if (!isSessionLoading) {
          // Only hide splash screen when both checks are complete
          await SplashScreen.hideAsync();
          setIsLoading(false);
        }
      } catch (error) {
        logger.error("Error during app initialization:", error);
        // Hide splash screen even if there's an error
        await SplashScreen.hideAsync();
        setIsLoading(false);
      }
    }

    void initializeApp();
  }, [isSessionLoading]); // Re-run when session loading state changes

  // Show loading spinner while checking status
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  // If onboarding is not complete, go to onboarding flow
  if (!isOnboardingComplete) {
    return <Redirect href="/(onboarding)" />;
  }

  // If onboarding is complete but no session, go to auth
  if (!session?.user) {
    return <Redirect href="/(auth)/login" />;
  }

  // If both onboarding is complete and user is authenticated, go to home
  return <Redirect href="/(tabs)/home" />;
}
