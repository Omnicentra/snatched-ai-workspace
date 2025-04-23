import React from 'react'
import { Text, View, Pressable, SafeAreaView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import * as Haptics from 'expo-haptics'
import brandLogo from '../../assets/images/logo2.png'
import { Image } from 'expo-image'
import { appVariant } from '@/lib/utils'

// Basic animation placeholder (needs Reanimated for real effect)
// Keep the className directly on Text
const BubbleLetter = ({
  children,
  delay
}: {
  children: string
  delay: number
}) => (
  <Text
    className="ml-1 font-bubbly-bold text-4xl tracking-widest text-white"
    // Inline style for properties not directly in Tailwind/NativeWind V4 yet (like textShadow)
    style={{
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 0
    }}
  >
    {children}
  </Text>
)

export default function SplashScreen() {
  const router = useRouter()

  const handleGetStarted = () => {
    void Haptics.selectionAsync().then(() => {
      router.push('/(onboarding)/body-positivity')
    })
    }

  const handleSkip = () => {
    void Haptics.selectionAsync().then(() => {
      router.push('/(onboarding)/signup')
    })
  }

  console.log('appVariant', appVariant)

  // Apply className directly to LinearGradient if supported, otherwise use style
  // NativeWind v4 aims to support this, but if not: style={{ flex: 1 }}
  return (
    <LinearGradient
      colors={['#f472b6', '#FED0E2']}
      className="flex-1" // Use className directly
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView
        style={{ paddingTop: Constants.statusBarHeight }}
        className="h-full items-center justify-center"
      >
        <View className="w-full items-center justify-center gap-y-10 p-8">
          <View className="h-32 w-32 items-center justify-center rounded-full bg-transparent shadow-lg">
            <Image
              source={brandLogo}
              className="h-full w-full"
              style={{
                width: '100%',
                height: '100%'
              }}
            />
          </View>

          <View className="w-full items-center">
            {/* Apply className directly */}
            <View className="mb-2 flex-row">
              <BubbleLetter delay={1}>S</BubbleLetter>
              <BubbleLetter delay={2}>n</BubbleLetter>
              <BubbleLetter delay={3}>a</BubbleLetter>
              <BubbleLetter delay={4}>t</BubbleLetter>
              <BubbleLetter delay={5}>c</BubbleLetter>
              <BubbleLetter delay={6}>h</BubbleLetter>
              <BubbleLetter delay={7}>e</BubbleLetter>
              <BubbleLetter delay={8}>d</BubbleLetter>
              <BubbleLetter delay={9}> </BubbleLetter>
              <BubbleLetter delay={10}>A</BubbleLetter>
              <BubbleLetter delay={11}>I</BubbleLetter>
            </View>
            <Text className="font-inter text-lg text-white">
              Your body, snatched.
            </Text>
          </View>

          <Pressable
            className="rounded-full bg-white px-16 py-4 shadow-lg active:scale-95"
            onPress={handleGetStarted}
          >
            <Text className="text-center font-inter-semibold text-base text-black">
              Get Started
            </Text>
          </Pressable>

          {appVariant !== "production" && (
            <Pressable
              className="rounded-full bg-black px-16 py-4 shadow-lg active:scale-95"
              onPress={handleSkip}
            >
            <Text className="text-center font-inter-semibold text-base text-white">
              Skip
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}
