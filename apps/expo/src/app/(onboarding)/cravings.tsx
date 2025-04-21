// app/(onboarding)/cravings.tsx
import { OnboardingHeader, StyledButton } from '@/components/core'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native'
import * as Haptics from 'expo-haptics'

const cravingsList = [
  'Chocolate',
  'Salty Snacks',
  'Sweets',
  'Carbs',
  'Fast Food',
  'Ice Cream',
  'Cheese',
  'Fried Food'
]

const CravingTag = ({
  text,
  selected,
  onPress
}: {
  text: string
  selected: boolean
  onPress: () => void
}) => (
  <Pressable
    className={`rounded-full border px-4 py-2 ${selected ? 'border-pink-200 bg-pink-200' : 'border-gray-200 bg-white'}`}
    onPress={onPress}
  >
    <Text
      className={`text-sm ${selected ? 'font-inter-medium text-black' : 'text-black'}`}
    >
      {text}
    </Text>
  </Pressable>
)

export default function CravingsScreen() {
  const router = useRouter()
  const [selectedCravings, setSelectedCravings] = useState<string[]>([
    'Chocolate'
  ]) // Default selected
  const [otherCravings, setOtherCravings] = useState('')

  const toggleCraving = (craving: string) => {
    setSelectedCravings((prev) =>
      prev.includes(craving)
        ? prev.filter((c) => c !== craving)
        : [...prev, craving]
    )
  }

  const handleContinue = () => {
    // Store selected cravings
    router.push('/(onboarding)/dietary-preferences')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          contentContainerClassName="p-8"
        >
          <OnboardingHeader
            progress={13 / 20} // Might need adjustment based on cycle skip logic
            title="What are your cravings during this time?"
            subtitle="We'll help you manage cravings with healthy alternatives. Select all that apply."
          />

          <View className="mb-6 flex-row flex-wrap gap-2">
            {cravingsList.map((craving) => (
              <CravingTag
                key={craving}
                text={craving}
                selected={selectedCravings.includes(craving)}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                  toggleCraving(craving)
                }}
              />
            ))}
          </View>

          <View className="mb-6">
            <Text className="mb-2 block font-inter-medium text-sm text-black">
              Other cravings (optional)
            </Text>
            <TextInput
              className="w-full rounded-xl border border-gray-200 p-4 text-base text-black"
              placeholder="Type here..."
              value={otherCravings}
              onChangeText={setOtherCravings}
            />
          </View>

          {/* <InfoCard
            icon={
              <MaterialCommunityIcons
                name="food-apple-outline"
                size={20}
                color="black"
              />
            }
            text="We'll suggest healthy alternatives to satisfy your cravings without derailing your progress."
            iconBg="bg-green-100" // Match HTML
          /> */}

          <View className="mt-auto pt-8">
            <StyledButton
              title="Continue"
              onPress={handleContinue}
              disabled={selectedCravings.length === 0 && !otherCravings}
              variant="primary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
