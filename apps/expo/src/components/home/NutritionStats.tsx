import { ProgressRing } from "@/components/core";
import { onboardingStore$ } from "@/stores/onboarding.store";
import {
  setNextImageTransformationTime,
  synchronizeBodyRating,
  transformationStore$,
} from "@/stores/transformation.store";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, Pressable, Text, View } from "react-native";
import * as Sentry from "@sentry/react-native";
import { useAssets } from "expo-asset";

interface NutritionStatsProps {
  selectedDate?: Date;
}

export const NutritionStats = ({
  selectedDate = new Date(),
}: NutritionStatsProps) => {
  const router = useRouter();
  const now = new Date();
  const {bodyRating, currentImage, snatchedImage, nextImageTransformationTime} = use$(transformationStore$);

  // Convert date to ISO string for API call
  const dateString = selectedDate.toISOString();

  // Fetch body ratings for the selected date
  const { data: bodyRatingData } = api.user.getBodyRatingByDate.useQuery(
    { date: dateString },
    { enabled: !!dateString },
  );

  // Sync DB body rating with transformation store when data changes
  useEffect(() => {
    if (bodyRatingData?.bodyRating) {
      synchronizeBodyRating(bodyRatingData.bodyRating);
    }
  }, [bodyRatingData]);

  const [assets] = useAssets([
    require('@/assets/icons/body-parts/Waist Definition.png'),
    require('@/assets/icons/body-parts/Arm Shape.png'),
    require('@/assets/icons/body-parts/Glute Shape.png'),
    require('@/assets/icons/body-parts/Hip Curve.png'),
    require('@/assets/icons/body-parts/Back Definition.png'),
    require('@/assets/icons/body-parts/Posture.png'),
  ]);

  const { mutate: imageTransformation } =
    api.user.imageTransformation.useMutation({
      onSuccess: (data) => {
        transformationStore$.currentImage.set(data.currentImageUri);
        transformationStore$.snatchedImage.set(data.transformedImageUri);
      },
      onError: (error) => {
        console.error(error);
        Sentry.captureException(error);
      },
    });

  const frontImageKey = use$(onboardingStore$.onboarding.frontViewPhoto);
  const canRequest =
    !nextImageTransformationTime ||
    now >= new Date(nextImageTransformationTime);
  const canShow = !!currentImage && !!snatchedImage;
  const buttonDisabled = !canShow && !canRequest;

  const buttonText = canShow
    ? "See Snatched Transformation"
    : canRequest
      ? "Generate Transformation Image"
      : "Please wait...";

  const requestTransformation = () => {
    if (!frontImageKey) {
      router.push("/(modals)/progress-front");
      return;
    }
    imageTransformation({ imageKeys: { front: frontImageKey } });
    setNextImageTransformationTime();
  };

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

  const bodyPartStats = [
    {
      label: "Waist Definition",
      value: bodyRating.waistDefinition ?? 0,
      asset: assets?.[0]?.localUri ? { uri: assets[0].localUri } : undefined,
    },
    {
      label: "Arm Shape",
      value: bodyRating.armShape ?? 0,
      asset: assets?.[1]?.localUri ? { uri: assets[1].localUri } : undefined,
    },
    {
      label: "Glute Shape",
      value: bodyRating.gluteShape ?? 0,
      asset: assets?.[2]?.localUri ? { uri: assets[2].localUri } : undefined,
    },
    {
      label: "Hip Curve",
      value: bodyRating.hipCurve ?? 0,
      asset: assets?.[3]?.localUri ? { uri: assets[3].localUri } : undefined,
    },
    {
      label: "Back Definition",
      value: bodyRating.backDefinition ?? 0,
      asset: assets?.[4]?.localUri ? { uri: assets[4].localUri } : undefined,
    },
    {
      label: "Posture",
      value: bodyRating.posture ?? 0,
      asset: assets?.[5]?.localUri ? { uri: assets[5].localUri } : undefined,
    },
  ];

  if (!assets) {
    return null; // Or return a loading state
  }

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
              canShow || canRequest ? "bg-pink-50" : "bg-gray-100"
            }`}
            onPress={
              canShow
                ? () => router.push("/(modals)/transformation-preview")
                : canRequest
                  ? () => requestTransformation()
                  : undefined
            }
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
                    <Image
                      source={stat.asset}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
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
