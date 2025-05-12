// app/(onboarding)/frequency.tsx
import {
  OnboardingHeader,
  OptionCard,
  StyledButton
} from '@/components/core'
import { onboardingStore$ } from '@/stores/onboarding.store'
import { use$ } from '@legendapp/state/react'
import { activityLevelEnum } from '@omc/validators/onboarding'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import React from 'react'
import { SafeAreaView, ScrollView, View } from 'react-native'
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking'

type ActivityLevel = typeof activityLevelEnum.options[number]

// Map of activity levels to their display properties
type ActivityMapType = Record<ActivityLevel, {
  emoji: string
  iconBg: string
}>

const activityMap: ActivityMapType = {
  'Hardly ever': {
    emoji: '🐣',
    iconBg: 'bg-red-100'
  },
  'Once or twice a week': {
    emoji: '👟',
    iconBg: 'bg-orange-100'
  },
  '3 to 4 times a week': {
    emoji: '💪',
    iconBg: 'bg-green-100'
  },
  '5+ times a week': {
    emoji: '🔥',
    iconBg: 'bg-blue-100'
  }
}

function FrequencyScreen() {
  const router = useRouter()
  const selectedFrequency = use$(onboardingStore$.onboarding.frequency)

  const setFrequency = (level: ActivityLevel) => {
    console.log('***********************')
    console.log(onboardingStore$.onboarding.frequency.get())
    console.log('***********************')
    if (activityLevelEnum.safeParse(level).success) {
      onboardingStore$.onboarding.frequency.set(level)
    }
  }

  const handleContinue = () => {
    if (selectedFrequency && activityLevelEnum.safeParse(selectedFrequency).success) {
      router.push('/(onboarding)/avoid-setbacks')
    }
  }

  const frequencyOptions = activityLevelEnum.options.map(level => ({
    id: level,
    ...activityMap[level],
    text: level
  }))

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <OnboardingHeader
          progress={3 / 20}
          title="How often do you work out?"
          subtitle="We'll adjust your plan based on your current activity level."
        />

        <View className="mb-6 flex-1 gap-y-3">
          {frequencyOptions.map((option) => (
            <OptionCard
              key={option.id}
              emoji={option.emoji}
              text={option.text}
              iconBg={option.iconBg}
              selected={selectedFrequency === option.id}
              onPress={() => setFrequency(option.id)}
            />
          ))}
        </View>

        <View className="mt-8">
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedFrequency}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default withOnboardingTracking(FrequencyScreen, 'frequency')
