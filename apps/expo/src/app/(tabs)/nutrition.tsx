import type { RouterOutputs } from "@/utils/api";
import type { GestureResponderEvent } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MilestoneModal } from "@/app/(modals)/milestone-modal";
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

export default function NutritionPlanScreen() {
  const router = useRouter();
  const [showFoodOptionsModal, setShowFoodOptionsModal] = useState(false);
  const confettiRef = useRef<ConfettiCannon>(null);
  // const { width: screenWidth } = Dimensions.get("window");
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

  // Check if all meals are completed and trigger confetti
  useEffect(() => {
    if (
      mealPlanData?.meals.length &&
      mealPlanData.meals.every((meal) => meal.completed)
    ) {
      confettiRef.current?.start();
    }
  }, [mealPlanData?.meals]);

  // Calculate current macros from completed meals
  const calculateMacros = (macroType: "protein" | "carbs" | "fats") => {
    if (!mealPlanData) return 0;

    return mealPlanData.meals.reduce((acc: number, meal: ScheduledMeal) => {
      if (!meal.completed) return acc;

      if (macroType === "protein") return acc + meal.recipe.proteinGrams;
      if (macroType === "carbs") return acc + meal.recipe.carbsGrams;
      return acc + meal.recipe.fatsGrams;
    }, 0);
  };

  const macros = mealPlanData
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
    : [];

  const navigateToRecipeDetail = (mealId: number) => {
    router.push(`/(modals)/recipe-detail?mealId=${mealId}`);
  };

  const handleToggleComplete = (meal: ScheduledMeal) => {
    toggleMealCompletion({
      mealScheduleId: meal.id,
    });
  };

  return (
    <LinearGradient
      colors={["#e5e7eb", "#fff"]}
      style={{ flexGrow: 1, paddingTop: Constants.statusBarHeight }}
    >
      {/* Confetti Cannon */}
      {/* <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: screenWidth / 2, y: -20 }}
        autoStart={false}
        fadeOut={true}
        explosionSpeed={400}
        fallSpeed={3000}
        colors={["#a855f7", "#ec4899", "#f9a8d4", "#ffffff", "#ddd6fe"]}
      /> */}

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-3 pt-6">
        <Text className="font-inter-bold text-2xl text-black">Nutrition</Text>
      </View>

      {/* Meal Lists */}
      <View className="flex-1 px-6">
        {/* Macro Progress */}
        <View className="mb-8 overflow-hidden rounded-3xl bg-white p-5 shadow-md">
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
                      width: `${(macro.current / macro.target) * 100}%`,
                      backgroundColor: macro.color,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          {/* Meals */}
          <Text className="font-inter-bold mb-4 px-2 text-lg text-black">
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
                onToggleComplete={() => handleToggleComplete(meal)}
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

        {/* Floating Action Button */}
        <View className="absolute bottom-6 right-6">
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

        <View className="h-6" />
      </View>

      {/* <MilestoneModal
        isVisible={showMilestone}
        onClose={() => setShowMilestone(false)}
        type="nutrition"
      /> */}
    </LinearGradient>
  );
}
