// app/(modals)/nutrition-plan.tsx OR app/(details)/nutrition-plan.tsx
import { MilestoneModal } from "@/app/(modals)/milestone-modal";
import { nutritionStore$ } from "@/stores/nutrition.store";
import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import type {
  GestureResponderEvent
} from "react-native";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

// Define recipe type for clarity
type Recipe = RouterOutputs['nutrition']['getAllRecipes'][0];

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
  id,
  title,
  calories,
  proteinGrams,
  carbsGrams,
  fatsGrams,
  imageUrl,
  time,
  onPress,
}: {
  id: number;
  title: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  imageUrl: string | null;
  time: string;
  onPress: () => void;
}) => {
  const loggedMeal = use$(nutritionStore$.loggedMeals[id.toString()]);
  const isLogged = !!loggedMeal?.loggedAt;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  const handleLogMeal = (e: GestureResponderEvent) => {
    e.stopPropagation();
    
    // Check if meal is already logged
    const currentMeals = nutritionStore$.loggedMeals.get();
    const isLogged = Object.entries(currentMeals).some(
      ([_, meal]) => meal.mealId === id.toString()
    );

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
          toValue: isLogged ? 0 : 2, // Rotate back to 0 when removing, forward to 1 when adding
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
      if (isLogged) {
        // Remove the meal
        const updatedMeals = { ...currentMeals };
        const mealKeyToRemove = Object.entries(updatedMeals).find(
          ([_, meal]) => meal.mealId === id.toString()
        )?.[0];
        
        if (mealKeyToRemove) {
          delete updatedMeals[mealKeyToRemove];
          nutritionStore$.loggedMeals.set(updatedMeals);
        }
      } else {
        // Add the meal
        nutritionStore$.loggedMeals.set({
          ...currentMeals,
          [id.toString()]: {
            loggedAt: new Date().toISOString(),
            mealId: id.toString(),
            mealName: title,
          }
        });
      }
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const defaultImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";

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
              {isLogged ? (
                <Animated.View 
                  style={{
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }, { rotate: spin }],
                  }}
                >
                  <Pressable
                    onPress={handleLogMeal}
                    className="rounded-full bg-green-100 p-1"
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                  </Pressable>
                </Animated.View>
              ) : (
                <Animated.View
                  style={{
                    opacity: opacityAnim,
                    transform: [
                      { scale: scaleAnim },
                      { rotate: spin }
                    ],
                  }}
                >
                  <Pressable
                    onPress={handleLogMeal}
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
          <Text className="font-inter-semibold mb-3 text-lg text-gray-900">
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
            allowDownscaling={false}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
            }}
            contentFit="cover"
          />
        </View>
      </View>
    </Pressable>
  );
};

export default function NutritionPlanScreen() {
  const router = useRouter();
  const [showMilestone, setShowMilestone] = useState(false);
  const nutrition = use$(nutritionStore$);
  const { data: recipes, isLoading: isLoadingRecipes } = api.nutrition.getAllRecipes.useQuery();

  // Predefined meal times
  const mealTimes: Record<string, string> = {
    breakfast: "8:00 AM",
    lunch: "12:30 PM", 
    snack: "3:30 PM",
    dinner: "7:00 PM",
    other: "6:00 PM", // Default time for other category
  };

  // Determine meal category based on recipe title or category
  const getMealCategory = (recipe: Recipe): "breakfast" | "lunch" | "dinner" | "snack" | "other" => {
    // First check the category if available
    if (recipe.categoryId) {
      // Map category IDs to meal types (would need to be updated based on your actual category IDs)
      const categoryMap: Record<number, string> = {
        1: "breakfast",
        2: "lunch", 
        3: "dinner",
        4: "snack"
      };
      if (categoryMap[recipe.categoryId]) {
        return categoryMap[recipe.categoryId] as "breakfast" | "lunch" | "dinner" | "snack";
      }
    }
    return "other";
  };

  // Assign times to recipes based on their category
  const getMealTime = (category: "breakfast" | "lunch" | "dinner" | "snack" | "other") => {
    return mealTimes[category] ?? "Other";
  };

  type MealCategory = "breakfast" | "lunch" | "dinner" | "snack" | "other";
  type MealGroups = Record<MealCategory, Recipe[]>;

  // Group recipes by meal type and ensure essential meals are included
  const groupRecipesByMealType = (recipeList: Recipe[] | undefined): MealGroups => {
    if (!recipeList || recipeList.length === 0) {
      return {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
        other: []
      };
    }
    
    const mealGroups: MealGroups = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
      other: []
    };
    
    // Group recipes by meal type
    recipeList.forEach(recipe => {
      const category = getMealCategory(recipe);
      mealGroups[category].push(recipe);
    });
    
    return mealGroups;
  };

  // Get recipes ordered for a day's meals
  const getOrderedMeals = (recipeList: Recipe[] | undefined) => {
    if (!recipeList || recipeList.length === 0) return [];
    
    const mealGroups = groupRecipesByMealType(recipeList);
    const orderedMeals: {recipe: Recipe, category: MealCategory}[] = [];
    
    // Essential meals first (breakfast, lunch, dinner)
    const mealOrder: MealCategory[] = ["breakfast", "lunch", "dinner", "snack"];
    
    mealOrder.forEach(category => {
      if (mealGroups[category].length > 0) {
        // Get the first recipe of each category
        orderedMeals.push({
          recipe: mealGroups[category][0],
          category
        });
      }
    });
    
    // If we don't have all essential meals, fill with other recipes
    if (orderedMeals.length < 3) {
      // Check which essential meals we're missing
      const essentialCategories: MealCategory[] = ["breakfast", "lunch", "dinner"];
      const existingCategories = orderedMeals.map(meal => meal.category);
      
      const missingCategories = essentialCategories.filter(
        category => !existingCategories.includes(category)
      );
      
      // For each missing essential meal, try to fill from other categories or 'other'
      missingCategories.forEach(missingCategory => {
        // Try to get a recipe from 'other' category
        if (mealGroups.other.length > 0) {
          const recipe = mealGroups.other.shift();
          if (recipe) {
            orderedMeals.push({
              recipe,
              category: missingCategory
            });
          }
        }
      });
    }
    
    return orderedMeals;
  };

  // Calculate current macros from logged meals
  const calculateMacros = (macroType: 'protein' | 'carbs' | 'fats') => {
    return Object.values(nutrition.loggedMeals).reduce((acc, meal) => {
      const mealId = parseInt(meal.mealId);
      if (isNaN(mealId) || !recipes) return acc;
      
      const recipe = recipes.find((r: Recipe) => r.id === mealId);
      if (!recipe) return acc;
      
      if (macroType === 'protein') return acc + recipe.proteinGrams;
      if (macroType === 'carbs') return acc + recipe.carbsGrams;
      return acc + recipe.fatsGrams;
    }, 0);
  };

  const macros = [
    {
      name: "Protein",
      target: nutrition.dailyTargets.protein,
      current: calculateMacros('protein'),
      color: "#f472b6",
      icon: "arm-flex-outline" as const,
    },
    {
      name: "Carbs",
      target: nutrition.dailyTargets.carbs,
      current: calculateMacros('carbs'),
      color: "#60a5fa",
      icon: "barley" as const,
    },
    {
      name: "Fats",
      target: nutrition.dailyTargets.fats,
      current: calculateMacros('fats'),
      color: "#fbbf24",
      icon: "food-drumstick-outline" as const,
    },
  ];

  const navigateToRecipeDetail = (mealId: number) => {
    router.push(`/(modals)/recipe-detail?mealId=${mealId}`);
  };

  // Get ordered daily meals
  const orderedMeals = getOrderedMeals(recipes);

  return (
    <LinearGradient
      colors={["#e5e7eb", "#fff"]}
      style={{ flexGrow: 1, paddingTop: Constants.statusBarHeight }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-6 pb-3">
        <Text className="font-inter-bold text-2xl text-black">Nutrition</Text>
        <View className="flex-row gap-2">
          <Pressable
            className="rounded-full bg-gray-100 p-2"
            onPress={() => setShowMilestone(true)}
          >
            <MaterialCommunityIcons
              name="trophy-outline"
              size={24}
              color="#f472b6"
            />
          </Pressable>
        </View>
      </View>

      {/* Meal Lists */}
      <ScrollView className="flex-1 px-6">
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

        {/* Meals */}
        <Text className="font-inter-bold mb-4 px-2 text-lg text-black">
          Today's Meals
        </Text>
        
        {isLoadingRecipes ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color="#f472b6" />
            <Text className="font-inter mt-2 text-gray-500">Loading meals...</Text>
          </View>
        ) : orderedMeals.length > 0 ? (
          orderedMeals.map(({ recipe, category }) => (
            <MealCard
              key={recipe.id}
              id={recipe.id}
              title={recipe.title}
              calories={recipe.calories}
              proteinGrams={recipe.proteinGrams}
              carbsGrams={recipe.carbsGrams}
              fatsGrams={recipe.fatsGrams}
              imageUrl={recipe.imageUrl}
              time={getMealTime(category)}
              onPress={() => navigateToRecipeDetail(recipe.id)}
            />
          ))
        ) : (
          <View className="items-center justify-center py-8">
            <Text className="font-inter text-gray-500">No meals available.</Text>
          </View>
        )}
        
        <View className="h-6" />
      </ScrollView>

      <MilestoneModal
        isVisible={showMilestone}
        onClose={() => setShowMilestone(false)}
        currentDay={1}
        totalDays={7}
        emoji="🥗"
        accentColor="#f472b6"
        type="nutrition"
      />
    </LinearGradient>
  );
};
