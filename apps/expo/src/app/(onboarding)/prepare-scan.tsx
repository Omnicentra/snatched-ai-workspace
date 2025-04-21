import React from 'react'
import { View, Text, SafeAreaView, ScrollView, Linking } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { OnboardingHeader, StyledButton, InfoCard } from '@/components/core'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

// Reusable Tip Card Component
const TipCard = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <View className="mb-3 flex-row items-center rounded-xl border border-gray-100 bg-white p-4">
    <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-pink-50">
      {icon}
    </View>
    <Text className="flex-1 font-inter text-sm text-gray-600">{text}</Text>
  </View>
)

export default function StayMotivatedScreen() {
  const router = useRouter()

  const handleContinue = () => {
    router.push('/(onboarding)/scan-front')
  }

  const openPrivacyPolicy = () => {
    // Replace with your actual URL
    Linking.openURL('https://example.com/privacy')
  }
  const openTerms = () => {
    // Replace with your actual URL
    Linking.openURL('https://example.com/terms')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader progress={17 / 20} />

        {/* Hourglass Icon in Circle */}
        <View className="mb-8 items-center">
          <View className="h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-pink-200 bg-pink-50">
            <MaterialCommunityIcons
              name="timer-sand"
              size={48}
              color="#f472b6"
            />
          </View>
        </View>

        {/* Main Title */}
        <Text className="mb-3 text-center font-inter-bold text-3xl text-black">
          Thank you for trusting{'\n'}Snatched AI
        </Text>

        {/* Subtitle */}
        <Text className="mb-6 text-center text-lg text-gray-600">
          Let's personalise your transformation journey...
        </Text>

        {/* Photo Tips Section */}
        <View className="mb-6">
          <Text className="mb-4 font-inter-medium text-base text-black">
            We'll need 3 photos to create your custom plan:
          </Text>
          <TipCard
            icon={
              <MaterialCommunityIcons
                name="camera-front"
                size={20}
                color="#f472b6"
              />
            }
            text="Front view - facing the camera"
          />
          <TipCard
            icon={
              <MaterialCommunityIcons name="camera" size={20} color="#f472b6" />
            }
            text="Side view - your right side"
          />
          <TipCard
            icon={
              <MaterialCommunityIcons
                name="camera-rear"
                size={20}
                color="#f472b6"
              />
            }
            text="Back view - facing away from camera"
          />
        </View>

        {/* Quick Tips Section */}
        <View className="mb-6">
          <Text className="mb-4 font-inter-medium text-base text-black">
            For best results:
          </Text>
          <TipCard
            icon={
              <MaterialCommunityIcons
                name="tshirt-crew"
                size={20}
                color="#f472b6"
              />
            }
            text="Wear fitted clothing or activewear"
          />
          <TipCard
            icon={<Ionicons name="sunny" size={20} color="#f472b6" />}
            text="Find a well-lit area with a plain background"
          />
          <TipCard
            icon={
              <MaterialCommunityIcons name="ruler" size={20} color="#f472b6" />
            }
            text="Stand naturally with feet shoulder-width apart"
          />
        </View>

        {/* Privacy Notice */}
        <InfoCard
          icon={
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={24}
              color="#FF9999"
            />
          }
          text="Your photos are processed securely and privately. They're never shared and are automatically deleted after analysis."
          iconBg="bg-pink-100"
          className="mb-6"
        />
      </ScrollView>
      <View className="mt-auto px-8">
        <StyledButton
          title="I'm ready to take photos"
          onPress={handleContinue}
          variant="primary"
          icon={<Ionicons name="camera-outline" size={20} color="white" />}
        />
        <View className="mt-4 items-center">
          <Text className="text-center text-xs text-gray-600">
            By continuing, you agree to our{' '}
            <Text
              className="font-inter-medium text-black underline"
              onPress={openTerms}
            >
              Terms
            </Text>
            <Text>{' & '}</Text>
            <Text
              className="font-inter-medium text-black underline"
              onPress={openPrivacyPolicy}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
