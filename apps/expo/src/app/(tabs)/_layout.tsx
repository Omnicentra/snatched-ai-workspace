import { cacheImages } from "@/lib/utils";
import { api } from "@/utils/api";
import { authClient } from "@/utils/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";

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
      const imageUrls = workoutData.map((workout) => workout.imageUrl).filter(Boolean) as string[];
      void cacheImages(imageUrls);
    }
  }, [workoutData]);

  useEffect(() => {
    if (!currentWeekPlan && isFetched) {
      generateWorkoutPlan();
    }
  }, [currentWeekPlan, isFetched]);

  useEffect(() => {
    if (mealPlanError) {
      generateMealPlan();
    } else if (mealPlanData) {
      const mealImageUrls = mealPlanData.meals.map((meal) => meal.recipe.imageUrl).filter(Boolean) as string[];
      void cacheImages(mealImageUrls);
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
          tabBarIcon: ({ color }) => (
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
