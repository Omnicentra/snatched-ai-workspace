import React, { useState } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { OnboardingHeader, OptionCard, StyledButton } from "@/components/core";

const ethnicityOptions = [
  { value: "white", label: "White / Caucasian" },
  { value: "black", label: "Black / African American" },
  { value: "hispanic", label: "Hispanic / Latino" },
  { value: "asian", label: "Asian" },
  { value: "middle_eastern", label: "Middle Eastern / Indigenous" },
  { value: "prefer_not_to_say", label: "I don't want to answer" },
] as const;

type EthnicityOption = (typeof ethnicityOptions)[number]["value"];

export default function EthnicityScreen() {
  const router = useRouter();
  const [selectedEthnicity, setSelectedEthnicity] = useState<EthnicityOption>();

  const handleContinue = () => {
    // Store selected ethnicity
    router.push("/(onboarding)/body-considerations");
  };

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        contentContainerClassName="p-8"
      >
        <OnboardingHeader
          progress={8 / 20}
          title="What's your ethnicity?"
          subtitle="Optional - helps personalise body shape and styling advice."
        />

        <View className="mb-8 w-full gap-y-3">
          {ethnicityOptions.map((option) => (
            <OptionCard
              selected={selectedEthnicity === option.value}
              text={option.label}
              key={option.value}
              onPress={() => setSelectedEthnicity(option.value)}
            />
          ))}
        </View>

        {/* <InfoCard
          icon={
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="black"
            />
          }
          text="This information helps us provide more accurate body shape analysis and personalized styling recommendations."
        /> */}
      </ScrollView>

      <View className="mt-auto p-8">
        <StyledButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedEthnicity}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}
