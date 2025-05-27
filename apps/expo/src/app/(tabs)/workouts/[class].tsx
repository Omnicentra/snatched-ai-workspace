// app/(tabs)/workouts.tsx
import type { RouterOutputs } from "@/utils/api";
import React, { useState } from "react";
import {
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
import { MilestoneModal } from "@/app/(modals)/milestone-modal";
import defaultImage from "@/assets/images/placeholders/workout-placeholder.png";
import { StyledButton } from "@/components/core";
import { LoadingScreen } from "@/components/core/LoadingScreen";
import { api } from "@/utils/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { workoutStore } from "@/stores/workout.store";
import { use$ } from "@legendapp/state/react";

type UserWorkoutStats = RouterOutputs["workout"]["getUserWorkoutStats"];
type WorkoutWithClasses = RouterOutputs["workout"]["getWorkouts"][0] & {
  classes: {
    id: number;
    name: string;
    description: string | null;
  }[];
};

// Category Pill Component
const CategoryPill = ({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <Pressable
    className={`mr-3 rounded-full px-4 py-2.5 ${
      isActive ? "bg-black" : "border border-gray-200"
    }`}
    onPress={onPress}
  >
    <Text
      className={`font-inter-medium text-sm ${
        isActive ? "text-white" : "text-gray-500"
      }`}
    >
      {label}
    </Text>
  </Pressable>
);

// Stats Summary Component
const StatsSummary = ({ stats }: { stats?: UserWorkoutStats }) => {
  if (!stats) {
    return (
      <View className="mb-8 flex-row justify-between rounded-3xl bg-white p-6 shadow-sm">
        <View className="items-center">
          <Text className="font-inter-bold text-2xl text-black">-</Text>
          <Text className="font-inter text-xs text-gray-500">Workouts</Text>
        </View>
        <View className="items-center">
          <Text className="font-inter-bold text-2xl text-green-500">-</Text>
          <Text className="font-inter text-xs text-gray-500">Cal Burned</Text>
        </View>
        <View className="items-center">
          <Text className="font-inter-bold text-2xl text-pink-500">-</Text>
          <Text className="font-inter text-xs text-gray-500">Active Time</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-8 flex-row justify-between rounded-3xl bg-white p-6 shadow-sm">
      <View className="items-center">
        <Text className="font-inter-bold text-2xl text-black">
          {stats.totalWorkouts}
        </Text>
        <Text className="font-inter text-xs text-gray-500">Workouts</Text>
      </View>
      <View className="items-center">
        <Text className="font-inter-bold text-2xl text-green-500">
          {Math.round(stats.totalCalories)}
        </Text>
        <Text className="font-inter text-xs text-gray-500">Cal Burned</Text>
      </View>
      <View className="items-center">
        <Text className="font-inter-bold text-2xl text-pink-500">
          {stats.totalDuration}m
        </Text>
        <Text className="font-inter text-xs text-gray-500">Active Time</Text>
      </View>
    </View>
  );
};

// Add workout card small
const WorkoutCardSmall = ({
  title,
  description,
  imageUrl,
  id,
  onPress,
}: {
  title: string;
  description: string;
  imageUrl: string;
  id: number;
  onPress: (id: number) => void;
}) => (
  <Pressable
    className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
    onPress={() => onPress(id)}
  >
    <View className="h-32 bg-gray-100">
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: "100%",
          height: "100%",
        }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
        placeholder={defaultImage}
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "transparent"]}
        className="absolute inset-x-0 top-0 h-16"
      />
    </View>
    <View className="p-4">
      <Text className="font-inter-bold mb-1 text-base text-black">{title}</Text>
      <Text className="font-inter text-sm text-gray-500">{description}</Text>
    </View>
  </Pressable>
);

export default function WorkoutLibraryScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);
  const selectedClass = use$(workoutStore.selectedClass);
  
  const { data: stats } = api.workout.getUserWorkoutStats.useQuery({
    period: "week",
  });

  const navigateToWorkoutDetail = (workoutId: number) => {
    router.push(`/(modals)/workout-detail?workoutId=${workoutId}`);
  };

  // Fetch workouts using tRPC
  const {
    data: workoutsData,
    isLoading,
    isRefetching,
    refetch,
  } = api.workout.getWorkouts.useQuery();

  // Get the categories from API data
  const { data: categoriesData } = api.workout.getWorkoutCategories.useQuery();

  // Set initial active category when categories load
  React.useEffect(() => {
    if (categoriesData?.length && !activeCategory && categoriesData[0]?.name) {
      setActiveCategory(categoriesData[0].name);
    }
  }, [categoriesData, activeCategory]);

  // Extract categories from data
  const categories = React.useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.map((category) => category.name).filter(Boolean);
  }, [categoriesData]);

  // Filter workouts based on active category and class filter
  const filteredWorkouts = React.useMemo(() => {
    if (!workoutsData) return [];

    return (workoutsData as WorkoutWithClasses[]).filter((workout) => {
      // Filter by category if one is selected
      const matchesCategory =
        !activeCategory ||
        (workout.categoryId &&
          categoriesData?.some(
            (cat) =>
              cat.id === workout.categoryId && cat.name === activeCategory,
          ));

      // Filter by class if one is selected
      const matchesClass = !selectedClass || workout.classes.some(c => c.id === selectedClass.id);

      return matchesCategory && matchesClass;
    });
  }, [workoutsData, categoriesData, activeCategory, selectedClass]);

  const handleViewAllWorkouts = () => {
    router.push("/(modals)/all-workouts");
  };

  const handleClassFilterPress = () => {
    if (selectedClass) {
      // Clear the filter
      workoutStore.selectedClass.set(null);
    } else {
      // Select a new class
      router.push("/(tabs)/workouts");
    }
  };

  return (
    <LinearGradient
      colors={["#e5e7eb", "#fff"]}
      style={{ flexGrow: 1, paddingTop: Constants.statusBarHeight }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-6">
        <View className="flex-1">
          <Text className="font-inter-bold text-2xl text-black">
            {selectedClass ? `${selectedClass.name} Workouts` : "Workouts"}
          </Text>
          {selectedClass && (
            <Text className="font-inter text-sm text-gray-500 mt-1">
              Filtered by class: {selectedClass.name}
            </Text>
          )}
        </View>
        <View className="flex-row gap-2">
          <Pressable
            className="rounded-full bg-gray-100 p-2"
            onPress={handleClassFilterPress}
          >
            <MaterialCommunityIcons
              name={selectedClass ? "filter-off" : "filter"}
              size={24}
              color="#6B7280"
            />
          </Pressable>
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

      {/* Workout Lists */}
      <ScrollView
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          <View className="flex-row py-2">
            {categories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                isActive={activeCategory === cat}
                onPress={() => setActiveCategory(cat)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Stats Summary */}
        <StatsSummary stats={stats} />

        {isLoading ? (
          <LoadingScreen message="Loading workouts..." />
        ) : (
          <>
            {/* Workouts List */}
            <View className="mb-8">
              <View className="grid grid-cols-2 gap-4 pb-6">
                {filteredWorkouts.length > 0 ? (
                  filteredWorkouts
                    .sort((a, b) => Number(b.rating) - Number(a.rating))
                    .map((workout) => (
                      <View
                        key={`${workout.id}`}
                        className="flex-1"
                      >
                        <WorkoutCardSmall
                          key={workout.id}
                          title={workout.title}
                          description={workout.description ?? ""}
                          imageUrl={
                            workout.imageUrl ??
                            "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a"
                          }
                          id={workout.id}
                          onPress={navigateToWorkoutDetail}
                        />
                      </View>
                    ))
                ) : (
                  <View className="flex-1">
                    <Text>No workouts found</Text>
                  </View>
                )}
              </View>
            </View>
            {/* View All Workouts Button */}
            <View className="mb-8">
              <StyledButton
                title="View All Workouts"
                onPress={handleViewAllWorkouts}
                variant="secondary"
              />
            </View>
          </>
        )}
      </ScrollView>

      <MilestoneModal
        isVisible={showMilestone}
        onClose={() => setShowMilestone(false)}
        type="workout"
      />
    </LinearGradient>
  );
}
