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

export default function FeatureSetbacksScreen() {
  const router = useRouter()
  const totalSteps = 6 // Total feature steps
  const currentStepIndex = 3 // This is the 4th screen (index 3)

  const handleNext = () => {
    router.push('/(onboarding)/feature-conquer') // Navigate to the next feature screen
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
          {/* Icon specific to this screen (shield-check) */}
          <View className="mb-8 h-16 w-16 items-center justify-center rounded-full bg-pink-100">
            {/* Using Ionicons shield-checkmark */}
            <Ionicons name="shield-checkmark-outline" size={30} color="black" />
          </View>

          {/* Title and Description for this specific screen */}
          <Text className="mb-4 text-center font-inter-bold text-2xl text-black">
            Avoid setbacks
          </Text>
          <Text className="mb-8 text-center font-inter text-black">
            Our AI coach helps you navigate challenges, adjust your plan when
            needed, and keep you on track even during difficult times.
          </Text>

          {/* Feature List specific to this screen */}
          <View className="mb-8 w-full rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <FeatureListItem text="Personalized obstacle planning" />
            <FeatureListItem text="Adaptive workout alternatives" />
            <FeatureListItem text="Craving management strategies" />
            <FeatureListItem text="24/7 AI coach support" />
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
