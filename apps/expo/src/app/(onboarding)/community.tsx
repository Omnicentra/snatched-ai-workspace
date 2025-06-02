import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import YogaPose from "@/assets/images/yoga_pose.png";
import { OnboardingHeader, StyledButton } from "@/components/core";
import { withOnboardingTracking } from "@/components/core/withOnboardingTracking";

function CommunityScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/(onboarding)/name-age");
  };

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={15 / 20}
          title="Join Our Community"
          subtitle="Let's get you started on your transformation journey."
        />

        <View className="flex-1 items-center justify-center">
          {/* Circular container for the icon */}
          <View className="mb-8 h-40 w-40 items-center justify-center rounded-full bg-[#f472b6]">
            <Image
              source={YogaPose}
              style={{ width: 60, height: 60 }}
              contentFit="contain"
            />
          </View>

          <Text className="font-inter-bold mb-4 text-center text-3xl">
            Join Our Community
          </Text>

          <Text className="font-inter-regular mb-8 text-center text-lg text-gray-600">
            Over <Text className="font-inter-bold text-purple-600">1,000+ queens</Text> are already stretching, flexing, and slaying
            their way through pilates, yoga, and at-home workouts, and getting
            snatched!
          </Text>
        </View>

        <View className="mt-auto">
          <StyledButton
            title="GET STARTED"
            onPress={handleGetStarted}
            className="flex flex-row gap-x-3 rounded-full"
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default withOnboardingTracking(CommunityScreen, "community");
