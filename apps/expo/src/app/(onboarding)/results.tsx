// app/(onboarding)/results.tsx
import { StyledButton } from "@/components/core";
import { transformationStore$ } from "@/stores/transformation.store";
import { use$ } from "@legendapp/state/react";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Dimensions, SafeAreaView, ScrollView, Text, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Analytics } from "@/lib/analytics";
import { authClient } from "@/utils/auth";
import { getOrCreateDeviceId } from "@/utils/device-id";
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking';
import Purchases from "react-native-purchases";

const { width: screenWidth } = Dimensions.get("window"); // Get screen width

function ResultsScreen() {
  const router = useRouter();
  const confettiRef = useRef<ConfettiCannon>(null); // Create a ref for the confetti cannon
  const bodyRating = use$(transformationStore$.bodyRating);
  const searchParams = useLocalSearchParams<{ unlocked?: string }>();
  const isUnlocked = searchParams.unlocked === "true";
  const { data: session } = authClient.useSession();

  // Get the number of issues that are not null
  const issueCount = [
    bodyRating.issue1,
    bodyRating.issue2,
    bodyRating.issue3,
  ].filter(Boolean).length;

  const handleViewDetails = () => {
    if (isUnlocked) {
      // When unlocked, navigate to notifications screen first
      void router.push("/(onboarding)/notifications");
    } else {
      void router.push("/(onboarding)/paywall");
    }
  };

  // Track onboarding completion when unlocked is true
  useEffect(() => {
    if (isUnlocked) {
      void (async () => {
        try {
          const deviceId = await getOrCreateDeviceId();
          const userId = session?.user.id;
          Analytics.trackOnboardingComplete(deviceId, userId);
        } catch (error) {
          console.error('Failed to track onboarding completion:', error);
        }
      })();
    } else {
      void Purchases.getOfferings().then((offerings) => {
        const availablePackages = offerings.all.default?.availablePackages;
        // TODO: Cache the packages in the store
        // paywallStore$.packages.set(availablePackages);
      });
    }
  }, [isUnlocked, session]);

  // Trigger confetti shortly after the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      confettiRef.current?.start();
    }, 300); // Delay slightly to allow screen to render

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    // Changed background to dark purple/black gradient
    <LinearGradient
      colors={["#FED0E2", "#FED0E2", "#fff"]} // Dark Purple to Black Gradient
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{ paddingTop: Constants.statusBarHeight, flex: 1 }}
        // Removed className="flex-1 bg-white"
      >
        {/* Confetti Cannon - Place it high in the hierarchy, outside ScrollView */}
        <ConfettiCannon
          ref={confettiRef}
          count={150} // Number of confetti pieces
          origin={{ x: screenWidth / 2, y: -20 }} // Start from top center, slightly above screen
          autoStart={false} // We start it manually with the ref
          fadeOut={true}
          explosionSpeed={400} // How fast they shoot out
          fallSpeed={3000} // How fast they fall
          colors={["#a855f7", "#ec4899", "#f9a8d4", "#ffffff", "#ddd6fe"]} // Purple, Pink, Light Pink, White, Light Purple
        />

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 40, // Add padding at the bottom
          }}
          showsVerticalScrollIndicator={false} // Hide scrollbar for cleaner look
        >
          <View className="px-6 pt-6">
            {/* Changed text color to white/light for dark background */}
            <Text className="font-inter-bold mb-8 text-center text-3xl text-primary">
              You're all set 👀
            </Text>

            {/* Score Cards - Adjusted styling for dark mode */}
            <View className="relative">
              {/* Removed the explicit glow effect View, relying on shadows/backgrounds */}
              <View className="mb-6 flex-row justify-between">
                {/* Card 1: Current Score */}
                <View
                  className="mr-2 flex-1 rounded-2xl border border-pink-100 bg-pink-50/90 p-4 shadow-lg shadow-purple-500/30"
                  // Removed inline style shadows, using Tailwind shadows
                >
                  <Text className="font-inter-medium mb-2 text-center text-gray-600">
                    Current snatched score
                  </Text>
                  <Text className="font-inter-bold text-center text-3xl text-pink-400">
                    {bodyRating.currentSnatchedScore ?? 55}{" "}
                    {/* Use actual value or fallback */}
                  </Text>
                </View>
                {/* Card 2: Potential Score */}
                <View className="ml-2 flex-1 rounded-2xl border border-pink-100 bg-pink-50/90 p-4 shadow-lg shadow-purple-500/30">
                  <Text className="font-inter-medium mb-2 text-center text-gray-600">
                    Potential snatched score
                  </Text>
                  <Text className="font-inter-bold text-center text-3xl text-pink-400">
                    {bodyRating.potentialSnatchedScore ?? 98}{" "}
                    {/* Use actual value or fallback */}
                  </Text>
                </View>
              </View>
            </View>

            {/* Optimization Target - Adjusted styling */}
            <View className="mb-6 rounded-2xl border border-pink-100 bg-pink-50 p-4">
              <Text className="font-inter-medium text-center text-gray-600">
                You can reduce your waist by{" "}
                <Text className="font-inter-bold">
                  {bodyRating.potentialWaistReductionInches ?? "🔒"}
                </Text>{" "}
                inch(es) <Text className="">📈</Text>
              </Text>
            </View>

            {/* Progress Graph or Issues Section */}
            <View className="mb-6 rounded-2xl border border-pink-100 bg-pink-50 p-4 shadow-lg shadow-purple-500/30">
              <View className="mb-3 flex-row items-center justify-between px-2">
                <View className="flex-row items-center">
                  <View className="mr-2 h-2.5 w-2.5 rounded-full bg-[#A855F7]" />
                  <Text className="font-inter-medium text-gray-600">
                    Areas for Improvement
                  </Text>
                </View>
                {/* Issue Count Badge */}
                <View className="rounded-full bg-red-500/80 px-2.5 py-2">
                  <Text className="font-inter-medium text-xs text-white">
                    {issueCount} Issues found
                  </Text>
                </View>
              </View>

              <View className="gap-y-4">
                {isUnlocked ? (
                  [bodyRating.issue1, bodyRating.issue2, bodyRating.issue3].map(
                    (issue, index) => (
                      <View key={index} className="flex-row items-start">
                        <Text className="font-inter-bold mr-2 text-pink-500">
                          {index + 1}.
                        </Text>
                        <Text className="font-inter-medium flex-1 text-gray-700">
                          {issue}
                        </Text>
                      </View>
                    ),
                  )
                ) : (
                  <View className="items-center justify-center py-8">
                    <Text className="text-4xl mb-2">🔒</Text>
                    <Text className="font-inter-medium text-gray-600">Unlock to view your issues</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Visual Preview Grid */}
            <View className="relative">
              {/* Glow Effect */}
              {/* <View
                className="absolute"
                style={{
                  top: '50%', // Center vertically
                  left: '50%', // Center horizontally
                  width: 40,
                  height: 40,
                  marginTop: -20, // Offset by half height
                  marginLeft: -20, // Offset by half width
                  backgroundColor: '#FDF2F8', // Faint pink base
                  borderRadius: 20,
                  transform: [{ scale: 4 }], // Increased scale for broader glow
                  shadowColor: '#F9A8D4', // Pink shadow color
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8, // Maintained opacity
                  shadowRadius: 45, // Increased radius for wider spread
                  opacity: 0.7 // Maintained base opacity
                }}
              /> */}

              {/* Replace LinearGradient with View */}
              <View
                style={{
                  borderRadius: 20,
                  padding: 10,
                  justifyContent: "space-between",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  height: 300,
                  shadowColor: "#F6ADCE",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                {[
                  {
                    title: "Waist definition",
                    value: bodyRating.waistDefinition,
                  },
                  { title: "Hip curve", value: bodyRating.hipCurve },
                  { title: "Glute shape", value: bodyRating.gluteShape },
                  { title: "Posture", value: bodyRating.posture },
                  { title: "Arm shape", value: bodyRating.armShape },
                  {
                    title: "Back definition",
                    value: bodyRating.backDefinition,
                  },
                ].map(({ title, value }, index) => (
                  <View
                    key={index}
                    className="mb-4 aspect-square w-[48%] rounded-2xl border border-pink-400/20 bg-white/90 p-4"
                    style={{
                      shadowColor: "#F6ADCE",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 6,
                      elevation: 3,
                      transform: [{ scale: 1 }],
                    }}
                  >
                    <View className="mb-2 flex-col items-center justify-between gap-y-2">
                      <Text className="font-inter-medium text-center text-gray-800">
                        {title}
                      </Text>
                      <Text className="font-inter-bold text-center text-2xl text-pink-400">
                        {isUnlocked ? value : "🔒"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
          {/* Add Spacer if needed to push button down */}
          {/* <View style={{ flex: 1 }} /> */}
        </ScrollView>

        {/* Bottom Button Area - Ensure background matches */}
        <View className="bg-transparent px-5 pb-4 pt-4">
          {/* Adjusted Button Styling - Assuming StyledButton handles variants */}
          <StyledButton
            title="Continue"
            onPress={handleViewDetails}
            variant="primary" // Assuming a primary variant exists with appropriate styling
            style={{
              shadowColor: "#a855f7",
              shadowOpacity: 0.4,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
            }} // Added shadow
          />
        </View>
      </SafeAreaView>
    </LinearGradient> // Close LinearGradient
  );
}

export default withOnboardingTracking(ResultsScreen, 'results');
