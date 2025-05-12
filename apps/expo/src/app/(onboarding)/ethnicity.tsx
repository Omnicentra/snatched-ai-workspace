import { OnboardingHeader, OptionCard, StyledButton } from "@/components/core";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { use$ } from "@legendapp/state/react";
import { ethnicityEnum } from "@omc/validators/onboarding";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { z } from "zod";
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking';

const ethnicityValidationSchema = z.object({
  ethnicity: ethnicityEnum.optional(),
});

function EthnicityScreen() {
  const router = useRouter();
  const selectedEthnicity = use$(onboardingStore$.onboarding.ethnicity);

  const handleContinue = () => {
    const result = ethnicityValidationSchema.safeParse({ ethnicity: selectedEthnicity });

    if (result.success) {
      router.push("/(onboarding)/body-considerations");
    } else {
      console.error("Ethnicity validation failed:", result.error);
    }
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
          {ethnicityEnum.options.map((option) => (
            <OptionCard
              selected={selectedEthnicity === option}
              text={option}
              key={option}
              onPress={() => onboardingStore$.onboarding.ethnicity.set(option)}
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
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

export default withOnboardingTracking(EthnicityScreen, 'ethnicity');
