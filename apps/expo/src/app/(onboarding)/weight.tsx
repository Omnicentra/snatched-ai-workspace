// app/(onboarding)/weight.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, SafeAreaView, ScrollView, Dimensions, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { RulerPicker } from 'react-native-ruler-picker'
import {
  OnboardingHeader,
  InfoCard,
  StyledButton,
} from '@/components/core'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics';

type WeightUnit = 'lb' | 'kg'
const options: { label: string; value: WeightUnit }[] = [
  { label: 'lb', value: 'lb' },
  { label: 'kg', value: 'kg' }
]

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const RULER_HEIGHT = 120

export default function WeightScreen() {
  const router = useRouter()
  const [unit, setUnit] = useState<WeightUnit>('lb')
  const [weightInLbs, setWeightInLbs] = useState(135)
  const [weightInKg, setWeightInKg] = useState(61) // Default 135 lbs in kg

  // Convert between units when toggling
  useEffect(() => {
    if (unit === 'kg') {
      // Convert from lbs to kg
      setWeightInKg(Math.round(weightInLbs / 2.20462))
    } else {
      // Convert from kg to lbs
      setWeightInLbs(Math.round(weightInKg * 2.20462))
    }
  }, [unit])

  const handleWeightChange = (value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const numValue = Math.round(parseFloat(value))
    if (unit === 'lb') {
      setWeightInLbs(numValue)
      setWeightInKg(Math.round(numValue / 2.20462))
    } else {
      setWeightInKg(numValue)
      setWeightInLbs(Math.round(numValue * 2.20462))
    }
  }

  const handleContinue = () => {
    console.log('Weight in KG:', weightInKg)
    router.push('/(onboarding)/ethnicity')
  }

  const getRulerConfig = () => {
    if (unit === 'lb') {
      return {
        min: 80, // Minimum weight in lbs
        max: 400, // Maximum weight in lbs
        step: 1,
        initialValue: weightInLbs
      }
    } else {
      return {
        min: 36, // Minimum weight in kg (~80 lbs)
        max: 181, // Maximum weight in kg (~400 lbs)
        step: 1,
        initialValue: weightInKg
      }
    }
  }

  const displayWeight = unit === 'lb' 
    ? `${weightInLbs} lb`
    : `${weightInKg} kg`

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={7 / 20}
          title="What do you weigh?"
          subtitle="This helps us create your personalized plan."
        />

        <View className="flex-row bg-gray-100 p-1 rounded-full self-start mb-8">
          {options.map((option, index) => (
            <Pressable
              key={index}
              className={`flex-1 py-2 px-4 rounded-full ${unit === option.value ? 'bg-white' : ''
                }`}
              onPress={() => setUnit(option.value)}
              style={unit === option.value && {
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text
                className={`text-center font-inter-medium text-sm ${unit === option.value ? 'text-black' : 'text-gray-600'
                  }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="items-center justify-center my-8">
          <Text className="text-4xl font-inter-bold mb-2">
            {displayWeight}
          </Text>
          
          <View className="w-full" style={{ height: RULER_HEIGHT }}>
            <RulerPicker
              {...getRulerConfig()}
              width={SCREEN_WIDTH - 64}
              height={RULER_HEIGHT}
              onValueChange={handleWeightChange}
              indicatorColor="#f472b6"
              shortStepColor="#CCCCCC"
              longStepColor="#888888"
              valueTextStyle={{
                fontSize: 1,
                color: 'transparent'
              }}
              unitTextStyle={{
                fontSize: 1,
                color: 'transparent'
              }}
            />
          </View>
        </View>

        {/* <InfoCard
          icon={<Ionicons name="lock-closed-outline" size={20} color="black" />}
          text="Your information is private and secure. We use this data only to create your personalized plan."
        /> */}

        <View className="mt-auto">
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
