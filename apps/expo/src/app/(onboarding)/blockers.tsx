// app/(onboarding)/blockers.tsx
import React, { useState } from 'react'
import { View, Text, SafeAreaView, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { OnboardingHeader, OptionCard, StyledButton } from '@/components/core' // Adjust path if needed

const blockers = [
  {
    id: 'motivation',
    emoji: '😞',
    text: 'Lack of motivation',
    iconBg: 'bg-red-100'
  },
  {
    id: 'schedule',
    emoji: '⏰',
    text: 'Busy schedule',
    iconBg: 'bg-yellow-100'
  },
  {
    id: 'food',
    emoji: '🍔',
    text: 'Struggle with food',
    iconBg: 'bg-green-100'
  },
  { id: 'plan', emoji: '📝', text: 'No clear plan', iconBg: 'bg-purple-100' }
]

export default function BlockersScreen() {
  const router = useRouter()
  const [selectedBlockers, setSelectedBlockers] = useState<string[]>([])

  const toggleBlocker = (id: string) => {
    setSelectedBlockers((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    )
  }

  const handleContinue = () => {
    // Store selectedBlockers if needed
    router.push('/(onboarding)/frequency')
  }

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
          {blockers.map((blocker) => (
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
