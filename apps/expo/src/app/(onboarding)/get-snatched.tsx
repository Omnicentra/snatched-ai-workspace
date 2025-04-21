import React, { useEffect } from 'react'
import { View, Text, SafeAreaView, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { OnboardingHeader, StyledButton } from '@/components/core'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay
} from 'react-native-reanimated'

interface ComparisonBlockProps {
  title: string
  subtitle: string
  height: number
  isHighlighted?: boolean
  delay?: number
}

const ComparisonBlock = ({
  title,
  subtitle,
  height,
  isHighlighted,
  delay = 0
}: ComparisonBlockProps) => {
  const animatedHeight = useSharedValue(0)

  useEffect(() => {
    animatedHeight.value = withDelay(
      delay,
      withSpring(height, {
        damping: 90,
        stiffness: 100
      })
    )
  }, [height, delay])

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value
  }))

  return (
    <View className="items-center">
      {/* User Icon */}
      <View className={`mb-2 ${isHighlighted ? 'opacity-100' : 'opacity-50'}`}>
        <Ionicons
          name="person"
          size={24}
          color={isHighlighted ? '#f472b6' : '#999999'}
        />
      </View>

      {/* Progress Block */}
      {isHighlighted ? (
        <Animated.View style={animatedStyle}>
          <LinearGradient
            colors={['#f472b6', '#FED0E2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ height: '100%', width: 140, borderRadius: 20 }}
          />
        </Animated.View>
      ) : (
        <Animated.View
          style={[animatedStyle, { width: 140, borderRadius: 20, backgroundColor: '#e5e7eb' }]}
        />
      )}

      {/* Labels */}
      <View className="mt-4 items-center">
        <Text
          className={`mb-1 text-center font-inter-semibold text-base ${
            isHighlighted ? 'text-black' : 'text-gray-600'
          }`}
        >
          {title}
        </Text>
        <Text
          className={`text-center text-sm ${
            isHighlighted ? 'text-black' : 'text-gray-500'
          }`}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  )
}

export default function GetSnatchedScreen() {
  const router = useRouter()

  const handleContinue = () => {
    router.push('/(onboarding)/name-age')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <View className="flex-1">
          <OnboardingHeader
            progress={15 / 20}
            title="Users see 2x faster waist-slimming results with Snatched AI"
            subtitle=""
            subtitleClassName="text-[28px] leading-9"
          />

          <View className="my-8 flex-1 justify-end">
            <View className="flex-row items-end justify-around">
              <ComparisonBlock
                title="Without"
                subtitle="Slow Progress"
                height={80}
                delay={300}
              />
              <ComparisonBlock
                title="With Snatched AI"
                subtitle="3x Faster Progress"
                height={240}
                isHighlighted
                delay={300}
              />
            </View>
          </View>

          <Text className="mb-8 text-center text-base text-gray-800">
            Snatched AI gives you structure, visual tracking, and accountability
            that gets results faster.
          </Text>

          <View className="mt-auto pt-8">
            <StyledButton
              title="Continue"
              onPress={handleContinue}
              variant="primary"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
