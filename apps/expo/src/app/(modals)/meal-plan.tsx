import type { RouterOutputs } from "@/utils/api";
import React, { useRef } from "react";
import type {
  GestureResponderEvent} from "react-native";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BackButton } from "@/components/common/BackButton";
import { api } from "@/utils/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Define types for clarity
type MealPlanData = RouterOutputs["nutrition"]["getTodaysMealPlan"];
type ScheduledMeal = MealPlanData["meals"][0];

// Macro Pill Component
const MacroPill = ({
  label,
  amount,
  unit = "g",
}: {
  label: string;
  amount: number;
  unit?: string;
}) => (
  <View className="flex-row items-center rounded-xl bg-gray-50 px-1.5 py-2.5">
    <Text className="font-inter-medium text-sm text-gray-900">
      {amount}
      {unit}
    </Text>
    <Text className="font-inter ml-1 text-xs text-gray-500">{label}</Text>
  </View>
);

// Meal Card Component
const MealCard = ({
  title,
  calories,
  proteinGrams,
  carbsGrams,
  fatsGrams,
  imageUrl,
  time,
  completed,
  onPress,
  onToggleComplete,
}: {
  title: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  imageUrl: string | null;
  time: string;
  completed: boolean;
  onPress: () => void;
  onToggleComplete: (e: GestureResponderEvent) => void;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(completed ? 2 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = (e: GestureResponderEvent) => {
    e.stopPropagation();

    // Reset opacity to 1 before starting new animation
    opacityAnim.setValue(1);

    // Start animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: completed ? 0 : 2,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ]),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onToggleComplete(e);
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const defaultImage =
    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 overflow-hidden rounded-2xl bg-white"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
      }}
    >
      <View className="flex-row flex-wrap">
        <View className="flex-1 p-4">
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-inter-medium text-sm text-gray-500">
              {time}
            </Text>
            <View className="flex-row items-center gap-x-2">
              <Text className="font-inter text-sm text-primary">
                {calories} cal
              </Text>
              {completed ? (
                <Animated.View
                  style={{
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }, { rotate: spin }],
                  }}
                >
                  <Pressable
                    onPress={handleToggle}
                    className="rounded-full bg-green-100 p-1"
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#22C55E"
                    />
                  </Pressable>
                </Animated.View>
              ) : (
                <Animated.View
                  style={{
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }, { rotate: spin }],
                  }}
                >
                  <Pressable
                    onPress={handleToggle}
                    className="rounded-full bg-pink-50 p-1"
                  >
                    <MaterialCommunityIcons
                      name="plus-circle"
                      size={20}
                      color="#F472B6"
                    />
                  </Pressable>
                </Animated.View>
              )}
            </View>
          </View>
          <Text
            className="font-inter-semibold mb-3 text-lg text-gray-900"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          <View className="flex-row gap-2">
            <MacroPill label="protein" amount={proteinGrams} />
            <MacroPill label="carbs" amount={carbsGrams} />
            <MacroPill label="fats" amount={fatsGrams} />
          </View>
        </View>
        <View className="h-36 w-36">
          <Image
            source={{ uri: imageUrl ?? defaultImage }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
            }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            placeholder={defaultImage}
          />
        </View>
      </View>
    </Pressable>
  );
};

export default function MealPlanScreen() {
  const router = useRouter();
  const utils = api.useUtils();
  const {
    data: mealPlanData,
    isLoading: isLoadingMealPlan,
    refetch,
    isRefetching,
  } = api.nutrition.getTodaysMealPlan.useQuery();

  const { mutate: toggleMealCompletion } =
    api.nutrition.toggleMealCompletion.useMutation({
      onSuccess: () => {
        void refetch();
        void utils.nutrition.getUserMealSchedules.invalidate();
        void utils.nutrition.getRecentlyLoggedMeals.invalidate();
      },
      onError: (error) => {
        console.error("Failed to toggle meal completion:", error);
      },
    });

  const handleToggleComplete = (meal: ScheduledMeal) => {
    toggleMealCompletion({
      mealScheduleId: meal.id,
    });
  };

  const navigateToRecipeDetail = (mealId: number) => {
    router.push(`/(modals)/recipe-detail?mealId=${mealId}`);
  };

  return (
    <LinearGradient
      colors={["#e5e7eb", "#fff"]}
      style={{ flexGrow: 1, paddingTop: Constants.statusBarHeight }}
    >
      <View className="px-6 py-4">
        <BackButton title="Meal Plan" />
      </View>
      <View className="flex-1 px-6">
        {/* Macro Goals */}
        <Text className="font-inter-bold mb-4 mt-4 text-lg text-black">
          Daily Goals
        </Text>
        <View
          className="mb-8 overflow-hidden rounded-2xl bg-white p-5 shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: 5,
          }}
        >
          <View className="flex-row justify-between">
            <View className="items-center">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-xl bg-pink-50">
                <MaterialCommunityIcons name="fire" size={24} color="#F472B6" />
              </View>
              <Text className="font-inter-medium text-xs text-gray-500">
                Calories
              </Text>
              <Text className="font-inter-bold text-lg text-black">
                {mealPlanData?.mealPlan.targetCalories}
              </Text>
            </View>
            <View className="items-center">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-xl bg-pink-50">
                <MaterialCommunityIcons
                  name="arm-flex-outline"
                  size={24}
                  color="#F472B6"
                />
              </View>
              <Text className="font-inter-medium text-xs text-gray-500">
                Protein
              </Text>
              <Text className="font-inter-bold text-lg text-black">
                {mealPlanData?.mealPlan.targetProtein}g
              </Text>
            </View>
            <View className="items-center">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-xl bg-pink-50">
                <MaterialCommunityIcons
                  name="barley"
                  size={24}
                  color="#F472B6"
                />
              </View>
              <Text className="font-inter-medium text-xs text-gray-500">
                Carbs
              </Text>
              <Text className="font-inter-bold text-lg text-black">
                {mealPlanData?.mealPlan.targetCarbs}g
              </Text>
            </View>
            <View className="items-center">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-xl bg-pink-50">
                <MaterialCommunityIcons
                  name="food-drumstick-outline"
                  size={24}
                  color="#F472B6"
                />
              </View>
              <Text className="font-inter-medium text-xs text-gray-500">
                Fats
              </Text>
              <Text className="font-inter-bold text-lg text-black">
                {mealPlanData?.mealPlan.targetFats}g
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          {/* Today's Meals */}
          <Text className="font-inter-bold mb-4 text-lg text-black">
            Today's Meals
          </Text>
          {isLoadingMealPlan ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#f472b6" />
              <Text className="font-inter mt-2 text-gray-500">
                Loading meals...
              </Text>
            </View>
          ) : mealPlanData?.meals.length ? (
            mealPlanData.meals.map((meal) => (
              <MealCard
                key={meal.id}
                title={meal.recipe.title}
                calories={meal.recipe.calories}
                proteinGrams={meal.recipe.proteinGrams}
                carbsGrams={meal.recipe.carbsGrams}
                fatsGrams={meal.recipe.fatsGrams}
                imageUrl={meal.recipe.imageUrl}
                time={meal.scheduledTime}
                completed={meal.completed}
                onPress={() => navigateToRecipeDetail(meal.recipe.id)}
                onToggleComplete={handleToggleComplete}
              />
            ))
          ) : (
            <View className="items-center justify-center py-8">
              <Text className="font-inter text-gray-500">
                No meals available.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}
