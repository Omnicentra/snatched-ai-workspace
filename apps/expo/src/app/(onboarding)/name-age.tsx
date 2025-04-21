// app/(onboarding)/name-age.tsx
import { InfoCard, OnboardingHeader, StyledButton } from '@/components/core'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native'

export default function NameAgeScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')

  const canContinue = name.trim().length > 0 && parseInt(age) > 0 // Basic validation

  const handleStartScanning = () => {
    // Store name and age
    router.push('/(onboarding)/prepare-scan')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={16 / 20} // Adjust progress
          title="Almost there"
          subtitle="Let's personalize your experience."
        />

        <View className="mb-6">
          <Text className="mb-2 block font-inter-medium text-sm text-black">
            Your name
          </Text>
          <TextInput
            className="w-full rounded-xl border border-gray-200 p-4 font-inter-medium text-xl text-black"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View className="mb-8">
          <Text className="mb-2 block font-inter-medium text-sm text-black">
            Your age
          </Text>
          <TextInput
            className="w-full rounded-xl border border-gray-200 p-4 font-inter-medium text-xl text-black"
            placeholder="Enter your age"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
            maxLength={3}
          />
        </View>

        <InfoCard
          icon={
            <Ionicons name="shield-checkmark-outline" size={20} color="black" />
          }
          text="Your information is secure and will only be used to personalize your experience."
          iconBg="bg-green-100" // Example color
        />

        <View className="mt-auto pt-8">
          <StyledButton
            title="Continue"
            onPress={handleStartScanning}
            className="flex flex-row gap-x-3 rounded-full"
            variant="primary" // Use gradient from HTML
            disabled={!canContinue}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
