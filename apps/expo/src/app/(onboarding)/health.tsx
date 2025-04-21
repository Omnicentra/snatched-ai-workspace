// app/(onboarding)/health.tsx
import React, { useState } from 'react'
import { View, Text, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import {
  OnboardingHeader,
  OptionCard,
  InfoCard,
  StyledButton
} from '@/components/core'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons' // Example icons

const healthOptions = [
  { id: 'yes', text: 'Yes' },
  { id: 'no', text: 'No' },
  { id: 'prefer_not_to_say', text: 'Prefer not to say' }
]

// Simple radio button style icon
const RadioIcon = ({ selected }: { selected: boolean }) => (
  <View
    className={`h-6 w-6 rounded-full border-2 ${selected ? 'border-black' : 'border-gray-400'} mr-4 items-center justify-center`}
  >
    {selected && <View className="h-3 w-3 rounded-full bg-black" />}
  </View>
)

export default function HealthScreen() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleContinue = () => {
    // Store selectedOption if needed (especially if 'yes')
    router.push('/(onboarding)/cycle')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <View style={{ flexGrow: 1 }} className="p-8">
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <OnboardingHeader
            progress={11 / 20}
            title="Medical/Health Conditions?"
            subtitle="This helps us ensure your plan is safe and suitable for you."
          />

          <View className="mb-8 flex-1 gap-y-4">
            {healthOptions.map((option) => (
              <OptionCard
                key={option.id}
                // icon={<RadioIcon selected={selectedOption === option.id} />}
                text={option.text}
                selected={selectedOption === option.id}
                onPress={() => setSelectedOption(option.id)}
              />
            ))}
          </View>

          {/* Optional: Show a text input if 'Yes' is selected */}
          {selectedOption === 'yes' && (
            <View className="mb-8 flex-1">
              <Text className="mb-2 font-inter-medium text-sm">
                Please specify (optional):
              </Text>
              <TextInput
                placeholder="E.g., Knee injury, Diabetes"
                className="w-full rounded-xl border border-gray-200 p-4 text-base text-black"
                multiline // Allow multiple lines
              />
            </View>
          )}

          {/* <InfoCard
            icon={
              <MaterialCommunityIcons
                name="heart-pulse"
                size={20}
                color="black"
              />
            }
            text="Your safety is our priority. We'll adjust your plan to accommodate any health conditions."
          /> */}
        </KeyboardAvoidingView>
      </View>


      <View className="mt-auto p-8">
        <StyledButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedOption}
          variant="primary"
        />
      </View>

    </SafeAreaView>
  )
}
