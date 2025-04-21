// app/(onboarding)/frequency.tsx
import React, { useState } from 'react'
import { View, Text, SafeAreaView, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import {
  OnboardingHeader,
  OptionCard,
  InfoCard,
  StyledButton
} from '@/components/core'
import { Ionicons } from '@expo/vector-icons'

const frequencyOptions = [
  { id: 'hardly_ever', emoji: '🐣', text: 'Hardly ever', iconBg: 'bg-red-100' },
  {
    id: '1_2_week',
    emoji: '👟',
    text: 'Once or twice a week',
    iconBg: 'bg-orange-100'
  },
  {
    id: '3_4_week',
    emoji: '💪',
    text: '3 to 4 times a week',
    iconBg: 'bg-green-100'
  },
  {
    id: '5_plus_week',
    emoji: '🔥',
    text: '5+ times a week',
    iconBg: 'bg-blue-100'
  }
]

export default function FrequencyScreen() {
  const router = useRouter()
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(
    null
  )

  const handleContinue = () => {
    // Store selectedFrequency
    router.push('/(onboarding)/avoid-setbacks')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        {/* Adjusted padding to match HTML */}
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
              onPress={() => setSelectedFrequency(option.id)}
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
          text="We'll start with workouts that match your current fitness level and gradually increase intensity."
          iconBg="bg-yellow-100" // Matched HTML
        /> */}

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
