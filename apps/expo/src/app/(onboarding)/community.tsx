import { OnboardingHeader, StyledButton } from '@/components/core'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import React from 'react'
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking'
import YogaPose from '@/assets/images/yoga-pose.png'
import { Image } from 'expo-image'
function CommunityScreen() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/(onboarding)/name-age')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={15 / 20}
          title="Join Our Community"
          subtitle="Let's get you started on your transformation journey."
        />

        <View className="items-center justify-center flex-1">
          {/* Circular container for the icon */}
          <View className="w-40 h-40 rounded-full bg-[#f472b6] items-center justify-center mb-8">
            <Image
              source={YogaPose}
              style={{ width: 60, height: 60 }}
              contentFit="contain"
            />
          </View>

          <Text className="text-3xl font-inter-bold text-center mb-4">
            Join Our Community
          </Text>

          <Text className="text-gray-600 text-center text-lg font-inter-regular mb-8">
            Join a community of over 1000+ people committed to improving their lives through pilates, yoga and at-home workouts.
          </Text>
        </View>

        <View className="mt-auto">
          <StyledButton
            title="GET STARTED"
            onPress={handleGetStarted}
            className="flex flex-row gap-x-3 rounded-full"
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default withOnboardingTracking(CommunityScreen, 'community') 