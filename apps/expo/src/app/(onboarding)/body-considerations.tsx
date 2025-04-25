import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { OnboardingHeader, StyledButton } from "@/components/core";
import { Ionicons } from "@expo/vector-icons";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { bodyConcernEnum } from "@omc/validators/onboarding";
import { z } from "zod";
import { use$ } from "@legendapp/state/react";

type BodyConcern = z.infer<typeof bodyConcernEnum>;

const bodyConsiderationSchema = z.object({
  bodyDescription: z.array(bodyConcernEnum),
  otherBodyDetails: z.string().optional(),
});

interface ConsiderationDisplay {
  value: BodyConcern;
  icon: string;
  description: string;
  iconBg: string;
}

const bodyConsiderationDisplayMap: Record<BodyConcern, Omit<ConsiderationDisplay, 'value'>> = {
  "I want to smooth my hip dips": {
    icon: "🍑",
    description: "Target my side booty area for more shape and roundness.",
    iconBg: "bg-red-100",
  },
  "I have a wide rib cage": {
    icon: "✨",
    description: "I want styling and sculpting tricks to create more waist definitions.",
    iconBg: "bg-pink-100",
  },
  "I have scoliosis or back sensitivity": {
    icon: "🫁",
    description: "I want posture-friendly or lower-impact exercise plans",
    iconBg: "bg-blue-100",
  },
  "I feel like I have a straight body shape": {
    icon: "🦴",
    description: "I want to build more curves and definition",
    iconBg: "bg-purple-100",
  },
  "I have something else to mention": {
    icon: "✏️",
    description: "Tell us about any other body considerations we should know about.",
    iconBg: "bg-gray-100",
  },
};

const ConsiderationCard = ({
  concern,
  selected,
  onPress,
}: {
  concern: BodyConcern;
  selected: boolean;
  onPress: () => void;
}) => {
  const display = bodyConsiderationDisplayMap[concern];
  return (
  <Pressable
    onPress={onPress}
    className={`mb-3 flex-row items-center rounded-xl border p-4 ${
      selected ? "border-pink-400 bg-pink-50" : "border-gray-200 bg-white"
    }`}
    style={{
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    }}
  >
    <View
        className={`${display.iconBg} h-10 w-10 items-center justify-center rounded-lg`}
    >
        <Text className="text-xl">{display.icon}</Text>
    </View>
    <View className="ml-4 flex-1">
      <Text className="font-inter-semibold text-base text-black">
          {concern}
      </Text>
    </View>
    {selected && (
      <View className="ml-2">
        <View className="rounded-full bg-pink-400 p-1">
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      </View>
    )}
  </Pressable>
);
};

export default function BodyConsiderationsScreen() {
  const router = useRouter();
  const [customConsideration, setCustomConsideration] = useState("");
  const selectedConcerns = use$(onboardingStore$.onboarding.bodyDescription);

  const toggleConcern = (concern: BodyConcern) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onboardingStore$.onboarding.bodyDescription.set((prev) => 
      prev.includes(concern) ? prev.filter((bId) => bId !== concern) : [...prev, concern]
    );
  };

  const handleContinue = () => {
    const concerns = Array.from(selectedConcerns);
    const result = bodyConsiderationSchema.safeParse({
      bodyDescription: concerns,
      otherBodyDetails: concerns.includes("I have something else to mention") ? customConsideration : undefined,
    });

    if (result.success) {
      onboardingStore$.onboarding.bodyDescription.set(concerns);
      if (customConsideration) {
        // Only set other details if custom concern is selected and there's text
        onboardingStore$.onboarding.otherBodyDetails.set(customConsideration);
      }
    router.push("/(onboarding)/transformation-intro");
    } else {
      console.error("Body concerns validation failed:", result.error);
    }
  };

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView className="flex-1 px-6">
          <OnboardingHeader
            progress={9 / 20}
            title="Tell us about your body?"
          />

          <View>
            {bodyConcernEnum.options.map((concern) => (
              <ConsiderationCard
                key={concern}
                concern={concern}
                selected={selectedConcerns.includes(concern)}
                onPress={() => toggleConcern(concern)}
              />
            ))}

            {/* Custom consideration text input */}
            {selectedConcerns.includes("I have something else to mention") && (
              <View className="mb-6 mt-2">
                <Text className="font-inter-medium mb-2 text-sm text-gray-600">
                  Please tell us more:
                </Text>
                <TextInput
                  placeholder="E.g., Shoulder mobility issues, pregnancy"
                  className="w-full rounded-xl border border-gray-200 p-4 text-base text-black"
                  multiline
                  value={customConsideration}
                  onChangeText={setCustomConsideration}
                  style={{ minHeight: 100 }}
                />
              </View>
            )}
          </View>
        </ScrollView>

        <View className="p-6">
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            disabled={selectedConcerns.length === 0}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
