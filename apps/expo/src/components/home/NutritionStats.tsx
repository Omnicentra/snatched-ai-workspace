import { ProgressRing } from "@/components/core";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { Ionicons } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";
import React from "react";
import { Alert, Pressable, Text, View } from "react-native";
import type { IconName } from "@/types";

export const NutritionStats = () => {
  const bodyRating = use$(onboardingStore$.bodyRating);

  const handleTransformationPreview = () => {
    Alert.alert(
      "Coming Soon!",
      "We're working hard to bring you AI-powered transformation previews. Stay tuned for this exciting feature!",
      [{ text: "Can't Wait!", style: "default" }]
    );
  };

  // Calculate the overall snatched score as an average of all metrics
  const snatchedScore = Math.round(
    [
      bodyRating.waistDefinition ?? 0,
      bodyRating.hipCurve ?? 0,
      bodyRating.gluteShape ?? 0,
      bodyRating.posture ?? 0,
      bodyRating.armShape ?? 0,
      bodyRating.backDefinition ?? 0,
    ].filter(Boolean).reduce((a, b) => a + b, 0) / 6
  );

  const bodyPartStats: {
    label: string;
    value: number;
    icon: IconName;
  }[] = [
    { label: "Waist Definition", value: bodyRating.waistDefinition ?? 0, icon: "hourglass-outline" },
    { label: "Arm Shape", value: bodyRating.armShape ?? 0, icon: "barbell" },
    { label: "Glute Shape", value: bodyRating.gluteShape ?? 0, icon: "fitness" },
    { label: "Hip Curve", value: bodyRating.hipCurve ?? 0, icon: "walk" },
    { label: "Back Definition", value: bodyRating.backDefinition ?? 0, icon: "body" },
    { label: "Posture", value: bodyRating.posture ?? 0, icon: "shield" },
  ];

  return (
    <View className="mb-8">
      {/* Main Snatched Score Card */}
      <View className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
        <View className="items-center">
          <View className="relative mb-4">
            <ProgressRing
              size={160}
              strokeWidth={12}
              progress={snatchedScore / 100}
              bgColor="#F3F4F6"
              progressColor="#F472B6"
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="font-inter-bold text-4xl text-black">{snatchedScore}</Text>
              <Text className="font-inter mt-1 text-sm text-gray-500">
                Snatched Score
              </Text>
            </View>
          </View>
          <Pressable 
            className="flex-row items-center rounded-full bg-gray-100 px-4 py-2"
            onPress={handleTransformationPreview}
          >
            <View className="relative">
              <Ionicons name="image" size={18} color="#6B7280" />
              <View className="absolute -right-1 -top-1">
                <View className="h-3 w-3 items-center justify-center rounded-full bg-yellow-400">
                  <Text className="font-inter-bold text-[6px] text-white">!</Text>
                </View>
              </View>
            </View>
            <Text className="font-inter-medium ml-2 text-sm text-gray-500">
              Transformation Preview
              <Text className="text-green-500"> • Coming Soon</Text>
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Body Part Stats Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {bodyPartStats.map((stat, index) => (
          <View
            key={index}
            className="w-[48%] rounded-3xl bg-white p-4 shadow-sm"
          >
            <Text className="font-inter-bold text-xl text-black">
              {stat.value}%
            </Text>
            <Text className="font-inter mt-1 text-xs text-gray-500">
              {stat.label}
            </Text>
            <View className="mt-3 items-center">
              <View className="relative h-[50px] w-[50px]">
                <ProgressRing
                  size={50}
                  strokeWidth={4}
                  progress={stat.value / 100}
                  bgColor="#F3F4F6"
                  progressColor="#F472B6"
                />
                <View className="absolute inset-0 items-center justify-center">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-white/80">
                    <Ionicons name={stat.icon} size={18} color="#F472B6" />
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}; 