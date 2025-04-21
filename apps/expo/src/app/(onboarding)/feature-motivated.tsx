// app/(onboarding)/feature-motivated.tsx
import React from 'react'
import { View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { StyledButton, CarouselIndicator } from '@/components/core'
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons' // Import icons needed

// Reusable list item component (like in Screen 23/41/42/43/44)
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

export default function FeatureMotivatedScreen() {
  const router = useRouter()
  const totalSteps = 6 // Total feature steps
  const currentStepIndex = 2 // Update index for each screen (0-based)

  const handleNext = () => {
    // Navigate to the next feature screen or final destination
    router.push('/(onboarding)/feature-setbacks') // Example
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
          {/* Icon specific to this screen (e.g., heart-pulse for motivated) */}
          <View className="mb-8 h-16 w-16 items-center justify-center rounded-full bg-pink-100">
            <Ionicons name="heart-outline" size={30} color="black" />
          </View>

          {/* Title and Description for this specific screen */}
          <Text className="mb-4 text-center font-inter-bold text-2xl text-black">
            Stay motivated
          </Text>
          <Text className="mb-8 text-center font-inter text-black">
            We'll keep you inspired and on track with daily motivation, progress
            tracking, and community support.
          </Text>

          {/* Feature List specific to this screen */}
          <View className="mb-8 w-full rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <FeatureListItem text="Daily motivation messages" />
            <FeatureListItem text="Visual progress tracking" />
            <FeatureListItem text="Community challenges and support" />
            <FeatureListItem text="Celebration of your milestones" />
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
            {currentStepIndex === totalSteps - 1 ? (
              <StyledButton
                title="Get Started"
                onPress={handleNext}
                variant="primary"
              />
            ) : (
              <StyledButton
                title="Next"
                onPress={handleNext}
                variant="primary"
              />
            )}
            <StyledButton title="Skip" onPress={handleSkip} variant="ghost" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
