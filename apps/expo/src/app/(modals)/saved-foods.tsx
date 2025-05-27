import React, { useState, useRef, useCallback } from "react";
import type { GestureResponderEvent } from "react-native";
import { Modal, Pressable, ScrollView, Text, View, Animated, Easing, RefreshControl } from "react-native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { api } from "@/utils/api";
import type { RouterOutputs } from "@/utils/api";
import { MEAL_TYPES } from "@omc/validators/nutrition";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { BackButton } from "@/components/common/BackButton";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

type Recipe = RouterOutputs["nutrition"]["getRecipesByUser"][number];

interface AnimationValues {
  scaleAnim: Animated.Value;
  rotateAnim: Animated.Value;
  opacityAnim: Animated.Value;
}

export default function SavedFoodsScreen() {
  const router = useRouter();
  const utils = api.useUtils();
  const [isRefreshing, setRefreshing] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Recipe | null>(null);
  const [mealTypeModalVisible, setMealTypeModalVisible] = useState(false);

  const { data: meals, refetch: refetchMeals } = api.nutrition.getRecipesByUser.useQuery();
  const { data: recentMeals = [], refetch: refetchRecentMeals } = api.nutrition.getRecentlyLoggedMeals.useQuery();
  const { mutate: toggleMealCompletionByRecipeId } = api.mealSchedule.toggleMealCompletionByRecipeId.useMutation({
    onSuccess: () => {
      void refetchMeals();
      void refetchRecentMeals();
      void utils.nutrition.getTodaysMealPlan.invalidate();
      void utils.nutrition.getUserMealSchedules.invalidate();
    },
  });
  const { mutate: toggleFavorite } = api.nutrition.toggleFavoriteRecipe.useMutation({
    onSuccess: () => {
      void utils.nutrition.getRecipesByUser.invalidate();
    },
  });
  const { mutate: logMeal, isPending } = api.nutrition.logSavedMeal.useMutation({
    onSuccess: () => {
      setMealTypeModalVisible(false);
      setSelectedMeal(null);
      void refetchMeals();
      void utils.nutrition.getTodaysMealPlan.invalidate();
      void utils.nutrition.getRecentlyLoggedMeals.invalidate();
      router.back();
    },
  });

  // Animation refs for each meal
  const animationRefs = useRef<Record<number, AnimationValues>>({});

  // Check if a meal has been logged today
  const isMealLoggedToday = useCallback((mealId: number) => {
    return recentMeals.some(loggedMeal => loggedMeal.recipe.id === mealId);
  }, [recentMeals]);

  // Initialize animation values for a meal
  const getAnimatedValues = (mealId: number) => {
    if (!animationRefs.current[mealId]) {
      const isLogged = isMealLoggedToday(mealId);
      animationRefs.current[mealId] = {
        scaleAnim: new Animated.Value(1),
        rotateAnim: new Animated.Value(isLogged ? 2 : 0),
        opacityAnim: new Animated.Value(1),
      };
    }
    return animationRefs.current[mealId];
  };

  const handleRefresh = () => {
    setRefreshing(true);
    void Promise.all([
      refetchMeals(),
      refetchRecentMeals(),
    ]).finally(() => {
      setRefreshing(false);
    });
  };

  const handleLogMeal = (meal: Recipe) => {
    setSelectedMeal(meal);
    setMealTypeModalVisible(true);
  };

  const handleTogglePress = (e: GestureResponderEvent, meal: Recipe, animations: AnimationValues) => {
    e.stopPropagation();
    const isLogged = isMealLoggedToday(meal.id);

    if (isLogged) {
      toggleMealCompletionByRecipeId({ recipeId: meal.id });
    }

    // Reset opacity to 1 before starting new animation
    animations.opacityAnim.setValue(1);

    // Start animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(animations.scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animations.rotateAnim, {
          toValue: 2,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(animations.scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animations.opacityAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ]),
      Animated.timing(animations.opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!isLogged) {
        handleLogMeal(meal);
      }
    });
  };

  return (
    <LinearGradient
      colors={["#fdf2f8", "#fff"]}
      style={{ flex: 1, height: "100%", paddingTop: Constants.statusBarHeight }}
    >
      <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
        <BackButton title="Saved Foods" />
      </View>

      <ScrollView className="flex-1 px-6 pt-4" refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
        {meals?.map((meal) => {
          const animations = getAnimatedValues(meal.id);
          const isLogged = isMealLoggedToday(meal.id);
          const spin = animations.rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "180deg"],
          });

          return (
            <View 
              key={meal.id} 
              className="mb-4 overflow-hidden rounded-2xl bg-white shadow-lg"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 15,
                elevation: 2,
              }}
            >
              <Pressable
                className="flex-row"
                onPress={() => {
                  router.push(`/(modals)/recipe-detail?mealId=${meal.id}`);
                }}
              >
                {/* Left Content */}
                <View className="flex-1 p-4">
                  <View className="flex-row items-center justify-between -translate-y-1">
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={16}
                        color="#666"
                      />
                      <Text className="font-inter-medium ml-1 text-sm text-gray-500">
                        {meal.prepTimeMinutes ?? "15"} min
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-x-2">
                      <Animated.View
                        style={{
                          opacity: animations.opacityAnim,
                          transform: [{ scale: animations.scaleAnim }, { rotate: spin }],
                        }}
                      >
                        <Pressable
                          className={isLogged ? "rounded-full bg-green-100 p-2" : "rounded-full bg-pink-50 p-2"}
                          onPress={(e) => handleTogglePress(e, meal, animations)}
                          disabled={isPending}
                        >
                          {isLogged ? (
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color="#22C55E"
                            />
                          ) : (
                            <MaterialCommunityIcons
                              name="plus-circle"
                              size={24}
                              color="#ec4899"
                            />
                          )}
                        </Pressable>
                      </Animated.View>
                      <Pressable
                        className="rounded-full p-2"
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleFavorite({ recipeId: meal.id });
                        }}
                      >
                        <MaterialCommunityIcons
                          name={meal.isFavorite ? "heart" : "heart-outline"}
                          size={24}
                          color={meal.isFavorite ? "#ec4899" : "#666"}
                        />
                      </Pressable>
                    </View>
                  </View>

                  <Text 
                    className="font-inter-semibold mb-2 text-lg text-gray-900"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {meal.title}
                  </Text>

                    {/* Macros */}
                    <ScrollView 
                      horizontal 
                      contentContainerClassName="flex-row gap-2"
                      onStartShouldSetResponder={() => true}
                      onResponderTerminationRequest={() => false}
                      showsHorizontalScrollIndicator={false}
                    >
                      <View className="flex-row items-center rounded-xl bg-gray-50 px-2 py-1.5">
                        <Text className="font-inter-medium text-sm text-gray-900">
                          {meal.calories}
                        </Text>
                        <Text className="font-inter ml-1 text-xs text-gray-500">cal</Text>
                      </View>
                      <View className="flex-row items-center rounded-xl bg-gray-50 px-2 py-1.5">
                        <Text className="font-inter-medium text-sm text-gray-900">
                          {meal.proteinGrams}g
                        </Text>
                        <Text className="font-inter ml-1 text-xs text-gray-500">protein</Text>
                      </View>
                      <View className="flex-row items-center rounded-xl bg-gray-50 px-2 py-1.5">
                        <Text className="font-inter-medium text-sm text-gray-900">
                          {meal.carbsGrams}g
                        </Text>
                        <Text className="font-inter ml-1 text-xs text-gray-500">carbs</Text>
                      </View>
                      <View className="flex-row items-center rounded-xl bg-gray-50 px-2 py-1.5">
                        <Text className="font-inter-medium text-sm text-gray-900">
                          {meal.fatsGrams}g
                        </Text>
                        <Text className="font-inter ml-1 text-xs text-gray-500">fats</Text>
                      </View>
                    </ScrollView>
                </View>

                {/* Right Image */}
                <View className="w-32">
                  <Image
                    source={{ uri: meal.imageUrl ?? DEFAULT_IMAGE }}
                    style={{
                      height: "100%",
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
                  />
                </View>
              </Pressable>
            </View>
          );
        })}

        {meals?.length === 0 && (
          <View className="items-center justify-center py-12">
            <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-pink-50">
              <MaterialCommunityIcons
                name="food-apple"
                size={48}
                color="#ec4899"
              />
            </View>
            <Text className="font-inter-semibold text-xl text-gray-900">
              No saved foods yet
            </Text>
            <Text className="font-inter mt-2 text-center text-base text-gray-500">
              Foods you log will appear here for quick access
            </Text>
            <Pressable
              className="mt-6 rounded-xl bg-pink-500 px-6 py-3"
              onPress={() => router.push("/(modals)/meal-scan")}
            >
              <Text className="font-inter-semibold text-white">
                Scan Your First Meal
              </Text>
            </Pressable>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>

      {/* Meal Type Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={mealTypeModalVisible}
        onRequestClose={() => {
          setMealTypeModalVisible(false);
          setSelectedMeal(null);
        }}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => {
            setMealTypeModalVisible(false);
            setSelectedMeal(null);
          }}
        >
          <View className="flex-1" />
          <View className="rounded-t-3xl bg-white p-6">
            <Text className="font-inter-semibold mb-4 text-center text-xl text-gray-900">
              Select Meal Type
            </Text>
            <View className="gap-y-2">
              {MEAL_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  className="rounded-xl bg-gray-50 p-4"
                  onPress={() => {
                    if (selectedMeal) {
                      logMeal({
                        recipeId: selectedMeal.id,
                        mealType: type.value,
                      });
                    }
                  }}
                  disabled={isPending}
                >
                  <Text className="font-inter-medium text-center text-base text-gray-900">
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
} 