import React, { useEffect } from "react";
import { Platform } from "react-native";
import { Image } from "expo-image";
import { Tabs } from "expo-router";
import { api } from "@/utils/api";
import { authClient } from "@/utils/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";

export default function TabLayout() {
  const { data: session } = authClient.useSession();
  // Get the workouts from API data
  const { data: workoutData } = api.workout.getWorkouts.useQuery();
  // Get the categories from API data
  api.workout.getWorkoutCategories.useQuery();
  api.workout.getUserWorkoutStats.useQuery({
    period: "week",
  });
  const {
    data: mealPlanData,
    error: mealPlanError,
    refetch: refetchMealPlan,
  } = api.nutrition.getTodaysMealPlan.useQuery(undefined, {
    enabled: !!session?.user,
    retry: false,
  });
  const { data: currentWeekPlan, isFetched } =
    api.workout.getCurrentWeekPlan.useQuery(undefined, {
      enabled: !!session?.user,
      retry: false,
    });
  const { mutate: generateMealPlan } =
    api.nutrition.generateMealPlan.useMutation({
      onSuccess: () => {
        void refetchMealPlan()
      },
      onError: (error) => {
        console.error(error);
      },
    });
  const { mutate: generateWorkoutPlan } =
    api.workout.generateWeeklyPlan.useMutation({
      onSuccess: () => {
        console.log("Workout plan generated");
      },
    });

  useEffect(() => {
    if (workoutData) {
      workoutData.forEach((workout) => {
        if (workout.imageUrl) {
          void Image.prefetch(workout.imageUrl);
        }
      });
    }
  }, [workoutData]);

  useEffect(() => {
    if (!currentWeekPlan && isFetched) {
      generateWorkoutPlan();
    }
  }, [currentWeekPlan, isFetched,]);

  useEffect(() => {
    if (mealPlanError) {
      generateMealPlan();
      Sentry.captureException(mealPlanError);
    } else if (mealPlanData) {
      mealPlanData.meals.forEach((meal) => {
        if (meal.recipe.imageUrl) {
          void Image.prefetch(meal.recipe.imageUrl);
        }
      });
    }
  }, [mealPlanError, mealPlanData]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#f472b6",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          height: Platform.OS === "ios" ? 87 : 60,
          paddingBottom: Platform.OS === "ios" ? 30 : 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter_500Medium",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Snatched",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name="chart-bar-stacked"
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="dumbbell" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition-old"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
