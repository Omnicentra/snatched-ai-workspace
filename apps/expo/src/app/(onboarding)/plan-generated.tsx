// app/(onboarding)/welcome.tsx
import React from 'react'
import { View, Text, SafeAreaView, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { StyledButton, FeatureCard, BubblyLogo } from '@/components/core' // ProgressBar not needed here
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons' // Example icons
import { StatusBar } from 'expo-status-bar'

// Reusable Bubbly Text (or import from shared location)
const BubbleLetter = ({
  children,
  delay
}: {
  children: string
  delay: number
}) => (
  <Text
    className="font-bubbly text-2xl font-bold text-white"
    style={{
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 0
    }}
  >
    {children}
  </Text>
)

export default function WelcomeScreen() {
  const router = useRouter()
  const userName = 'Suzie' // TODO: Get from state/props

  const handleViewPlan = () => {
    // Mark onboarding complete
    // AsyncStorage.setItem('onboarding_complete', 'true');
    // Navigate to the main app, potentially directly to the plan tab
    router.replace('/(tabs)/progress')
  }

  const features = [
    {
      icon: (
        <MaterialCommunityIcons name="heart-pulse" size={20} color="black" />
      ),
      iconBg: 'bg-pink-100',
      title: 'Personalized Workouts',
      description: 'Tailored exercises based on your body type and goals.'
    },
    {
      icon: <Ionicons name="restaurant-outline" size={20} color="black" />,
      iconBg: 'bg-green-100',
      title: 'Nutrition Plan',
      description: 'Custom meal plans and recipes to fuel your transformation.'
    },
    {
      icon: <Ionicons name="sparkles-outline" size={20} color="black" />,
      iconBg: 'bg-purple-100',
      title: 'Daily Snatch Hacks',
      description: 'Quick tips and tricks to accelerate your results.'
    },
    {
      icon: <Ionicons name="shirt-outline" size={20} color="black" />,
      iconBg: 'bg-blue-100',
      title: 'Styling Tips',
      description: 'Learn how to dress to flatter your changing body.'
    }
  ]

  return (
    <>
      <StatusBar translucent={true} hidden={true} />
      {/* Header with logo */}
      <LinearGradient
        colors={['#f472b6', '#FED0E2']}
        style={{
          paddingTop: Constants.statusBarHeight,
          paddingHorizontal: 20,
          paddingVertical: 25
        }}
      >
        <View className="flex-row items-center justify-center pb-6">
          <BubblyLogo />
        </View>
        <Text className="mb-2 font-inter-bold text-xl text-white">
          Welcome, {userName}!
        </Text>
        <Text className="font-inter text-sm text-white">
          Your personalized journey to a snatched body starts now.
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        className="p-6"
      >
        <View className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <Text className="mb-2 font-inter-bold text-lg text-black">
            Your Plan is Ready
          </Text>
          <Text className="mb-4 font-inter text-sm text-black">
            We've analyzed your body type and goals to create a custom plan just
            for you.
          </Text>
          <StyledButton
            title="View My Plan"
            onPress={handleViewPlan}
            variant="gradient"
          />
        </View>

        <Text className="mb-4 font-inter-bold text-lg text-black">
          What's Included
        </Text>

        <View className="mb-6 gap-y-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </View>

        <FeatureCard
          icon={
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color="black"
            />
          }
          iconBg="bg-pink-100"
          title="AI Coach"
          description="Your personal coach is ready to answer questions and keep you motivated."
        />

        {/* Add Spacer if needed before potential bottom button */}
        {/* <View className="flex-grow" /> */}
      </ScrollView>
      {/* No bottom button needed, user navigates via "View My Plan" or later via tabs */}
      {/* If this was part of a feature carousel, it would have Next/Prev */}
    </>
  )
}
