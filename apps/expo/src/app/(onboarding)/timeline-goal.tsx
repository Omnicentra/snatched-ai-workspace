// app/(onboarding)/timeline-goal.tsx
import { OnboardingHeader, OptionCard, StyledButton } from '@/components/core'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { SafeAreaView, ScrollView, View } from 'react-native'
import { timelineEnum } from '@omc/validators/onboarding'
import type { z } from 'zod'
import { onboardingStore$ } from '@/stores/onboarding.store'

interface TimelineOption {
  id: z.infer<typeof timelineEnum>
  emoji: string
  text: string
  description: string
  iconBg: string
}

const timelineOptions: TimelineOption[] = [
  {
    id: 'As soon as possible',
    emoji: '🚀',
    text: 'As soon as possible',
    description: "We'll build a fast-tracked plan",
    iconBg: 'bg-red-100'
  },
  {
    id: 'In 1-2 months',
    emoji: '🗓️',
    text: 'In 1-2 months',
    description: "You'll be snatched by early summer",
    iconBg: 'bg-blue-100'
  },
  {
    id: 'In 3-6 months',
    emoji: '📅',
    text: 'In 3-6 months',
    description: 'Gradually and sustainably',
    iconBg: 'bg-green-100'
  },
  {
    id: 'No rush, just want to feel better',
    emoji: '🌸',
    text: 'No rush, just want to feel better',
    description: 'For chill vibes, at your pace',
    iconBg: 'bg-pink-100'
  }
]

export default function TimelineGoalScreen() {
  const router = useRouter()
  const [selectedTimeline, setSelectedTimeline] = useState<z.infer<typeof timelineEnum>>('In 1-2 months')

  const handleContinue = () => {
    // Store selectedTimeline in the store
    onboardingStore$.onboarding.goalTimeline.set(selectedTimeline)
    router.push('/(onboarding)/signup')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <OnboardingHeader
          progress={20 / 20}
          title="When do you want to achieve this?"
          subtitle="We'll create a timeline that works for your goals."
        />

        <View className="mb-5 gap-y-4">
          {timelineOptions.map((option) => (
            <OptionCard
              key={option.id}
              emoji={option.emoji}
              text={option.text}
              iconBg={option.iconBg}
              selected={selectedTimeline === option.id}
              onPress={() => setSelectedTimeline(option.id)}
            />
          ))}
        </View>

        <View className="mt-auto pt-8">
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedTimeline}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
