// app/(onboarding)/composition-detail.tsx
import React from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  Pressable
} from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { StyledButton, MetricCard, InfoCard } from '@/components/core'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

// Placeholder - replace with actual image source
const bodyModelImage =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'

const BodyHighlightTag = ({
  text,
  top,
  left,
  highlightSize = 25
}: {
  text: string
  top: number
  left: number
  highlightSize?: number
}) => (
  <>
    {/* Highlight Circle */}
    <View
      className="absolute z-20 rounded-full border border-dashed border-gray-400/50"
      style={{
        width: highlightSize,
        height: highlightSize,
        top: top,
        left: left,
        transform: [
          { translateX: -highlightSize / 2 },
          { translateY: -highlightSize / 2 }
        ]
      }} // Center highlight
    />
    {/* Tag */}
    <View
      className="absolute z-30 rounded-lg bg-white px-1.5 py-0.5 shadow-md"
      style={{ top: top - 25, left: left + 5 }}
    >
      <Text className="font-inter-semibold text-[9px] text-black">{text}</Text>
    </View>
  </>
)

export default function CompositionDetailScreen() {
  const router = useRouter()

  const handleReveal = () => {
    // Mark onboarding as complete and navigate to the main app
    // AsyncStorage.setItem('onboarding_complete', 'true'); // Example persistence
    router.replace('/(onboarding)/feature-welcome') // Go to welcome/feature screens first
  }

  // Mock Data
  const strengths = [
    {
      iconEmoji: '⌛',
      title: 'Waist-hip ratio',
      progress: 0.85,
      description: 'Perfect for hourglass'
    },
    {
      iconEmoji: '👑',
      title: 'Posture',
      progress: 0.9,
      description: 'Enhances silhouette'
    }
  ]
  const growthAreas = [
    {
      iconEmoji: '🍑',
      title: 'Glutes',
      progress: 0.6,
      description: 'More curve potential'
    },
    {
      iconEmoji: '💪',
      title: 'Upper body',
      progress: 0.55,
      description: 'Balance silhouette'
    }
  ]

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-1 pt-3">
        <Pressable
          onPress={() => router.back()}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 p-1"
        >
          <Ionicons name="arrow-back" size={18} color="black" />
        </Pressable>
        <Text className="font-inter-bold text-lg text-black">
          Body Analysis
        </Text>
        <View className="w-7" />
        {/* Spacer */}
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
          paddingHorizontal: 4
        }}
      >
        {/* Body Score */}
        <View className="flex-row items-center justify-between px-4 py-1">
          <View>
            <Text className="font-inter text-xs text-gray-500">Your Score</Text>
            <Text className="font-inter-bold text-2xl text-black">
              82<Text className="text-xs font-normal">/100</Text>
            </Text>
          </View>
          <View className="rounded-full bg-green-100 px-2 py-1">
            <Text className="font-inter-medium text-xs text-green-700">
              Above Average ⭐
            </Text>
          </View>
        </View>

        {/* Body Image Section */}
        <View className="px-4 py-2">
          <View className="relative h-56 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
            {/* Increase height slightly */}
            <Image
              source={{ uri: bodyModelImage }}
              className="h-full w-40"
              resizeMode="contain"
            />

            {/* Highlights - Adjust top/left based on your image and desired points */}
            <BodyHighlightTag text="Shoulders 💪 75%" top={60} left={105} />
            <BodyHighlightTag
              text="Waist ⌛ 90%"
              top={110}
              left={115}
              highlightSize={20}
            />
            <BodyHighlightTag
              text="Glutes 🍑 60%"
              top={160}
              left={105}
              highlightSize={30}
            />
          </View>
        </View>

        {/* Strengths & Growth Areas */}
        <View className="px-4 py-3">
          <View className="flex-row gap-x-2">
            {/* Strengths Column */}
            <View className="flex-1 gap-y-2">
              <Text className="mb-1 font-inter-bold text-sm text-black">
                Strengths ✨
              </Text>
              {strengths.map((item, index) => (
                <MetricCard key={`strength-${index}`} {...item} />
              ))}
            </View>
            {/* Growth Areas Column */}
            <View className="flex-1 gap-y-2">
              <Text className="mb-1 font-inter-bold text-sm text-black">
                Growth Areas 🌱
              </Text>
              {growthAreas.map((item, index) => (
                <MetricCard key={`growth-${index}`} {...item} />
              ))}
            </View>
          </View>
        </View>

        {/* Success Message */}
        <View className="px-4 py-3">
          <InfoCard
            icon={
              <Ionicons name="lock-closed-outline" size={20} color="black" />
            } // Changed icon
            text="Your personalized plan is ready to help you get snatched! With a 99.7% success rate, you're on track to achieve your dream body."
            iconBg="bg-yellow-100" // Example color
          />
        </View>

        {/* Spacer */}
        <View className="flex-grow" />

        <View className="mt-auto px-4 pt-5">
          <StyledButton
            title="✨ Reveal My Snatched Self"
            onPress={handleReveal}
            variant="gradient"
            icon={<Ionicons name="arrow-forward" size={18} color="white" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
