// app/(onboarding)/feature-adjust.tsx
import {
  InfoCard,
  SliderComponent,
  StyledButton
} from '@/components/core'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Image, SafeAreaView, ScrollView, Text, View } from 'react-native'

// Placeholders
const currentShape =
  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
const goalShape =
  'https://images.unsplash.com/photo-1566241832378-917a0f30db2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'

export default function FeatureAdjustScreen() {
  const router = useRouter()
  const [ratioValue, setRatioValue] = useState(65)
  const [toneValue, setToneValue] = useState(50)
  const [styleValue, setStyleValue] = useState(40)

  const handleViewPlan = () => {
    // This is likely the final step before showing the paywall or welcome
    // For now, let's go to the Welcome screen
    router.dismissAll()
    router.replace('/(tabs)/home');
  }

  const handleTryDifferentGoal = () => {
    // Navigate back to the goal selection or desired shape screen
    router.push('/(onboarding)/desired-shape') // Example
  }

  // Format slider values for display
  const formatRatioLabel = (value: number) =>
    ((value / 100) * 0.2 + 0.65).toFixed(2) // Example scaling: 0.65 to 0.85
  const formatToneLabel = (value: number) => {
    if (value < 33) return 'Soft'
    if (value < 66) return 'Medium'
    return 'Defined'
  }
  const formatStyleLabel = (value: number) => {
    if (value < 33) return 'Natural'
    if (value < 66) return 'Balanced'
    return 'Sculpted'
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center p-6 pb-0">
          <Text className="mb-6 text-center font-inter-bold text-2xl text-black">
            Fine-tune Your Plan
          </Text>

          {/* Before/After */}
          <View className="mb-8 w-full flex-row items-center justify-between px-4">
            <View className="items-center">
              <Text className="mb-2 font-inter text-xs text-black">
                Current You
              </Text>
              <View className="h-32 w-24 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  source={{ uri: currentShape }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>
            </View>
            <Ionicons name="arrow-forward-outline" size={24} color="black" />
            <View className="items-center">
              <Text className="mb-2 font-inter text-xs text-black">
                Snatched You
              </Text>
              <View className="h-32 w-24 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  source={{ uri: goalShape }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>

          {/* Sliders */}
          <View className="mb-8 w-full gap-y-8">
            <SliderComponent
              label="Waist-to-Hip Ratio"
              valueLabel={formatRatioLabel(ratioValue)}
              value={ratioValue}
              onValueChange={setRatioValue}
            />
            <SliderComponent
              label="Tone Level"
              valueLabel={formatToneLabel(toneValue)}
              minValueLabel="Soft"
              maxValueLabel="Defined"
              value={toneValue}
              onValueChange={setToneValue}
            />
            <SliderComponent
              label="Snatch Style"
              valueLabel={formatStyleLabel(styleValue)}
              minValueLabel="Natural"
              maxValueLabel="Sculpted"
              value={styleValue}
              onValueChange={setStyleValue}
            />
          </View>
          <View className="mb-8 w-full">
            <InfoCard
              icon={
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="black"
                />
              }
              text="Adjust these settings to customize your plan. We'll update your workouts and nutrition accordingly."
            />
          </View>
        </View>
      </ScrollView>
      <View className="mt-auto gap-y-4 p-6">
        <StyledButton
          title="View Plan"
          onPress={handleViewPlan}
          variant="primary"
        />
        <StyledButton
          title="Try Different Goal"
          onPress={handleTryDifferentGoal}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  )
}
