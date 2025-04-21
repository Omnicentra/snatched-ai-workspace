import React from 'react'
import { View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { StyledButton, CarouselIndicator } from '@/components/core'
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons' // Import icons needed
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing
} from 'react-native-reanimated' // For sparkle animation

// Reusable list item component
const FeatureListItem = ({ text }: { text: string }) => (
  <View className="mb-3 flex-row items-start">
    <Feather
      name="check-circle"
      size={18}
      color="#F472B6"
      className="mr-2 mt-0.5"
    />
    <Text className="flex-1 font-inter text-sm text-black">{text}</Text>
  </View>
)

// Simple Sparkle Component
const Sparkle = ({ style, delay = 0 }: { style?: object; delay?: number }) => {
  const scale = useSharedValue(0.8)
  const opacity = useSharedValue(0.3)

  React.useEffect(() => {
    const animationDelay = setTimeout(() => {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
      opacity.value = withRepeat(
        withTiming(0.8, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    }, delay)
    return () => clearTimeout(animationDelay)
  }, [delay])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }))

  return (
    <Animated.Text className="absolute text-xs" style={[style, animatedStyle]}>
      ?
    </Animated.Text>
  )
}

export default function FeatureGetSnatchedScreen() {
  const router = useRouter()
  const totalSteps = 6 // Total feature steps
  const currentStepIndex = 5 // This is the 6th/last screen (index 5)

  const handleNext = () => {
    router.push('/(onboarding)/feature-testimonials')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center p-8">
          {/* Icon specific to this screen (award/trophy) */}
          <View className="relative mb-8 h-16 w-16 items-center justify-center rounded-full bg-pink-100">
            {/* Using Ionicons award */}
            <Ionicons name="trophy-outline" size={30} color="black" />
            {/* Sparkles */}
            <Sparkle style={{ top: -5, right: -5 }} delay={100} />
            <Sparkle style={{ bottom: -5, left: -5 }} delay={400} />
            <Sparkle
              style={{ top: '50%', left: -10, transform: [{ translateY: -5 }] }}
              delay={700}
            />
          </View>

          {/* Title and Description for this specific screen */}
          <Text className="mb-4 text-center font-inter-bold text-2xl text-black">
            Get Snatched
          </Text>
          <Text className="mb-8 text-center font-inter text-black">
            Your journey to your dream body begins now. Let's transform together
            with a plan designed specifically for you.
          </Text>

          {/* Feature List specific to this screen */}
          <View className="mb-8 w-full rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <FeatureListItem text="Fully personalized transformation plan" />
            <FeatureListItem text="Daily guidance and motivation" />
            <FeatureListItem text="AI coach available 24/7" />
            <FeatureListItem text="Join thousands of successful transformations" />
          </View>

          {/* Indicator */}
          <CarouselIndicator
            count={totalSteps}
            activeIndex={currentStepIndex}
          />
        </View>

        {/* Button */}
        <View className="p-8">
          <StyledButton 
            title="Continue" 
            onPress={handleNext} 
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
