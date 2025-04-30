// app/(onboarding)/cycle.tsx
import React, { useState } from 'react'
import { View, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import {
  OnboardingHeader,
  OptionCard,
  StyledButton
} from '@/components/core'
import { onboardingStore$ } from '@/stores/onboarding.store'
import { menstrualCycleStatusEnum } from '@omc/validators/onboarding'
import { z } from 'zod'
import { use$ } from '@legendapp/state/react'

type MenstrualCycleStatus = z.infer<typeof menstrualCycleStatusEnum>;

const cycleValidationSchema = z.object({
  menstrual_cycle_status: menstrualCycleStatusEnum,
});

export default function CycleScreen() {
  const router = useRouter()
  const selectedCycle = use$(onboardingStore$.onboarding.menstruralCycle);

  const handleContinue = () => {
    if (!selectedCycle) return;

    const cycleData = {
      menstrual_cycle_status: selectedCycle,
    };

    const result = cycleValidationSchema.safeParse(cycleData);

    if (result.success) {
      if (selectedCycle === "Yes - Regular" || selectedCycle === "Yes - Irregular") {
        router.push('/(onboarding)/period-date')
      } else {
        // Skip period date and cravings if 'No' or 'Prefer not to say'
        router.push('/(onboarding)/dietary-preferences')
      }
    } else {
      console.error("Cycle validation failed:", result.error);
    }
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <View style={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={12 / 20}
          title="Do you get a menstrual cycle?"
          subtitle="This helps us optimize your plan around your hormonal cycles."
          className='mb-0'
        />

        <View className="mb-8 flex-1 gap-y-4">
          {menstrualCycleStatusEnum.options.map((option) => (
            <OptionCard
              key={option}
              text={option}
              selected={selectedCycle === option}
              onPress={() => onboardingStore$.onboarding.menstruralCycle.set(option)}
            />
          ))}
        </View>
      </View>

      <View className="mt-auto p-8">
        <StyledButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedCycle}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  )
}
