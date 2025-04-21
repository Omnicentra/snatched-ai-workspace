// app/(onboarding)/feature-proof.tsx
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
import { StyledButton, CarouselIndicator } from '@/components/core'
import * as Progress from 'react-native-progress'
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons'

// Placeholder images
const beforeAfter1 =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
const beforeAfter2 =
  'https://images.unsplash.com/photo-1566241832378-917a0f30db2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'

const ResultCard = ({
  source,
  name,
  details
}: {
  source: string
  name: string
  details: string
}) => (
  <View className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md">
    <View className="relative h-44 bg-gray-100">
      <Image
        source={{ uri: source }}
        className="h-full w-full"
        resizeMode="cover"
      />
      <View className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5">
        <Text className="font-inter-medium text-[10px] text-white">
          Before/After
        </Text>
      </View>
    </View>
    <View className="p-3">
      <Text className="font-inter-medium text-xs text-black">{name}</Text>
      <Text className="font-inter text-xs text-gray-500">{details}</Text>
    </View>
  </View>
)

const TestimonialCard = ({
  quote,
  author
}: {
  quote: string
  author: string
}) => (
  <View className="mb-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
    <View className="flex-row items-start">
      <MaterialCommunityIcons
        name="format-quote-open"
        size={24}
        color="#FBCFE8"
        /* pink-200 */ className="-mt-1 mr-2"
      />
      <View className="flex-1">
        <Text className="mb-2 font-inter text-xs italic text-black">
          "{quote}"
        </Text>
        <Text className="font-inter-medium text-xs text-black">— {author}</Text>
      </View>
    </View>
  </View>
)

const StatBar = ({
  label,
  value,
  percentage
}: {
  label: string
  value: string
  percentage: number
}) => (
  <View className="mb-4">
    <View className="mb-1 flex-row items-center justify-between">
      <Text className="font-inter text-xs text-black">{label}</Text>
      <Text className="font-inter-medium text-xs text-black">{value}</Text>
    </View>
    <Progress.Bar
      progress={percentage / 100}
      width={null} // Full width
      height={4}
      color="#FF9A9E" // Gradient start color
      unfilledColor="#F3F4F6"
      borderColor="transparent"
      borderRadius={2}
      useNativeDriver={true}
    />
    {/* Or use custom gradient progress bar */}
  </View>
)

export default function FeatureProofScreen() {
  const router = useRouter()
  const totalSteps = 6
  const currentStepIndex = 2 // 3rd screen

  const handleNext = () => {
    router.push('/(onboarding)/feature-testimonials')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        className="px-5 pt-5"
      >
        {/* Header */}
        <View className="mb-4 flex-row items-center px-1">
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="black" />
          </Pressable>
          <View>
            <Text className="font-inter-bold text-2xl text-black">
              Real Results
            </Text>
            <Text className="font-inter text-sm text-gray-500">
              See transformations from our community
            </Text>
          </View>
        </View>

        {/* Results Grid */}
        <Text className="mb-3 px-1 font-inter-medium text-black">
          Transformations
        </Text>
        <View className="mb-6 flex-row justify-between gap-4">
          <View className="flex-1">
            <ResultCard
              source={beforeAfter1}
              name="Sarah, 28"
              details="2 months • 12 lbs"
            />
          </View>
          <View className="flex-1">
            <ResultCard
              source={beforeAfter2}
              name="Jessica, 32"
              details="3 months • 15 lbs"
            />
          </View>
        </View>
        {/* Add more rows if needed */}
        {/* <View className="flex-row justify-between gap-4 mb-6"> ... </View> */}

        {/* Testimonials */}
        <Text className="mb-3 px-1 font-inter-medium text-black">
          What Our Users Say
        </Text>
        <TestimonialCard
          quote="I've tried so many programs before, but Snatched AI actually understood my body and created a plan that worked for me. I'm amazed at my results!"
          author="Rachel K., lost 22 lbs in 3 months"
        />
        {/* <TestimonialCard quote="..." author="..."/> */}

        {/* Stats Card */}
        <View className="mb-6 rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-5 shadow-sm">
          <Text className="mb-4 font-inter-medium text-black">
            Success Metrics
          </Text>
          <StatBar label="Goal Achievement Rate" value="94%" percentage={94} />
          <StatBar
            label="Average Time to Results"
            value="8.5 weeks"
            percentage={85}
          />
          <StatBar label="Would Recommend" value="97%" percentage={97} />

          <View className="mt-4 flex-row items-center">
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-pink-100">
              <Ionicons name="star" size={14} color="black" />
            </View>
            <View>
              <Text className="font-inter-medium text-sm text-black">
                4.9/5 Average Rating
              </Text>
              <Text className="font-inter text-xs text-gray-500">
                Based on 1,247 reviews
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <View className="mt-auto px-5 py-8">
        <StyledButton
          title="Start Your Transformation"
          onPress={handleNext}
          variant="gradient" // Gradient button from HTML
        />
      </View>
    </SafeAreaView>
  )
}
