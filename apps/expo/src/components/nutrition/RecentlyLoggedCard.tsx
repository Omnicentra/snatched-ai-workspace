import { Ionicons } from "@expo/vector-icons";
import { api } from "@/utils/api";
import { formatPostgresTimestamp } from "@omc/validators";
import { useRouter } from "expo-router";
import type { FC } from "react";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export const RecentlyLoggedCard: FC<Props> = ({ className = "shadow-sm bg-white" }) => {
  const router = useRouter();
  const { data: recentMeals = [] } = api.nutrition.getRecentlyLoggedMeals.useQuery();
  
  return (
    <View className={cn("mb-8 rounded-3xl p-6", className)}>
      <Text className="font-inter-bold mb-1 text-lg text-black">
        Recently logged
      </Text>
      {recentMeals.length > 0 ? (
        <View>
          {recentMeals.map((meal) => (
            <View key={meal.id} className="mt-4 flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="restaurant-outline" size={20} color="#1F2937" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-medium text-base text-black" numberOfLines={1} ellipsizeMode="tail">
                    {meal.recipe.title}
                  </Text>
                  <Text className="font-inter text-sm text-gray-500">
                    {formatPostgresTimestamp(meal.completedAt)}
                  </Text>
                </View>
              </View>
              <Pressable 
                className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
                onPress={() => {
                  router.push(`/(modals)/recipe-detail?mealId=${meal.recipe.id}`);
                }}
              >
                <Ionicons name="chevron-forward" size={20} color="#1F2937" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <View className="items-center py-4">
          <Text className="font-inter-medium mb-2 text-base text-black">
            You haven't uploaded any food
          </Text>
          <Text className="font-inter text-center text-sm text-gray-500">
            Start tracking today's meals by taking a quick picture.
          </Text>
        </View>
      )}
    </View>
  );
}; 