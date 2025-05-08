import { ProgressRing } from "@/components/core";
import { transformationStore$ } from "@/stores/transformation.store";
import type { IconName } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export const NutritionStats = () => {
  const bodyRating = use$(transformationStore$.bodyRating);
  const currentImage = use$(transformationStore$.currentImage);
  const snatchedImage = use$(transformationStore$.snatchedImage);
  const router = useRouter();

  // const handleTransformationPreview = () => {
  //   Alert.alert(
  //     "Coming Soon!",
  //     "We're working hard to bring you AI-powered transformation previews. Stay tuned for this exciting feature!",
  //     [{ text: "Can't Wait!", style: "default" }],
  //   );
  // };

  // Calculate the overall snatched score as an average of all metrics
  // const snatchedScore = Math.round(
  //   [
  //     bodyRating.waistDefinition ?? 0,
  //     bodyRating.hipCurve ?? 0,
  //     bodyRating.gluteShape ?? 0,
  //     bodyRating.posture ?? 0,
  //     bodyRating.armShape ?? 0,
  //     bodyRating.backDefinition ?? 0,
  //   ].filter(Boolean).reduce((a, b) => a + b, 0) / 6
  // );

  const bodyPartStats: {
    label: string;
    value: number;
    icon: IconName;
  }[] = [
    {
      label: "Waist Definition",
      value: bodyRating.waistDefinition ?? 0,
      icon: "hourglass-outline",
    },
    { label: "Arm Shape", value: bodyRating.armShape ?? 0, icon: "barbell" },
    {
      label: "Glute Shape",
      value: bodyRating.gluteShape ?? 0,
      icon: "fitness",
    },
    { label: "Hip Curve", value: bodyRating.hipCurve ?? 0, icon: "walk" },
    {
      label: "Back Definition",
      value: bodyRating.backDefinition ?? 0,
      icon: "body",
    },
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
              progress={(bodyRating.currentSnatchedScore ?? 0) / 100}
              bgColor="#F3F4F6"
              progressColor="#F472B6"
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="font-inter-bold text-4xl text-black">
                {bodyRating.currentSnatchedScore ?? 0}
              </Text>
              <Text className="font-inter mt-1 text-sm text-gray-500">
                Snatched Score
              </Text>
            </View>
          </View>
          <Pressable
            className={`flex-row items-center rounded-full px-4 py-2 ${
              !currentImage || !snatchedImage
                ? "bg-gray-100"
                : "bg-pink-50"
            }`}
            onPress={() => router.push("/(modals)/transformation-preview")}
            disabled={!currentImage || !snatchedImage}
          >
            <Ionicons 
              name="image" 
              size={18} 
              color={!currentImage || !snatchedImage ? "#9CA3AF" : "#F472B6"} 
            />
            <Text 
              className={`font-inter-medium ml-2 text-sm ${
                !currentImage || !snatchedImage
                  ? "text-gray-400"
                  : "text-pink-500"
              }`}
            >
              See Snatched Transformation
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
