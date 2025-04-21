// app/(onboarding)/feature-craft.tsx
import React from 'react'
import { View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { StyledButton, CarouselIndicator } from '@/components/core' // Assuming ProgressBar is within OnboardingHeader now
import { Ionicons, Feather } from '@expo/vector-icons' // Example icons

const FeatureItem = ({ text }: { text: string }) => (
  <View className="mb-3 flex-row items-start">
    <Feather
      name="check-circle"
      size={18}
      color="#F472B6"
      /* pink-400 */ className="mr-2 mt-0.5"
    />
    <Text className="flex-1 font-inter text-sm text-black">{text}</Text>
  </View>
)

export default function FeatureCraftScreen() {
  const router = useRouter()
  const totalSteps = 6 // Total number of feature screens
  const currentStepIndex = 1 // This is the 2nd screen (index 1)

  const handleNext = () => {
    router.push('/(onboarding)/feature-motivated')
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
          <View className="mb-8 h-16 w-16 items-center justify-center rounded-full bg-pink-100">
            <Ionicons name="sparkles-outline" size={30} color="black" />
          </View>

          <Text className="mb-4 text-center font-inter-bold text-2xl text-black">
            Craft your ideal body
          </Text>
          <Text className="mb-8 text-center font-inter text-black">
            Our AI-powered plan combines workouts, nutrition, and lifestyle tips
            tailored specifically to your body type and goals.
          </Text>

          <View className="mb-8 w-full rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <FeatureItem text="Personalized workout routines" />
            <FeatureItem text="Custom nutrition plans" />
            <FeatureItem text="Daily 'Snatch Hacks' for quick results" />
            <FeatureItem text="Styling tips to flatter your shape" />
          </View>

          <CarouselIndicator
            count={totalSteps}
            activeIndex={currentStepIndex}
          />
        </View>

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
