// app/(onboarding)/blockers.tsx
import React from 'react'
import { View, SafeAreaView, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { OnboardingHeader, OptionCard, StyledButton } from '@/components/core'
import { challengeEnum } from '@omc/validators/onboarding'
import { onboardingStore$ } from '@/stores/onboarding.store'
import { use$ } from '@legendapp/state/react'
import * as Haptics from 'expo-haptics'

type Challenge = typeof challengeEnum.options[number]

// Map of challenge IDs to their display properties
type ChallengeMapType = Record<Challenge, {
  emoji: string
  iconBg: string
}>

const challengeMap: ChallengeMapType = {
  'Lack of motivation': {
    emoji: '😞',
    iconBg: 'bg-red-100'
  },
  'Busy schedule': {
    emoji: '⏰',
    iconBg: 'bg-yellow-100'
  },
  'Struggle with food': {
    emoji: '🍔',
    iconBg: 'bg-green-100'
  },
  'No clear plan': {
    emoji: '📝',
    iconBg: 'bg-purple-100'
  }
}

export default function BlockersScreen() {
  const router = useRouter()
  const selectedBlockers = use$(onboardingStore$.onboarding.blockers)

  const toggleBlocker = (id: Challenge) => {
    // Validate that the challenge is in our enum
    if (challengeEnum.safeParse(id).success) {
      onboardingStore$.onboarding.blockers.set((prev: string[]) =>
        prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
      )
    }
  }

  const handleContinue = () => {
    // Validate all selected challenges
    const validBlockers = selectedBlockers.every(blocker => challengeEnum.safeParse(blocker).success)
    if (selectedBlockers.length && validBlockers) {
      router.push('/(onboarding)/frequency')
    }
  }

  const challenges = challengeEnum.options.map(challenge => ({
    id: challenge,
    ...challengeMap[challenge],
    text: challenge
  }))

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={2 / 20} // Adjust total steps
          title="What's stopping you?"
          subtitle="Let us know your challenges so we can help you overcome them. Select all that apply."
        />

        <View className="flex-1 gap-y-4">
          {challenges.map((blocker) => (
            <OptionCard
              key={blocker.id}
              emoji={blocker.emoji}
              text={blocker.text}
              iconBg={blocker.iconBg}
              selected={selectedBlockers.includes(blocker.id)}
              onPress={() => toggleBlocker(blocker.id)}
            />
          ))}
        </View>

        <View className="mt-8">
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            disabled={selectedBlockers.length === 0}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
