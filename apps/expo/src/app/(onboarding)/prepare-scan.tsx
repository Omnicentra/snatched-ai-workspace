import React from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { InfoCard, OnboardingHeader, StyledButton } from "@/components/core";
import { withOnboardingTracking } from "@/components/core/withOnboardingTracking";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Analytics } from "@/lib/analytics";
import { getOrCreateDeviceId } from "@/utils/device-id";
import { authClient } from "@/utils/auth";
import { SafeAreaViewWrapper } from "@/components/common/platform-safe-area-view";

// Reusable Tip Card Component
const TipCard = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <View className="mb-3 flex-row items-center rounded-xl border border-gray-100 bg-white p-4">
    <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-pink-50">
      {icon}
    </View>
    <Text className="font-inter flex-1 text-sm text-gray-600">{text}</Text>
  </View>
);

function PrepareScanScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleContinue = async () => {
    const deviceId = await getOrCreateDeviceId();
    Analytics.trackPrepareScanAction(deviceId, session?.user.id, 'continue');
    router.push("/(onboarding)/scan-front");
  };

  const handleSkip = async () => {
    const deviceId = await getOrCreateDeviceId();
    Analytics.trackPrepareScanAction(deviceId, session?.user.id, 'skip');
    router.push("/(onboarding)/desired-shape?skipped=true");
  };

  const openPrivacyPolicy = () => {
    // Replace with your actual URL
    void Linking.openURL("https://snatchedai.com/privacy");
  };
  const openTerms = () => {
    // Replace with your actual URL
    void Linking.openURL("https://snatchedai.com/terms");
  };
  const openEULA = () => {
    void Linking.openURL(
      "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
    );
  };

  return (
    <SafeAreaViewWrapper
      className="flex-1 bg-white pb-4"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} contentContainerClassName="p-8">
        <OnboardingHeader progress={17 / 20} />

        {/* Hourglass Icon in Circle */}
        <View className="mb-8 items-center">
          <View className="h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-pink-200 bg-pink-50">
            <MaterialCommunityIcons
              name="timer-sand"
              size={48}
              color="#f472b6"
            />
          </View>
        </View>

        {/* Main Title */}
        <Text className="font-inter-bold mb-3 text-center text-3xl text-black">
          Thank you for trusting{"\n"}Snatched AI
        </Text>

        {/* Subtitle */}
        <Text className="mb-6 text-center text-lg text-gray-600">
          Let's personalise your transformation journey...
        </Text>

        {/* Photo Tips Section */}
        <View className="mb-6">
          <Text className="font-inter-medium mb-4 text-base text-black">
            We'll need 3 photos to create your custom plan:
          </Text>
          <TipCard
            icon={
              <MaterialCommunityIcons
                name="camera-front"
                size={20}
                color="#f472b6"
              />
            }
            text="Front view - facing the camera"
          />
          <TipCard
            icon={
              <MaterialCommunityIcons name="camera" size={20} color="#f472b6" />
            }
            text="Side view - your right side"
          />
          <TipCard
            icon={
              <MaterialCommunityIcons
                name="camera-rear"
                size={20}
                color="#f472b6"
              />
            }
            text="Back view - facing away from camera"
          />
        </View>

        {/* Quick Tips Section */}
        <View className="mb-6">
          <Text className="font-inter-medium mb-4 text-base text-black">
            For best results:
          </Text>
          <TipCard
            icon={
              <MaterialCommunityIcons
                name="tshirt-crew"
                size={20}
                color="#f472b6"
              />
            }
            text="Wear fitted clothing or activewear"
          />
          <TipCard
            icon={<Ionicons name="sunny" size={20} color="#f472b6" />}
            text="Find a well-lit area with a plain background"
          />
          <TipCard
            icon={
              <MaterialCommunityIcons name="ruler" size={20} color="#f472b6" />
            }
            text="Stand naturally with feet shoulder-width apart"
          />
        </View>

        {/* Privacy Notice */}
        <InfoCard
          icon={
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={24}
              color="#FF9999"
            />
          }
          text="Your photos are processed securely and privately. They're never shared and are automatically deleted after analysis."
          iconBg="bg-pink-100"
          className="mb-6"
        />
      </ScrollView>
      <View className="mt-auto px-8">
        <View className="justify-center gap-y-4">
          <StyledButton
            title="I'm ready to take photos"
            onPress={handleContinue}
            variant="primary"
            icon={<Ionicons name="camera-outline" size={20} color="white" />}
          />
          <StyledButton
            title="Skip for now"
            onPress={handleSkip}
            variant="secondary"
            className="mt-3"
          />
        </View>
        <View className="mt-4 items-center">
          <Text className="text-center text-xs text-gray-600">
            By continuing, you agree to our{" "}
            <Text
              className="font-inter-medium text-black underline"
              onPress={openTerms}
            >
              Terms
            </Text>
            <Text>{", "}</Text>
            <Text
              className="font-inter-medium text-black underline"
              onPress={openPrivacyPolicy}
            >
              Privacy Policy
            </Text>
            <Text>{", and "}</Text>
            <Text
              className="font-inter-medium text-black underline"
              onPress={openEULA}
            >
              EULA
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaViewWrapper>
  );
}

export default withOnboardingTracking(PrepareScanScreen, "prepare_scan");
