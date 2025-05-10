import { ProgressRing } from "@/components/core";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { setNextImageTransformationTime, transformationStore$ } from "@/stores/transformation.store";
import type { IconName } from "@/types";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import * as Sentry from "@sentry/react-native";

export const NutritionStats = () => {
  const router = useRouter();
  const now = new Date();
  const bodyRating = use$(transformationStore$.bodyRating);
  const currentImage = use$(transformationStore$.currentImage);
  const snatchedImage = use$(transformationStore$.snatchedImage);
  const nextImageTransformationTime = use$(transformationStore$.nextImageTransformationTime);
  const { mutate: imageTransformation } = api.user.imageTransformation.useMutation({
    onSuccess: (data) => {
      transformationStore$.currentImage.set(data.currentImageUri);
      transformationStore$.snatchedImage.set(data.transformedImageUri);
    },
    onError: (error) => {
      console.error(error);
      Sentry.captureException(error);
    }
  });

  const frontImageKey = use$(onboardingStore$.onboarding.frontViewPhoto);
  const canRequest = !nextImageTransformationTime || now >= new Date(nextImageTransformationTime);
  const canShow = !!currentImage && !!snatchedImage;
  const buttonDisabled = !canShow && !canRequest;

  const buttonText = canShow
    ? 'See Snatched Transformation'
    : canRequest
      ? 'Generate Transformation Image'
      : 'Please wait...';

  const requestTransformation = () => {
    if (!frontImageKey) {
      router.push("/(modals)/progress-front")
      return;
    }
    imageTransformation({ imageKeys: { front: frontImageKey } })
    setNextImageTransformationTime()
  }

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
              (canShow || canRequest) ? "bg-pink-50" : "bg-gray-100"
            }`}
            onPress={canShow ? () => router.push("/(modals)/transformation-preview") : canRequest ? () => requestTransformation() : undefined}
            disabled={buttonDisabled}
          >
            <Ionicons 
              name="image" 
              size={18} 
              color={canShow || canRequest ? "#F472B6" : "#9CA3AF"} 
            />
            <Text 
              className={`font-inter-medium ml-2 text-sm ${
                canShow || canRequest ? "text-pink-500" : "text-gray-400"
              }`}
            >
              {buttonText}
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
