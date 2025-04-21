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

interface BodyConsideration {
  id: string;
  icon: string;
  title: string;
  description: string;
  iconBg: string;
}

const bodyConsiderations: BodyConsideration[] = [
  {
    id: "hip_dips",
    icon: "🍑",
    title: "I want to smooth my hip dips",
    description: "Target my side booty area for more shape and roundness.",
    iconBg: "bg-red-100",
  },
  {
    id: "wide_ribcage",
    icon: "✨",
    title: "I have a wide rib cage",
    description:
      "I want styling and sculpting tricks to create more waist definitions.",
    iconBg: "bg-pink-100",
  },
  {
    id: "scoliosis",
    icon: "🫁",
    title: "I have scoliosis or back sensitivity",
    description: "I want posture-friendly or lower-impact exercise plans",
    iconBg: "bg-blue-100",
  },
  {
    id: "straight_shape",
    icon: "🦴",
    title: "I feel like I have a straight body shape",
    description: "I want to build more curves and definition",
    iconBg: "bg-purple-100",
  },
  {
    id: "custom",
    icon: "✏️",
    title: "I have something else to mention",
    description:
      "Tell us about any other body considerations we should know about.",
    iconBg: "bg-gray-100",
  },
];

const ConsiderationCard = ({
  consideration,
  selected,
  onPress,
}: {
  consideration: BodyConsideration;
  selected: boolean;
  onPress: () => void;
}) => (
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
      className={`${consideration.iconBg} h-10 w-10 items-center justify-center rounded-lg`}
    >
      <Text className="text-xl">{consideration.icon}</Text>
    </View>
    <View className="ml-4 flex-1">
      <Text className="font-inter-semibold text-base text-black">
        {consideration.title}
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

export default function BodyConsiderationsScreen() {
  const router = useRouter();
  const [selectedConsiderations, setSelectedConsiderations] = useState<
    Set<string>
  >(new Set());
  const [customConsideration, setCustomConsideration] = useState("");

  const toggleConsideration = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSelectedConsiderations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleContinue = () => {
    // Store selected considerations and custom text if needed
    router.push("/(onboarding)/transformation-intro");
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
            {bodyConsiderations.map((consideration) => (
              <ConsiderationCard
                key={consideration.id}
                consideration={consideration}
                selected={selectedConsiderations.has(consideration.id)}
                onPress={() => toggleConsideration(consideration.id)}
              />
            ))}

            {/* Custom consideration text input */}
            {selectedConsiderations.has("custom") && (
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
            disabled={selectedConsiderations.size === 0}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
