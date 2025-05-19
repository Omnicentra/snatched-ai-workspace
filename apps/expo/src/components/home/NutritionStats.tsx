import React, { useEffect, useMemo } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useAssets } from "expo-asset";
import { useRouter } from "expo-router";
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
import * as Sentry from "@sentry/react-native";
import { differenceInDays } from "date-fns";

import { formatPostgresTimestampToDate } from "@omc/validators";

import { logger } from "~/lib/logger";

interface NutritionStatsProps {
  selectedDate?: Date;
}

export const NutritionStats = ({
  selectedDate = new Date(),
}: NutritionStatsProps) => {
  const router = useRouter();
  const {
    bodyRating,
    currentImage,
    snatchedImage,
    nextImageTransformationTime,
  } = use$(transformationStore$);

  // Convert date to ISO string for API call
  const dateString = selectedDate.toISOString();

  // Fetch body ratings for the selected date
  const { data } = api.user.getBodyRatingByDate.useQuery(
    { date: dateString },
    { enabled: !!dateString },
  );

  // Sync DB body rating with transformation store when data changes
  useEffect(() => {
    if (data?.bodyRating) {
      synchronizeBodyRating(data.bodyRating);
    }
  }, [data]);

  const [assets] = useAssets([
    require("@/assets/icons/body-parts/waist_definition.png"),
    require("@/assets/icons/body-parts/arm_shape.png"),
    require("@/assets/icons/body-parts/glute_shape.png"),
    require("@/assets/icons/body-parts/hip_curve.png"),
    require("@/assets/icons/body-parts/back_definition.png"),
    require("@/assets/icons/body-parts/posture.png"),
  ]);

  // Calculate days since last scan
  const { daysSinceLastScan, canTakeNewScan } = useMemo(() => {
    if (!data) {
      return { daysSinceLastScan: null, canTakeNewScan: false };
    }
    const now = new Date();
    const lastBodyRating = data.createdAt;
    const lastBodyRatingDate = formatPostgresTimestampToDate(lastBodyRating);

    const daysSinceLastScan = lastBodyRating
      ? differenceInDays(now, lastBodyRatingDate)
      : null;
    const canTakeNewScan = daysSinceLastScan === null || daysSinceLastScan >= 7;
    logger.debug(
      `daysSinceLastScan: ${daysSinceLastScan}, canTakeNewScan: ${canTakeNewScan}`,
    );
    return { daysSinceLastScan, canTakeNewScan };
  }, [data]);

  const { mutate: imageTransformation } =
    api.user.imageTransformation.useMutation({
      onSuccess: (data) => {
        transformationStore$.currentImage.set(data.currentImageUri);
        transformationStore$.snatchedImage.set(data.transformedImageUri);
        setNextImageTransformationTime();
      },
      onError: (error) => {
        console.error(error);
        Sentry.captureException(error);
      },
    });

  const frontImageKey = use$(onboardingStore$.onboarding.frontViewPhoto);

  const { canRequest, canShow } = useMemo(() => {
    const now = new Date();
    const canRequest =
      !nextImageTransformationTime ||
      now >= new Date(nextImageTransformationTime);
    const canShow = !!currentImage && !!snatchedImage;
    return { canRequest, canShow };
  }, [nextImageTransformationTime, currentImage, snatchedImage]);

  const buttonDisabled = !canShow && !canRequest;

  const handlePress = canShow
    ? () => router.push("/(modals)/transformation-preview")
    : canRequest
      ? () => requestTransformation()
      : undefined;

  const buttonText = canShow
    ? "See Snatched Transformation"
    : canRequest
      ? "Generate Transformation Image"
      : "Please wait...";

  const requestTransformation = () => {
    if (!frontImageKey || !data?.frontImageKey) {
      router.push("/(modals)/progress-front");
      return;
    }
    imageTransformation({
      imageKeys: { front: frontImageKey || data.frontImageKey },
    });
    setNextImageTransformationTime();
  };

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

          {/* New Scan Button */}
          {canTakeNewScan && (
            <Pressable
              className="mb-3 flex-row items-center rounded-full bg-pink-50 px-4 py-2"
              onPress={() => router.push("/(modals)/progress-front")}
            >
              <Ionicons name="camera" size={18} color="#F472B6" />
              <Text className="font-inter-medium ml-2 text-sm text-pink-500">
                Take New Body Scan
              </Text>
            </Pressable>
          )}

          {/* Days Until Next Scan */}
          {!canTakeNewScan && daysSinceLastScan !== null && (
            <Text className="font-inter mb-3 text-sm text-gray-500">
              Next scan available in {7 - daysSinceLastScan} days
            </Text>
          )}

          {/* Transformation Button */}
          <Pressable
            className={`flex-row items-center rounded-full px-4 py-2 ${
              canShow || canRequest ? "bg-pink-50" : "bg-gray-100"
            }`}
            onPress={handlePress}
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
