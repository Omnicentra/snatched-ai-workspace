// app/(onboarding)/timeline-goal.tsx
import { OnboardingHeader, OptionCard, StyledButton } from '@/components/core'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { SafeAreaView, ScrollView, View } from 'react-native'

const timelineOptions = [
  {
    id: 'asap',
    emoji: '🚀',
    text: 'As soon as possible',
    description: "We'll build a fast-tracked plan",
    iconBg: 'bg-red-100'
  },
  {
    id: '1_2_months',
    emoji: '🗓️',
    text: 'In 1–2 months',
    description: "You'll be snatched by early summer",
    iconBg: 'bg-blue-100'
  },
  {
    id: '3_6_months',
    emoji: '📅',
    text: 'In 3–6 months',
    description: 'Gradually and sustainably',
    iconBg: 'bg-green-100'
  },
  {
    id: 'no_rush',
    emoji: '🌸',
    text: 'No rush, just want to feel better',
    description: 'For chill vibes, at your pace',
    iconBg: 'bg-pink-100'
  }
]

export default function TimelineGoalScreen() {
  const router = useRouter()
  const [selectedTimeline, setSelectedTimeline] = useState<string>('1_2_months') // Default

  const handleContinue = () => {
    // Store selectedTimeline
    // Start the "analysis" process
    router.push('/(onboarding)/paywall')
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
            // Using OptionCard directly and passing structured text
            <OptionCard
              key={option.id}
              emoji={option.emoji}
              text={option.text} // Combine text and description
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
