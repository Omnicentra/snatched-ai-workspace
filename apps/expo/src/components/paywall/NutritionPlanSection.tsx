import { View, Text } from "react-native";

const meals = [
  {
    type: "Breakfast",
    calories: "400",
    protein: "25g",
    example: "Greek yogurt + berries",
  },
  {
    type: "Lunch",
    calories: "500",
    protein: "30g",
    example: "Grilled chicken salad",
  },
  {
    type: "Dinner",
    calories: "450",
    protein: "28g",
    example: "Salmon + quinoa",
  },
];

export const NutritionPlanSection = () => {
  return (
    <View className="rounded-2xl bg-white/90 p-4">
      <Text className="font-inter-bold mb-4 text-2xl text-gray-900">
        Optimal nutrition plan
      </Text>
      <View className="flex-1">
        <View className="mb-4 flex-row justify-between rounded-xl bg-pink-50/80 p-3">
          <View className="items-center">
            <Text className="font-inter-medium text-sm text-gray-600">
              Daily Calories
            </Text>
            <Text className="font-inter-bold text-lg text-pink-600">1,800</Text>
          </View>
          <View className="items-center">
            <Text className="font-inter-medium text-sm text-gray-600">
              Protein
            </Text>
            <Text className="font-inter-bold text-lg text-pink-600">90g</Text>
          </View>
          <View className="items-center">
            <Text className="font-inter-medium text-sm text-gray-600">
              Water
            </Text>
            <Text className="font-inter-bold text-lg text-pink-600">2.5L</Text>
          </View>
        </View>
        <View className="flex-1 justify-between">
          {meals.map((meal, index) => (
            <View key={index} className="mb-3 rounded-xl bg-pink-50/80 p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-inter-semibold text-base text-gray-900">
                  {meal.type}
                </Text>
                <View className="rounded-full bg-pink-400/20 px-3 py-1">
                  <Text className="font-inter-medium text-sm text-pink-600">
                    {meal.calories} cal
                  </Text>
                </View>
              </View>
              <Text className="font-inter-medium text-sm text-gray-600">
                {meal.example}
              </Text>
              <Text className="font-inter-medium mt-1 text-xs text-pink-600">
                {meal.protein} protein
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}; 