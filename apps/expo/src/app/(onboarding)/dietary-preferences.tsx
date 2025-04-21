import React, { useState } from 'react'
import { View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { OnboardingHeader, StyledButton } from '@/components/core'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

interface DietOption {
  id: string
  icon: string
  label: string
  iconBg: string
}

const dietOptions: DietOption[] = [
  {
    id: 'classic',
    icon: '🍽️',
    label: 'Classic',
    iconBg: 'bg-pink-100'
  },
  {
    id: 'pescatarian',
    icon: '🐟',
    label: 'Pescatarian',
    iconBg: 'bg-blue-100'
  },
  {
    id: 'vegetarian',
    icon: '🥬',
    label: 'Vegetarian',
    iconBg: 'bg-green-100'
  },
  {
    id: 'vegan',
    icon: '🌱',
    label: 'Vegan',
    iconBg: 'bg-green-100'
  }
]

const DietCard = ({
  option,
  selected,
  onPress
}: {
  option: DietOption
  selected: boolean
  onPress: () => void
}) => (
  <Pressable
    onPress={onPress}
    className={`mb-3 flex-row items-center rounded-xl border p-4 ${
      selected
        ? 'border-pink-400 bg-pink-50'
        : 'border-gray-100 bg-gray-50'
    }`}
    style={{
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    }}
  >
    <View
      className={`${option.iconBg} h-10 w-10 items-center justify-center rounded-full`}
    >
      <Text className="text-xl">{option.icon}</Text>
    </View>
    <View className="ml-4 flex-1">
      <Text
        className={`ml-4 font-inter-medium text-lg ${selected ? 'text-pink-600' : 'text-black'}`}
      >
        {option.label}
      </Text>
    </View>
    {selected && (
      <View className="ml-2">
        <View className="rounded-full bg-pink-400 p-1">
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      </View>
    )}
  </Pressable>
)

export default function DietaryPreferencesScreen() {
  const router = useRouter()
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null)

  const handleContinue = () => {
    // Store selected diet preference
    router.push('/(onboarding)/get-snatched')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6">
        <OnboardingHeader
          progress={14 / 20}
          title="What is your diet?"
          subtitle="We'll customize your meal plan based on your dietary preferences."
        />

        <View className="mt-6">
          {dietOptions.map((option) => (
            <DietCard
              key={option.id}
              option={option}
              selected={selectedDiet === option.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                setSelectedDiet(option.id)
              }}
            />
          ))}
        </View>
      </View>

      <View className="p-6">
        <StyledButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedDiet}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  )
}
