import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { api } from "@/utils/api";
import type { RouterOutputs } from "@/utils/api";
import { MEAL_TYPES } from "@omc/validators/nutrition";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80";

type Recipe = RouterOutputs["nutrition"]["getRecipesByUser"][number];

export default function SavedFoodsScreen() {
  const router = useRouter();
  const utils = api.useUtils();
  const [selectedMeal, setSelectedMeal] = useState<Recipe | null>(null);
  const [mealTypeModalVisible, setMealTypeModalVisible] = useState(false);

  const { data: meals, refetch: refetchMeals } = api.nutrition.getRecipesByUser.useQuery();
  const { mutate: toggleFavorite } = api.nutrition.toggleFavoriteRecipe.useMutation({
    onSuccess: () => {
      void utils.nutrition.getRecipesByUser.invalidate();
    },
  });
  const { mutate: logMeal, status: logMealStatus } = api.nutrition.logSavedMeal.useMutation({
    onSuccess: () => {
      setMealTypeModalVisible(false);
      setSelectedMeal(null);
      void refetchMeals();
      void utils.nutrition.getTodaysMealPlan.invalidate();
      void utils.nutrition.getRecentlyLoggedMeals.invalidate();
    },
  });

  const handleLogMeal = (meal: Recipe) => {
    setSelectedMeal(meal);
    setMealTypeModalVisible(true);
  };

  const isLoading = logMealStatus === "pending";

  return (
    <LinearGradient
      colors={["#fdf2f8", "#fff"]}
      style={{ flex: 1, height: "100%", paddingTop: Constants.statusBarHeight }}
    >
      <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#333" />
        </Pressable>
        <Text className="font-inter-semibold text-lg text-gray-900">
          Saved Foods
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView className="flex-1 px-6 pt-4">
        {meals?.map((meal) => (
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
                <View className="mb-2 flex-row items-center justify-between">
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
                    <Pressable
                      className="rounded-full bg-pink-50 p-2"
                      onPress={(e) => {
                        e.stopPropagation();
                        handleLogMeal(meal);
                      }}
                      disabled={isLoading}
                    >
                      <MaterialCommunityIcons
                        name="plus-circle"
                        size={24}
                        color="#ec4899"
                      />
                    </Pressable>
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

                <View className="flex-row gap-2">
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
                </View>
              </View>

              {/* Right Image */}
              <View className="h-32 w-32">
                <Image
                  source={{ uri: meal.imageUrl ?? DEFAULT_IMAGE }}
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
                  placeholder={DEFAULT_IMAGE}
                />
              </View>
            </Pressable>
          </View>
        ))}

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
                  disabled={isLoading}
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