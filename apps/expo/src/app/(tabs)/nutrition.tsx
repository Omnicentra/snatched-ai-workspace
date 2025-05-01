// app/(modals)/nutrition-plan.tsx OR app/(details)/nutrition-plan.tsx
import React, { useState, useRef } from "react";
import type {
  GestureResponderEvent} from "react-native";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  Animated,
  Easing,
} from "react-native";
import { MilestoneModal } from "@/app/(modals)/milestone-modal";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { observer, use$ } from "@legendapp/state/react";
import { nutritionStore$ } from "@/stores/nutrition.store";
import { Ionicons } from "@expo/vector-icons";

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
const MealCard = observer(({
  id,
  name,
  calories,
  protein,
  carbs,
  fats,
  imageUrl,
  time,
  onPress,
}: {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  imageUrl: string;
  time: string;
  onPress: () => void;
}) => {
  const loggedMeal = nutritionStore$.loggedMeals[id]?.get();
  const isLogged = !!loggedMeal?.loggedAt;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  const handleLogMeal = (e: GestureResponderEvent) => {
    e.stopPropagation();
    
    // Start animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 2,
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
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ]),
    ]).start(() => {
      // Update the store after animation
      nutritionStore$.loggedMeals.set({
        ...nutritionStore$.loggedMeals.get(),
        [id]: {
          loggedAt: new Date().toISOString(),
          mealId: id,
        }
      });
      
      // Reset opacity for next animation
      opacityAnim.setValue(1);
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

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
                  className="rounded-full bg-green-100 p-1"
                  style={{
                    transform: [{ scale: scaleAnim }],
                  }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
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
            {name}
          </Text>
          <View className="flex-row gap-2">
            <MacroPill label="protein" amount={protein} />
            <MacroPill label="carbs" amount={carbs} />
            <MacroPill label="fats" amount={fats} />
          </View>
        </View>
        <View className="h-36 w-36">
          <Image
            source={{ uri: imageUrl }}
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
});

export default function NutritionPlanScreen() {
  const router = useRouter();
  const [showMilestone, setShowMilestone] = useState(false);
  const nutrition = use$(nutritionStore$);

  // Calculate current macros from logged meals
  const calculateMacros = (macroType: 'protein' | 'carbs' | 'fats') => {
    return Object.values(nutrition.loggedMeals).reduce((acc, meal) => {
      const mealData = nutrition.meals[meal.mealId];
      return acc + (mealData?.[macroType] ?? 0);
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

  const navigateToRecipeDetail = (mealId: string) => {
    router.push(`/(modals)/recipe-detail?mealId=${mealId}`);
  };

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
        {Object.entries(nutrition.meals).map(([id, meal]) => (
          <MealCard
            key={id}
            {...meal}
            onPress={() => navigateToRecipeDetail(id)}
          />
        ))}
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
