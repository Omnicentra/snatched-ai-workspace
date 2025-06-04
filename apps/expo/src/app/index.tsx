import React, { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { logger } from "@/lib/logger";
import { cacheImages } from "@/lib/utils";
import { api } from "@/utils/api";
import { authClient } from "@/utils/auth";
import { useLDClient } from "@launchdarkly/react-native-client-sdk";
import * as Sentry from "@sentry/react-native";
import { getOrCreateDeviceId } from "@/utils/device-id";

// Check onboarding completion status from SecureStore
const checkOnboardingStatus = async () => {
  try {
    const secureStoreFlag = await SecureStore.getItemAsync(
      "onboarding_complete",
    );
    return secureStoreFlag === "true";
  } catch {
    return false; // Default to showing onboarding if error
  }
};

export default function AppEntry() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDataReady, setIsDataReady] = React.useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState(false);
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const ldc = useLDClient();

  // Prefetch API data when user is authenticated
  const { data: workoutData } = api.workout.getWorkouts.useQuery(undefined, {
    enabled: !!session?.user,
  });
  const {
    data: mealPlanData,
    error: mealPlanError,
    refetch: refetchMealPlan,
    isFetched: isMealPlanFetched,
  } = api.nutrition.getTodaysMealPlan.useQuery(undefined, {
    retry: false,
    enabled: !!session?.user,
  });
  const {
    data: currentWeekPlan,
    isFetched: isWorkoutPlanFetched,
    refetch: refetchWorkoutPlan,
  } = api.workout.getCurrentWeekPlan.useQuery(undefined, {
    retry: false,
    enabled: !!session?.user,
  });

  // Prefetch other data
  const { isFetched: isWorkoutClassesFetched } = api.workout.getWorkoutClasses.useQuery(undefined, {
    enabled: !!session?.user,
  });
  const { isFetched: isCategoriesFetched } = api.workout.getWorkoutCategories.useQuery(undefined, {
    enabled: !!session?.user,
  });
  const { isFetched: isSnatchHacksFetched } =
    api.snatchHack.getSnatchHacks.useQuery(undefined, {
      enabled: !!session?.user,
      retry: false,
    });
  const { isFetched: isStatsFetched } =
    api.workout.getUserWorkoutStats.useQuery(
      { period: "week" },
      { retry: false, enabled: !!session?.user },
    );
  const { data: recipes, isFetched: isRecipesFetched } =
    api.nutrition.getRecipesByUser.useQuery(undefined, {
      enabled: !!session?.user,
      retry: false,
    });

  // Generate meal plan if needed
  const { mutate: generateMealPlan } =
    api.nutrition.generateMealPlan.useMutation({
      onSuccess: () => {
        void refetchMealPlan();
      },
      onError: (error) => {
        Sentry.captureException(error);
      },
    });

  // Generate workout plan if needed
  const { mutate: generateWorkoutPlan } =
    api.workout.generateWeeklyPlan.useMutation({
      onSuccess: () => {
        void refetchWorkoutPlan();
      },
      onError: (error) => {
        Sentry.captureException(error);
      },
    });

  // Cache images when workout data is available
  useEffect(() => {
    if (workoutData) {
      const imageUrls = workoutData
        .map((workout) => workout.imageUrl)
        .filter(Boolean) as string[];
      void cacheImages(imageUrls);
    }
  }, [workoutData]);

  // Cache meal images when data is available
  useEffect(() => {
    if (mealPlanData) {
      const mealImageUrls = mealPlanData.meals
        .map((meal) => meal.recipe.imageUrl)
        .filter(Boolean) as string[];
      void cacheImages(mealImageUrls);
    }
  }, [mealPlanData]);

  // Handle missing workout plan
  useEffect(() => {
    if (!currentWeekPlan && isWorkoutPlanFetched) {
      logger.info("Generating workout plan", { cause: currentWeekPlan });
      generateWorkoutPlan();
    }
  }, [currentWeekPlan, isWorkoutPlanFetched, generateWorkoutPlan]);

  // Handle missing meal plan
  useEffect(() => {
    if (mealPlanError) {
      logger.info("Generating meal plan", { cause: mealPlanError });
      generateMealPlan();
    }
  }, [mealPlanError, generateMealPlan]);

  useEffect(() => {
    if (recipes) {
      void cacheImages(
        recipes.map((recipe) => recipe.imageUrl).filter(Boolean) as string[],
      );
    }
  }, [recipes]);

  // Check if all data is ready
  useEffect(() => {
    if (!isSessionPending && !session) {
      setIsDataReady(true);
      return;
    }

    const isAllDataReady = !isSessionPending &&
      isWorkoutClassesFetched &&
      isSnatchHacksFetched &&
      isCategoriesFetched &&
      isStatsFetched &&
      isRecipesFetched &&
      isMealPlanFetched &&
      isWorkoutPlanFetched;

    setIsDataReady(isAllDataReady);
  }, [
    isSessionPending,
    isWorkoutClassesFetched,
    isSnatchHacksFetched,
    isCategoriesFetched,
    isStatsFetched,
    isRecipesFetched,
    isMealPlanFetched,
    isWorkoutPlanFetched,
  ]);

  useEffect(() => {
    async function initializeApp() {
      logger.info("Initializing app", { isDataReady, isOnboardingComplete, session: session?.user });
      try {
        // Check onboarding status
        const completed = await checkOnboardingStatus();
        setIsOnboardingComplete(completed);
        const deviceId = await getOrCreateDeviceId();

        // Hide splash screen only after data is ready
        if (isDataReady) {
          if (session?.user) {
            // Identify user with LaunchDarkly
            void ldc.identify({
              kind: "multi",
              user: {
                key: session.user.email,
                name: session.user.name,
                email: session.user.email,
                avatar: session.user.image ?? "",
              },
              device: {
                key: deviceId,
                type: Platform.OS,
              },
            });
          }
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
  }, [isDataReady]); // Re-run when session loading or data ready state changes

  // Show loading spinner while checking status
  if (isLoading || !isDataReady) {
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
