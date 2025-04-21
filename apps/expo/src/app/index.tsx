import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";

// Basic check for onboarding completion (replace with more robust logic)
const checkOnboardingStatus = async () => {
  try {
    const value = await SecureStore.getItemAsync("@onboarding_complete");
    return value === "true";
  } catch (e) {
    return false; // Default to showing onboarding if error
  }
};

export default function AppEntry() {
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState<
    boolean | null
  >(null);

  useEffect(() => {
    const checkStatus = async () => {
      const completed = await checkOnboardingStatus();
      setIsOnboardingComplete(completed);
    };
    void checkStatus();
  }, []);

  if (isOnboardingComplete === null) {
    // Show loading indicator while checking status
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.log("isOnboardingComplete", isOnboardingComplete);

  // Redirect based on onboarding status
  if (isOnboardingComplete) {
    return <Redirect href="/(tabs)/home" />;
  } else {
    return <Redirect href="/(onboarding)" />; // Redirects to onboarding/index.tsx
  }
}
