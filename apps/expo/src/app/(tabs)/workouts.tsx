import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { LoadingScreen } from "@/components/core/LoadingScreen";
import { TodaysPlanCard } from "@/components/home/TodaysPlanCard";
import { workoutStore } from "@/stores/workout.store";
import { api } from "@/utils/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface WorkoutClass {
  id: number;
  name: string;
  description: string | null;
  createdAt: string | null;
}

// Workout Class Card Component
const WorkoutClassCard = ({
  name,
  description,
  icon,
  gradientColors: _gradientColors, // unused now
  onPress,
}: {
  name: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  gradientColors: [string, string, string];
  onPress: () => void;
}) => (
  <Pressable
    className="mb-6 rounded-3xl bg-white p-6 shadow-sm"
    onPress={onPress}
  >
    <View className="flex-row items-center gap-x-4">
      <View className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-50">
        <MaterialCommunityIcons name={icon} size={26} color="#F472B6" />
      </View>
      <View className="flex-1">
        <Text className="font-inter-bold mb-1 text-base text-black">
          {name}
        </Text>
        <Text className="font-inter text-sm text-gray-500">{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
    </View>
  </Pressable>
);

export default function WorkoutClassSelectionScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { data: workoutClassesData, isLoading } =
    api.workout.getWorkoutClasses.useQuery();

  const handleClassSelection = (workoutClass: WorkoutClass) => {
    workoutStore.selectedClass.set(workoutClass);
    router.push(`/(tabs)/workouts/${workoutClass.name}`);
  };

  const getClassConfig = (className: string) => {
    switch (className.toLowerCase()) {
      case "pilates":
        return {
          icon: "meditation" as keyof typeof MaterialCommunityIcons.glyphMap,
          gradientColors: ["#EC4899", "#BE185D", "#9D174D"] as [
            string,
            string,
            string,
          ],
        };
      case "gym":
        return {
          icon: "dumbbell" as keyof typeof MaterialCommunityIcons.glyphMap,
          gradientColors: ["#3B82F6", "#1D4ED8", "#1E40AF"] as [
            string,
            string,
            string,
          ],
        };
      case "home":
        return {
          icon: "home-heart" as keyof typeof MaterialCommunityIcons.glyphMap,
          gradientColors: ["#10B981", "#059669", "#047857"] as [
            string,
            string,
            string,
          ],
        };
      default:
        return {
          icon: "fitness" as keyof typeof MaterialCommunityIcons.glyphMap,
          gradientColors: ["#6B7280", "#4B5563", "#374151"] as [
            string,
            string,
            string,
          ],
        };
    }
  };

  return (
    <LinearGradient
      colors={["#f9fafb", "#fff"]}
      style={{ flex: 1, paddingTop: Constants.statusBarHeight, paddingBottom: bottom }}
    >
      <View className="flex-row items-center justify-between p-6">
        <Text className="font-inter-bold text-2xl text-black">Workouts</Text>
      </View>
      {/* Today's Plan */}
      <View className="px-6 pb-4">
        <TodaysPlanCard />
      </View>

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-4">
        <Text className="font-inter-bold text-2xl text-black">
          Choose Your Workout Style
        </Text>
      </View>

      {/* Workout Classes */}
      {isLoading ? (
        <LoadingScreen message="Loading workout classes..." />
      ) : (
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {workoutClassesData?.map((workoutClass: WorkoutClass) => {
            const config = getClassConfig(workoutClass.name);
            return (
              <WorkoutClassCard
                key={workoutClass.id}
                name={workoutClass.name}
                description={workoutClass.description ?? ""}
                icon={config.icon}
                gradientColors={config.gradientColors}
                onPress={() => handleClassSelection(workoutClass)}
              />
            );
          })}
        </ScrollView>
      )}
    </LinearGradient>
  );
}
