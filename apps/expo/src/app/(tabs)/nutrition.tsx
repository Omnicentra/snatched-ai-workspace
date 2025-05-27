import squigglyArrow from "@/assets/images/squiggly-arrow.png";
import { RecentlyLoggedCard } from "@/components/nutrition/RecentlyLoggedCard";
import { SuggestedMealPlanCard } from "@/components/nutrition/SuggestedMealPlanCard";
import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  useWindowDimensions,
  View
} from "react-native";

// Define types for clarity
type MealPlanData = RouterOutputs["nutrition"]["getTodaysMealPlan"];
type ScheduledMeal = MealPlanData["meals"][0];

export default function NutritionPlanScreen() {
  const router = useRouter();
  const [showFoodOptionsModal, setShowFoodOptionsModal] = useState(false);
  const {
    data: mealPlanData,
  } = api.nutrition.getTodaysMealPlan.useQuery();
  const dimensions = useWindowDimensions();
  const { data: recentMeals = [] } = api.nutrition.getRecentlyLoggedMeals.useQuery();

  // Calculate arrow size based on screen dimensions and aspect ratio
  const arrowSize = Math.sqrt(dimensions.width * dimensions.height) * 0.16; // Size based on geometric mean
  const arrowBottom = arrowSize * 0.6; // Position proportional to arrow size

  // Calculate current macros from completed meals
  const calculateMacros = React.useCallback(
    (macroType: "protein" | "carbs" | "fats") => {
      if (!mealPlanData) return 0;

      return mealPlanData.meals.reduce((acc: number, meal: ScheduledMeal) => {
        if (!meal.completed) return acc;

        if (macroType === "protein") return acc + Number(meal.recipe.proteinGrams);
        if (macroType === "carbs") return acc + Number(meal.recipe.carbsGrams);
        return acc + Number(meal.recipe.fatsGrams);
      }, 0);
    },
    [mealPlanData]
  );

  const macros = React.useMemo(
    () =>
      mealPlanData
        ? [
            {
              name: "Protein",
              target: mealPlanData.mealPlan.targetProtein,
              current: calculateMacros("protein"),
              color: "#f472b6",
              icon: "arm-flex-outline" as const,
            },
            {
              name: "Carbs",
              target: mealPlanData.mealPlan.targetCarbs,
              current: calculateMacros("carbs"),
              color: "#60a5fa",
              icon: "barley" as const,
            },
            {
              name: "Fats",
              target: mealPlanData.mealPlan.targetFats,
              current: calculateMacros("fats"),
              color: "#fbbf24",
              icon: "food-drumstick-outline" as const,
            },
          ]
        : [],
    [mealPlanData, calculateMacros]
  );

  return (
    <LinearGradient
      colors={["#e5e7eb", "#fff"]}
      style={{ flexGrow: 1, paddingTop: Constants.statusBarHeight }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-3 pt-6">
        <Text className="font-inter-bold text-2xl text-black">Nutrition</Text>
      </View>

      {/* Meal Lists */}
      <View className="flex-1 px-6">
        {/* Macro Progress */}
        <View className="mb-8 overflow-hidden rounded-3xl bg-white p-5 shadow-sm">
          <View className="flex-row justify-between">
            {macros.map((macro) => (
              <View key={macro.name} className="items-center">
                <View
                  className="mb-2 h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${macro.color}15` }}
                >
                  <MaterialCommunityIcons
                    name={macro.icon}
                    size={24}
                    color={macro.color}
                  />
                </View>
                <View className="items-center">
                  <Text className="font-inter-medium text-xs text-gray-500">
                    {macro.name}
                  </Text>
                  <Text className="font-inter-bold text-2xl text-gray-900">
                    {macro.current}
                    <Text className="font-inter-medium text-base">g</Text>
                  </Text>
                  <Text className="font-inter-medium text-xs text-gray-500">
                    of {macro.target}g
                  </Text>
                </View>
                <View className="mt-3 h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                  <View
                    className="h-full"
                    style={{
                      width: `${(macro.current / Number(macro.target)) * 100}%`,
                      backgroundColor: macro.color,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="flex-1">
          {/* Suggested Meal Plan Card */}
          <SuggestedMealPlanCard />

          {/* Recently Logged Card */}
          <RecentlyLoggedCard className="shadow-sm bg-white" />
        </View>

        {/* Floating Action Button with Squiggly Arrow */}
        <View className="absolute bottom-6 right-6">
          {recentMeals.length === 0 && (
            <View 
              style={{
                position: 'absolute',
                bottom: arrowBottom,
                right: 0,
              }}
            >
              <Image
                source={squigglyArrow}
                style={{ 
                  width: arrowSize,
                  height: arrowSize,
                  transform: [{ rotate: "0deg" }]
                }}
                contentFit="contain"
              />
            </View>
          )}
          <Pressable
            className="h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-pink-500 shadow-lg shadow-pink-500/30"
            onPress={() => setShowFoodOptionsModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={36} color="white" />
          </Pressable>
        </View>

        {/* Food Options Modal */}
        <Modal
          visible={showFoodOptionsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFoodOptionsModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="rounded-t-3xl bg-transparent p-6">
              <View className="mb-6 flex-row items-center justify-end">
                <Pressable
                  className="rounded-full bg-gray-100 p-2"
                  onPress={() => setShowFoodOptionsModal(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </Pressable>
              </View>
              <View className="mb-2 flex-row items-center rounded-xl px-4 py-4 gap-x-4 hover:bg-gray-50">
                <Pressable
                  className="mb-2 flex-1 items-center rounded-xl bg-white px-4 py-4 hover:bg-gray-50"
                  onPress={() => {
                    setShowFoodOptionsModal(false);
                    router.push("/(modals)/saved-foods");
                  }}
                >
                  <MaterialCommunityIcons
                    name="bookmark-outline"
                    size={24}
                    color="#666"
                  />
                  <View className="ml-3">
                    <Text className="font-inter-semibold text-gray-800">
                      Saved Foods
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  className="mb-2 flex-1 items-center rounded-xl bg-white px-4 py-4 hover:bg-gray-50"
                  onPress={() => {
                    setShowFoodOptionsModal(false);
                    router.push("/(modals)/meal-scan");
                  }}
                >
                  <MaterialCommunityIcons
                    name="camera"
                    size={24}
                    color="#666"
                  />
                  <View className="ml-3">
                    <Text className="font-inter-semibold text-gray-800">
                      Scan Food
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
}
