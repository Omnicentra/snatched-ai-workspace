import Silhouette from "@/assets/images/logo2.png";
import { CircleProgress } from "@/components/core/CircleProgress";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { api } from "@/utils/api";
import { use$ } from "@legendapp/state/react";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { prettyPrint } from "@omc/validators";

const statusUpdates = [
  { emoji: "🎯", text: "Identifying focus areas..." },
  { emoji: "💪", text: "Creating workout plan..." },
  { emoji: "🥗", text: "Generating nutrition guide..." },
  { emoji: "🧬", text: "Body shape analysis..." },
  { emoji: "📏", text: "Calculating proportions..." },
];

const StatusUpdate = ({ emoji, text }: { emoji: string; text: string }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(1400, withTiming(0, { duration: 300 })),
    );
  }, [text]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="mx-auto mt-6 flex-row items-center gap-x-2"
    >
      <Text className="text-2xl">{emoji}</Text>
      <Text className="font-inter-medium text-xl text-white">{text}</Text>
    </Animated.View>
  );
};

export default function AnalyzingScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  const { mutate: getBodyRating } = api.user.bodyRating.useMutation({
    onSuccess: (data) => {
      prettyPrint(JSON.stringify(data, null, 2));
      onboardingStore$.bodyRating.set(data);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const { mutate: generateMealPlan } = api.nutrition.generateMealPlan.useMutation({
    onSuccess: (data) => {
      prettyPrint(JSON.stringify(data, null, 2));
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const frontImageKey = use$(onboardingStore$.onboarding.frontViewPhoto);
  const sideImageKey = use$(onboardingStore$.onboarding.sideViewPhoto);
  const backImageKey = use$(onboardingStore$.onboarding.backViewPhoto);
  const desiredBodyShape = use$(onboardingStore$.onboarding.desiredShape);

  useEffect(() => {
    getBodyRating({
      imageKeys: {
        front: frontImageKey,
        side: sideImageKey,
        back: backImageKey,
      },
      desiredBodyShape,
    });
    generateMealPlan()

    // Status update animation
    const statusInterval = setInterval(() => {
      setCurrentStatusIndex((prev) => (prev + 1) % statusUpdates.length);
    }, 2000);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const nextProgress = prev + 0.01; // Increment by 1%
        if (nextProgress >= 1) {
          clearInterval(progressInterval);
          clearInterval(statusInterval);
          setTimeout(() => {
            router.replace("/(onboarding)/results");
          }, 500); // Small delay after reaching 100%
          return 1; // Cap at 100%
        }
        return nextProgress;
      });
    }, 100);

    return () => {
      clearInterval(statusInterval);
      clearInterval(progressInterval);
    };
  }, [router]);

  return (
    <LinearGradient
      colors={["#f472b6", "#FED0E2"]}
      style={{
        paddingTop: Constants.statusBarHeight,
        padding: 20,
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <View className="flex w-full items-center justify-center gap-y-4 text-center">
        <View className="relative my-4">
          <CircleProgress
            size={300}
            progress={progress}
            thickness={10}
            indicatorColor="#f472b6"
            unfilledColor="rgba(255,255,255,0.7)"
            innerFillColor="#ffffff"
            strokeLinecap="round"
            duration={300}
          >
            <Image
              source={Silhouette}
              style={{
                width: 200,
                height: 200,
                tintColor: "#f472b6",
              }}
              contentFit="contain"
            />
          </CircleProgress>
          {/* Title text */}
          <Text className="font-inter-bold mt-6 text-center text-3xl text-white">
            Custom Plan
          </Text>
          <StatusUpdate
            emoji={statusUpdates[currentStatusIndex]?.emoji ?? ""}
            text={statusUpdates[currentStatusIndex]?.text ?? ""}
          />
          {/* Percentage Text Below */}
          <View className="mx-auto mt-6 max-w-24 rounded-full bg-black/20 px-4 py-1">
            <Text className="font-inter-bold text-center text-xl text-white">
              {`${Math.min(Math.round(progress * 100), 100)}%`}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
