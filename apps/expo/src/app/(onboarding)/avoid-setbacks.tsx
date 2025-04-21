import React, { useState } from 'react'
import { View, SafeAreaView, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { OnboardingHeader, OptionCard, StyledButton } from '@/components/core'
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5
} from '@expo/vector-icons'

const previousExperiences = [
  {
    id: 'calorie_counting',
    icon: <Ionicons name="time-outline" size={24} color="black" />,
    text: 'Calorie counting',
    description: 'Tracking macros, calories, or using apps like MyFitnessPal.',
    iconBg: 'bg-red-100'
  },
  {
    id: 'gym_workouts',
    icon: <MaterialCommunityIcons name="dumbbell" size={24} color="black" />,
    text: 'Gym workouts',
    description: 'Weight training, machines, classes, in a gym setting.',
    iconBg: 'bg-blue-100'
  },
  {
    id: 'pilates_home',
    icon: <MaterialCommunityIcons name="yoga" size={24} color="black" />,
    text: 'Pilates / home workouts',
    description: 'YouTube videos, IG routines, bodyweight exercises at home.',
    iconBg: 'bg-green-100'
  },
  {
    id: 'tiktok_plans',
    icon: <FontAwesome5 name="tiktok" size={24} color="black" />,
    text: 'TikTok fitness plans',
    description: 'Chloe Ting, Hot Girl Walks, Booty Day trends, etc.',
    iconBg: 'bg-purple-100'
  }
]

export default function AvoidSetbacksScreen() {
  const router = useRouter()
  const [selectedExperiences, setSelectedExperiences] = useState<Set<string>>(
    new Set()
  )

  const toggleExperience = (id: string) => {
    setSelectedExperiences((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleContinue = () => {
    // Store selected experiences
    router.push('/(onboarding)/ideal-body')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <OnboardingHeader
          progress={4 / 20}
          title="What have you tried before?"
          subtitle="We'll use this to tailor your plan to what works for you and skip what doesn't."
        />

        <View className="flex-1 gap-y-4">
          {previousExperiences.map((experience) => (
            <OptionCard
              key={experience.id}
              icon={experience.icon}
              text={experience.text}
              iconBg={experience.iconBg}
              selected={selectedExperiences.has(experience.id)}
              onPress={() => toggleExperience(experience.id)}
            />
          ))}
        </View>

        <View className="py-6">
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            disabled={selectedExperiences.size === 0}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
