import { View, Text } from "react-native";

const workouts = [
  {
    day: "Day 1",
    focus: "Core & Waist",
    duration: "45 min",
    intensity: "High",
  },
  {
    day: "Day 2",
    focus: "Lower Body",
    duration: "40 min",
    intensity: "Medium",
  },
  { day: "Day 3", focus: "Recovery", duration: "30 min", intensity: "Low" },
];

export const WorkoutPlanSection = () => {
  return (
    <View className="rounded-2xl bg-white/90 p-4">
      <Text className="font-inter-bold mb-4 text-2xl text-gray-900">
        Optimal workout plan
      </Text>
      <View className="flex-1 justify-between">
        {workouts.map((workout, index) => (
          <View key={index} className="mb-3 rounded-xl bg-pink-50/80 p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-inter-semibold text-base text-gray-900">
                {workout.day}
              </Text>
              <View className="rounded-full bg-pink-400/20 px-3 py-1">
                <Text className="font-inter-medium text-sm text-pink-600">
                  {workout.duration}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-inter-medium text-sm text-gray-600">
                {workout.focus}
              </Text>
              <View
                className={`rounded-full px-2 py-1 ${
                  workout.intensity === "High"
                    ? "bg-red-100"
                    : workout.intensity === "Medium"
                      ? "bg-yellow-100"
                      : "bg-green-100"
                }`}
              >
                <Text
                  className={`font-inter-medium text-xs ${
                    workout.intensity === "High"
                      ? "text-red-600"
                      : workout.intensity === "Medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {workout.intensity}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}; 