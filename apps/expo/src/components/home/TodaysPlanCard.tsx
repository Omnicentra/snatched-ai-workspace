import { workoutStore } from "@/stores/workout.store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import * as Progress from "react-native-progress";

import { api } from "../../utils/api";

export const TodaysPlanCard = () => {
  const router = useRouter();
  const isRegenerating = use$(workoutStore.isRegenerating);
  const { data: weekPlan, isLoading: isLoadingPlan } =
    api.workout.getCurrentWeekPlan.useQuery();

  // Get today's workout
  const todaysWorkout = useMemo(() => {
    if (!weekPlan?.workouts) return null;

    const today = new Date();
    const dayNumber = today.getDay() === 0 ? 7 : today.getDay(); // Convert to 1-7 range where 7 is Sunday
    return weekPlan.workouts.find((w) => w.dayNumber === dayNumber);
  }, [weekPlan?.workouts]);

  const navigateToWorkout = () => {
    if (todaysWorkout?.workout.id) {
      router.push(
        `/(modals)/workout-detail?workoutId=${todaysWorkout.workout.id}`,
      );
    }
  };

  // Show loading if either the query is loading or the mutation is updating with regeneration
  const isLoading = useMemo(
    () => isLoadingPlan || isRegenerating,
    [isLoadingPlan, isRegenerating],
  );

  return (
    <View className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
      <Text className="font-inter-bold mb-6 text-lg text-black">
        Today's Plan
      </Text>
      {isLoading ? (
        <View className="items-center justify-center py-4">
          <ActivityIndicator color="#F472B6" />
          {isRegenerating && (
            <Text className="font-inter-medium mt-2 text-sm text-gray-500">
              Regenerating workout plan...
            </Text>
          )}
        </View>
      ) : !weekPlan || !todaysWorkout ? (
        <View className="items-center justify-center py-4">
          <Text className="font-inter-medium text-base text-gray-500">
            No workout planned for today
          </Text>
        </View>
      ) : (
        /* Workout Item */
        <View className="mb-6 flex-row items-center gap-x-4">
          <View className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-50">
            {todaysWorkout.completed ? (
              <MaterialCommunityIcons
                name="check-circle"
                size={26}
                color="#F472B6"
              />
            ) : (
              <MaterialCommunityIcons
                name="heart-pulse"
                size={26}
                color="#F472B6"
              />
            )}
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="font-inter-medium mb-1 text-base text-black">
                {todaysWorkout.workout.title}
              </Text>
              {todaysWorkout.completed && (
                <View className="rounded-full bg-green-100 px-2 py-1">
                  <Text className="font-inter-medium text-xs text-green-700">
                    Completed
                  </Text>
                </View>
              )}
            </View>
            <Text className="font-inter mb-3 text-sm text-gray-500">
              {todaysWorkout.workout.durationMinutes} min •{" "}
              {todaysWorkout.workout.difficultyLevel}
            </Text>
            <Progress.Bar
              progress={todaysWorkout.completed ? 1 : 0}
              width={null}
              height={4}
              color="#F472B6"
              unfilledColor="#F3F4F6"
              borderColor="transparent"
              borderRadius={2}
              useNativeDriver={true}
            />
          </View>
          {todaysWorkout.completed === false && (
            <Pressable
              className={`rounded-full bg-black px-5 py-2.5`}
              onPress={navigateToWorkout}
              disabled={todaysWorkout.completed}
            >
              <Text className={`font-inter-medium text-sm text-white`}>
                Start
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};
