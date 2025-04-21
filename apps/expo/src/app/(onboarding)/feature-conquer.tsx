import React from 'react'
import { View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { StyledButton, CarouselIndicator } from '@/components/core'
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons' // Import icons needed

// Reusable list item component
const FeatureListItem = ({ text }: { text: string }) => (
  <View className="mb-3 flex-row items-start">
    <Feather
      name="check-circle"
      size={18}
      color="#F472B6"
      className="mr-2 mt-0.5"
    />
    <Text className="flex-1 font-inter text-sm text-black">{text}</Text>
  </View>
)

export default function FeatureConquerScreen() {
  const router = useRouter()
  const totalSteps = 6 // Total feature steps
  const currentStepIndex = 4 // This is the 5th screen (index 4)

  const handleNext = () => {
    router.push('/(onboarding)/feature-get-snatched') // Navigate to the final feature screen
  }

  const handleSkip = () => {
    router.push('/(onboarding)/custom-plan-generated')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center p-8">
          {/* Icon specific to this screen (mental-health/brain) */}
          <View className="mb-8 h-16 w-16 items-center justify-center rounded-full bg-pink-100">
            {/* Using Ionicons happy-outline as a placeholder for mental health */}
            <Ionicons name="happy-outline" size={30} color="black" />
          </View>

          {/* Title and Description for this specific screen */}
          <Text className="mb-4 text-center font-inter-bold text-2xl text-black">
            Conquer yourself
          </Text>
          <Text className="mb-8 text-center font-inter text-black">
            Transform your mindset along with your body. Build confidence,
            discipline, and a positive relationship with yourself.
          </Text>

          {/* Feature List specific to this screen */}
          <View className="mb-8 w-full rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <FeatureListItem text="Mindset training exercises" />
            <FeatureListItem text="Body positivity reinforcement" />
            <FeatureListItem text="Habit-building techniques" />
            <FeatureListItem text="Self-confidence boosters" />
          </View>

          {/* Indicator */}
          <CarouselIndicator
            count={totalSteps}
            activeIndex={currentStepIndex}
          />
        </View>

        {/* Button */}
        <View className="mt-auto p-8">
          <View className="flex flex-col gap-y-4">
            <StyledButton title="Continue" onPress={handleNext} variant="primary" />
            <StyledButton title="Skip" onPress={handleSkip} variant="ghost" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
