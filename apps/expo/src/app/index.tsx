import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { authClient } from "@/utils/auth";

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
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState<boolean | null>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const checkStatus = async () => {
      const completed = await checkOnboardingStatus();
      setIsOnboardingComplete(completed);
    };
    void checkStatus();
  }, []); // Only check once on mount

  if (isOnboardingComplete === null) {
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
