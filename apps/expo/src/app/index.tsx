import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { authClient } from "@/utils/auth";
import * as SplashScreen from "expo-splash-screen";
import { logger } from "@/lib/logger";
import { useLDClient } from "@launchdarkly/react-native-client-sdk";
import { api } from "@/utils/api";
import { cacheImages } from "@/lib/utils";

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
  const ldc = useLDClient();
  
  // Prefetch API data when user is authenticated
  const { data: workoutData } = api.workout.getWorkouts.useQuery(undefined, {
    enabled: !!session?.user,
  });
  const { data: mealPlanData, error: mealPlanError, refetch: refetchMealPlan } = 
    api.nutrition.getTodaysMealPlan.useQuery(undefined, {
      retry: false,
      enabled: !!session?.user,
    });
  const { data: currentWeekPlan, isFetched, refetch: refetchWorkoutPlan } = 
    api.workout.getCurrentWeekPlan.useQuery(undefined, {
      retry: false,
      enabled: !!session?.user,
    });
  
  // Prefetch other data
  api.snatchHack.getSnatchHacks.useQuery(undefined, { enabled: !!session?.user });
  api.workout.getWorkoutCategories.useQuery(undefined, { enabled: !!session?.user });
  api.workout.getUserWorkoutStats.useQuery(
    { period: "week" }, 
    { retry: false, enabled: !!session?.user }
  );
  const { data: recipes } = api.nutrition.getRecipesByUser.useQuery(undefined, { enabled: !!session?.user });
  
  // Generate meal plan if needed
  const { mutate: generateMealPlan } = api.nutrition.generateMealPlan.useMutation({
    onSuccess: () => {
      void refetchMealPlan();
    },
    onError: (error) => {
      logger.error("Error generating meal plan:", error);
    },
  });

  // Generate workout plan if needed
  const { mutate: generateWorkoutPlan } = api.workout.generateWeeklyPlan.useMutation({
    onSuccess: () => {
      void refetchWorkoutPlan();
    },
  });

  // Cache images when workout data is available
  useEffect(() => {
    if (workoutData) {
      const imageUrls = workoutData.map((workout) => workout.imageUrl).filter(Boolean) as string[];
      void cacheImages(imageUrls);
    }
  }, [workoutData]);

  // Cache meal images when data is available
  useEffect(() => {
    if (mealPlanData) {
      const mealImageUrls = mealPlanData.meals.map((meal) => meal.recipe.imageUrl).filter(Boolean) as string[];
      void cacheImages(mealImageUrls);
    }
  }, [mealPlanData]);

  // Handle missing workout plan
  useEffect(() => {
    if (!currentWeekPlan && isFetched) {
      generateWorkoutPlan();
    }
  }, [currentWeekPlan, isFetched, generateWorkoutPlan]);

  // Handle missing meal plan
  useEffect(() => {
    if (mealPlanError) {
      generateMealPlan();
    }
  }, [mealPlanError, generateMealPlan]);

  useEffect(() => {
    if (recipes) {
      void cacheImages(recipes.map((recipe) => recipe.imageUrl).filter(Boolean) as string[]);
    }
  }, [recipes]);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Check onboarding status
        const completed = await checkOnboardingStatus();
        setIsOnboardingComplete(completed);
        
        // Wait for session check to complete
        if (!isSessionLoading) {
          if (session?.user) {
            // Identify user with LaunchDarkly
            void ldc.identify({
              kind: 'user',
              key: session.user.email,
              name: session.user.name,
              email: session.user.email,
              avatar: session.user.image ?? '',
            });
            // Brief delay to allow initial data fetching
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // Hide splash screen and immediately start navigation
          // by setting isLoading to false in the same tick
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

  // If onboarding is complete and user is authenticated, go to home
  if (session?.user) {
    return <Redirect href="/(tabs)/home" />;
  }

  // If user is not authenticated, go to login
  return <Redirect href="/(auth)/login" />;
}
