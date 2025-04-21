// app/(onboarding)/height.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, SafeAreaView, ScrollView, Dimensions, Pressable, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { RulerPicker } from 'react-native-ruler-picker'
import {
  OnboardingHeader,
  InfoCard,
  StyledButton
} from '@/components/core'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics';
type HeightUnit = 'ft_in' | 'cm';
const options: { label: string; value: HeightUnit }[] = [
  { label: 'ft/in', value: 'ft_in' },
  { label: 'cm', value: 'cm' }
]

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const RULER_HEIGHT = 120

export default function HeightScreen() {
  const router = useRouter()
  const [unit, setUnit] = useState<HeightUnit>('ft_in')
  const [heightInFeet, setHeightInFeet] = useState(4)
  const [heightInInches, setHeightInInches] = useState(4)
  const [heightInCm, setHeightInCm] = useState(132) // Default 4'4" in cm
  const { height: HEIGHT } = useWindowDimensions()

  // Convert between units when toggling
  useEffect(() => {
    if (unit === 'cm') {
      // Convert from ft/in to cm
      const totalInches = (heightInFeet * 12) + heightInInches
      setHeightInCm(Math.round(totalInches * 2.54))
    } else {
      // Convert from cm to ft/in
      const totalInches = Math.round(heightInCm / 2.54)
      setHeightInFeet(Math.floor(totalInches / 12))
      setHeightInInches(totalInches % 12)
    }
  }, [unit])

  const handleHeightChange = (value: string) => {
    if (unit === 'ft_in') {
      // Handle feet/inches
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      const totalInches = Math.round(parseFloat(value))
      const feet = Math.floor(totalInches / 12)
      const inches = totalInches % 12
      setHeightInFeet(feet)
      setHeightInInches(inches)
      // Update cm for consistency
      setHeightInCm(Math.round(totalInches * 2.54))
    } else {
      // Handle centimeters
      const cm = Math.round(parseFloat(value))
      setHeightInCm(cm)
      // Update feet/inches for consistency
      const totalInches = Math.round(cm / 2.54)
      setHeightInFeet(Math.floor(totalInches / 12))
      setHeightInInches(totalInches % 12)
    }
  }

  const handleContinue = () => {
    console.log('Height in CM:', heightInCm)
    router.push('/(onboarding)/weight')
  }

  const getRulerConfig = () => {
    if (unit === 'ft_in') {
      return {
        min: 36, // 3 feet (in inches)
        max: 96, // 8 feet (in inches)
        step: 1,
        initialValue: (heightInFeet * 12) + heightInInches
      }
    } else {
      return {
        min: 91, // ~3 feet in cm
        max: 244, // ~8 feet in cm
        step: 1,
        initialValue: heightInCm
      }
    }
  }

  const displayHeight = unit === 'ft_in'
    ? `${heightInFeet}'${heightInInches}"`
    : `${heightInCm}cm`

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <View style={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={6 / 20}
          title="What's your height?"
          subtitle="This helps us calculate your ideal body proportions."
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

        <View 
          className="absolute left-0 right-0"
          style={{
            top: HEIGHT / 2 - RULER_HEIGHT / 2 + 20, // Adjust for text height to align center
          }}
        >
          <Text className="text-6xl font-inter-bold text-center">
            {displayHeight}
          </Text>
        </View>

        <View
          className="absolute left-[-110px]"
          style={{
            height: RULER_HEIGHT,
            width: 300,
            transform: [{ rotate: '90deg' }],
            top: HEIGHT / 2 - RULER_HEIGHT + 40
          }}
        >
          <RulerPicker
            {...getRulerConfig()}
            width={300}
            height={RULER_HEIGHT}
            onValueChange={handleHeightChange}
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

        <View className="mt-auto gap-y-6">
          {/* <InfoCard
            icon={
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="black"
              />
            }
            text="Your height helps us create a personalized plan that's right for your body type."
          /> */}
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            variant="primary"
          />
        </View>
      </View>
    </SafeAreaView>
  )
}
