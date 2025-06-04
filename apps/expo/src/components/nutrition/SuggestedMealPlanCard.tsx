import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { nutritionStore$ } from "@/stores/nutrition.store";
import { api } from "@/utils/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";

export const SuggestedMealPlanCard = () => {
  const router = useRouter();
  const isRegenerating = use$(nutritionStore$.isRegenerating);
  const { data: mealPlanData, isLoading: isLoadingMealPlan } =
    api.nutrition.getTodaysMealPlan.useQuery();

  const navigateToMealPlan = () => {
    router.push("/(modals)/meal-plan" as const);
  };

  // Show loading if either the query is loading or the mutation is updating with regeneration
  const isLoading = useMemo(
    () => isLoadingMealPlan || isRegenerating,
    [isLoadingMealPlan, isRegenerating],
  );

  return (
    <View className="mb-8 rounded-3xl bg-white px-6 pb-2 pt-6 shadow-sm">
      <Text className="font-inter-bold mb-6 text-lg text-black">
        Suggested Meal Plan
      </Text>
      {isLoading ? (
        <View className="items-center justify-center py-4">
          <ActivityIndicator color="#F472B6" />
          {isRegenerating && (
            <Text className="font-inter-medium mt-2 text-sm text-gray-500">
              Regenerating meal plan...
            </Text>
          )}
        </View>
      ) : !mealPlanData ? (
        <View className="items-center justify-center py-4">
          <Text className="font-inter-medium text-base text-gray-500">
            No meal plan available
          </Text>
        </View>
      ) : (
        <View className="mb-6 flex-row items-center gap-x-4">
          <View className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-50">
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={26}
              color="#F472B6"
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between gap-x-2">
              <Text className="font-inter-medium mb-1 text-base text-black">
                {mealPlanData.meals.length} meals planned
              </Text>
              <View className="rounded-full bg-pink-100 px-2 py-1">
                <Text className="font-inter-medium text-xs text-pink-700">
                  {mealPlanData.mealPlan.targetCalories} cal
                </Text>
              </View>
            </View>
            <Text className="font-inter text-sm text-gray-500">
              • {mealPlanData.mealPlan.targetProtein}g protein{"\n"}•{" "}
              {mealPlanData.mealPlan.targetCarbs}g carbs {"\n"}•{" "}
              {mealPlanData.mealPlan.targetFats}g fats
            </Text>
          </View>
          <Pressable
            className="self-end rounded-full bg-black px-5 py-2.5"
            onPress={navigateToMealPlan}
          >
            <Text className="font-inter-medium text-sm text-white">View</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};
