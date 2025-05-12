// app/(onboarding)/health.tsx
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  TextInput,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import {
  OnboardingHeader,
  OptionCard,
  StyledButton,
} from "@/components/core";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { medicalConditionResponseEnum } from "@omc/validators/onboarding";
import { z } from "zod";
import { use$ } from "@legendapp/state/react";
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking';

type MedicalConditionResponse = z.infer<typeof medicalConditionResponseEnum>;

const healthValidationSchema = z.object({
  has_medical_conditions: medicalConditionResponseEnum,
  medical_conditions_details: z.string().optional(),
});

function HealthScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<MedicalConditionResponse>();
  const healthDetails = use$(onboardingStore$.onboarding.healthConditions);

  const handleContinue = () => {
    if (!selectedOption) return;

    const healthData = {
      has_medical_conditions: selectedOption,
      medical_conditions_details: selectedOption === "Yes" ? healthDetails : undefined,
    };

    const result = healthValidationSchema.safeParse(healthData);

    if (result.success) {
      onboardingStore$.onboarding.hasHealthConditions.set(selectedOption === "Yes");
      router.push("/(onboarding)/cycle");
    } else {
      console.error("Health validation failed:", result.error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={{ paddingTop: Constants.statusBarHeight }}
        className="flex-1 bg-white"
      >
        <View style={{ flexGrow: 1 }} className="p-8">
          <KeyboardAvoidingView behavior="padding" className="flex-1">
            <OnboardingHeader
              progress={11 / 20}
              title="Medical/Health Conditions?"
              subtitle="This helps us ensure your plan is safe and suitable for you."
            />

            <View className="mb-8 flex-1 gap-y-4">
              {medicalConditionResponseEnum.options.map((option) => (
                <OptionCard
                  key={option}
                  text={option}
                  selected={selectedOption === option}
                  onPress={() => setSelectedOption(option)}
                />
              ))}
              
              {selectedOption === "Yes" && (
                <View className="mt-4 mb-8">
                  <Text className="font-inter-medium mb-2 text-sm">
                    Please specify (optional):
                  </Text>
                  <TextInput
                    placeholder="E.g., Knee injury, Diabetes"
                    className="w-full rounded-xl border border-gray-200 p-4 text-base text-black"
                    multiline
                    value={healthDetails}
                    onChangeText={(text) => onboardingStore$.onboarding.healthConditions.set(text)}
                  />
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>

        <View className="mt-auto p-8">
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedOption}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

export default withOnboardingTracking(HealthScreen, 'health');
