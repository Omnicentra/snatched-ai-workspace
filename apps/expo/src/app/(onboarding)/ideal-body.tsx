// app/(onboarding)/ideal-body.tsx
import React, { useEffect } from 'react'
import { View, Text, SafeAreaView, ScrollView, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { OnboardingHeader, InfoCard, StyledButton } from '@/components/core'
import Svg, {
  Path,
  LinearGradient as SvgLinearGradient,
  Stop,
  Defs,
  Circle
} from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  withDelay,
  useAnimatedProps
} from 'react-native-reanimated'

const SIX_WEEKS_IN_MS = 6 * 7 * 24 * 60 * 60 * 1000;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const IdealBodyGraph = () => {
  const viewboxWidth = 300
  const viewboxHeight = 150
  const progress = useSharedValue(0)

  // Define the curve path
  const curvePath = `M 5 ${viewboxHeight - 10} Q ${viewboxWidth / 2} ${viewboxHeight - 10} ${viewboxWidth - 5} 10`

  useEffect(() => {
    // Start with progress at 0
    progress.value = 0

    // Add a small delay before starting the animation
    progress.value = withDelay(
      500, // 500ms delay before starting
      withTiming(1, {
        duration: 2000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
      })
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate position along the curve using quadratic bezier
    const t = progress.value

    // Start and end points
    const x1 = 5
    const y1 = viewboxHeight - 10
    const x2 = viewboxWidth - 5
    const y2 = 10

    // Control point (for the quadratic curve)
    const cpX = viewboxWidth / 2
    const cpY = viewboxHeight - 10

    // Quadratic bezier formula
    const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpX + t * t * x2
    const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cpY + t * t * y2

    return {
      transform: [
        { translateX: x - 100 }, // Adjust offset based on marker width
        { translateY: y } // Adjust offset based on marker height
      ],
      opacity: interpolate(progress.value, [0, 0.1, 0.8, 1], [0, 1, 1, 1])
    }
  })

  const animatedCircleProps = useAnimatedProps(() => {
    const t = progress.value

    // Start and end points
    const x1 = 5
    const y1 = viewboxHeight - 10
    const x2 = viewboxWidth - 5
    const y2 = 10

    // Control point (for the quadratic curve)
    const cpX = viewboxWidth / 2
    const cpY = viewboxHeight - 10

    // Quadratic bezier formula
    const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpX + t * t * x2
    const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cpY + t * t * y2

    return {
      cx: x,
      cy: y,
      r: 6,
      opacity: interpolate(progress.value, [0, 0.1], [0, 1])
    }
  })

  return (
    <View className="relative mb-6 h-[220px] overflow-hidden rounded-2xl border border-gray-100 bg-pink-50/50 p-4">
      {/* Axes (simplified) */}
      <View className="absolute bottom-8 left-7 top-4 w-px bg-gray-200" />
      <View className="absolute bottom-8 left-7 right-4 h-px bg-gray-200" />

      {/* SVG for curve and animated point */}
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewboxWidth} ${viewboxHeight}`}
      >
        <Defs>
          <SvgLinearGradient
            id="lineGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <Stop offset="0%" stopColor="#FF9A9E" />
            <Stop offset="100%" stopColor="#FAD0C4" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d={curvePath}
          stroke="url(#lineGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <AnimatedCircle
          animatedProps={animatedCircleProps}
          fill="white"
          stroke="#f472b6"
          strokeWidth="2"
        />
      </Svg>

      {/* Labels (Positioned Absolutely) */}
      <Text
        className="absolute text-xs text-black"
        style={{ left: 20, bottom: 10, transform: [{ translateX: -10 }] }}
      >
        Today
      </Text>
      <Text
        className="absolute text-xs text-black"
        style={{ right: 20, top: 15, transform: [{ translateX: 10 }] }}
      >
        X weeks
      </Text>

      {/* Animated Target Marker */}
      <Animated.View
        style={[{ position: 'absolute' }, animatedStyle]}
        className="rounded-lg bg-pink-400 p-1.5 px-2.5"
      >
        <Text className="text-[10px] font-medium text-white">
          {new Date(Date.now() + SIX_WEEKS_IN_MS).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - Snatched target!
        </Text>
      </Animated.View>
    </View>
  )
}

export default function IdealBodyScreen() {
  const router = useRouter()

  const handleContinue = () => {
    router.push('/(onboarding)/height')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <OnboardingHeader progress={5 / 20} />
        <Text className="mb-5 font-inter-bold text-2xl text-black">
          Snatched AI helps you get your ideal body
        </Text>

        <IdealBodyGraph />

        <View className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <Text className="mb-1.5 font-inter-bold text-lg text-black">
            You're just X weeks away from your snatched self.
          </Text>
          <Text className="font-inter text-sm text-black">
            Our AI has analyzed your goals and body type. You're closer to your
            ideal body than you think!
          </Text>
        </View>

        <InfoCard
          icon={<Ionicons name="sparkles-outline" size={20} color="black" />}
          text="We'll create a personalized plan that's scientifically designed to get you snatched in record time."
          iconBg="bg-yellow-100"
        />

        <View className="mt-auto pt-8">
          <StyledButton
            title="Let's do this!"
            onPress={handleContinue}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
