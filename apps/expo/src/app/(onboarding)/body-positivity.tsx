// app/(onboarding)/body-positivity.tsx
import bodyPositivity from '@/assets/images/body-positivity.png'
import { StyledButton } from '@/components/core'; // Assuming you want to use the standard button
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking'
import Constants from 'expo-constants'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from 'react-native-reanimated'
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg'; // Import SVG components

// Reusable Animated View for Fade-in effect
const FadeInView = ({
  children,
  delay = 0,
  duration = 1000,
  style
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
  style?: object
}) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(10)

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: duration, easing: Easing.out(Easing.ease) })
    )
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: duration, easing: Easing.out(Easing.ease) })
    )
  }, [delay, duration, opacity, translateY])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }]
    }
  })

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  )
}

// SVG Illustration Component (copied from HTML, converted JSX attributes)
const BodyPositivityIllustration = () => (
  <Svg width="100%" viewBox="0 0 400 220" fill="none">
    {/* Background element */}
    <Rect width="400" height="220" rx="20" fill="#FFF5F5" />

    {/* Woman 1 - Athletic build */}
    <G transform="translate(30, 40)">
      <Ellipse cx="35" cy="130" rx="25" ry="30" fill="#FAD0C4" /> {/* Body */}
      <Circle cx="35" cy="60" r="30" fill="#C9A9A6" /> {/* Head */}
      <Path
        d="M20 55 Q35 65 50 55"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />{' '}
      {/* Smile */}
      <Ellipse cx="25" cy="50" rx="3" ry="4" fill="black" /> {/* Left eye */}
      <Ellipse cx="45" cy="50" rx="3" ry="4" fill="black" /> {/* Right eye */}
      <Path d="M35 90 L35 130" stroke="#C9A9A6" strokeWidth="30" />{' '}
      {/* Torso */}
      <Rect x="20" y="90" width="30" height="40" rx="10" fill="#FF9A9E" />{' '}
      {/* Top */}
      <Rect x="20" y="130" width="15" height="50" rx="10" fill="#FF9A9E" />{' '}
      {/* Left leg */}
      <Rect x="35" y="130" width="15" height="50" rx="10" fill="#FF9A9E" />{' '}
      {/* Right leg */}
      <Path
        d="M5 110 L20 110"
        stroke="#C9A9A6"
        strokeWidth="10"
        strokeLinecap="round"
      />{' '}
      {/* Left arm */}
      <Path
        d="M65 110 L50 110"
        stroke="#C9A9A6"
        strokeWidth="10"
        strokeLinecap="round"
      />{' '}
      {/* Right arm */}
    </G>

    {/* Woman 2 - Hourglass */}
    <G transform="translate(110, 30)">
      <Ellipse cx="35" cy="130" rx="30" ry="35" fill="#FFDAB9" /> {/* Body */}
      <Circle cx="35" cy="60" r="30" fill="#8D5524" /> {/* Head */}
      <Path
        d="M20 55 Q35 65 50 55"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />{' '}
      {/* Smile */}
      <Ellipse cx="25" cy="50" rx="3" ry="4" fill="black" /> {/* Left eye */}
      <Ellipse cx="45" cy="50" rx="3" ry="4" fill="black" /> {/* Right eye */}
      <Path d="M35 90 Q25 110 35 130" stroke="#8D5524" strokeWidth="30" />{' '}
      {/* Torso */}
      <Path d="M35 90 Q45 110 35 130" stroke="#8D5524" strokeWidth="30" />{' '}
      {/* Torso */}
      <Rect x="20" y="90" width="30" height="40" rx="10" fill="#D8BFD8" />{' '}
      {/* Top */}
      <Rect x="20" y="130" width="15" height="50" rx="10" fill="#D8BFD8" />{' '}
      {/* Left leg */}
      <Rect x="35" y="130" width="15" height="50" rx="10" fill="#D8BFD8" />{' '}
      {/* Right leg */}
      <Path
        d="M5 110 L20 110"
        stroke="#8D5524"
        strokeWidth="10"
        strokeLinecap="round"
      />{' '}
      {/* Left arm */}
      <Path
        d="M65 110 L50 110"
        stroke="#8D5524"
        strokeWidth="10"
        strokeLinecap="round"
      />{' '}
      {/* Right arm */}
    </G>

    {/* Woman 3 - Plus size */}
    <G transform="translate(190, 35)">
      <Ellipse cx="35" cy="130" rx="35" ry="35" fill="#E6BE8A" /> {/* Body */}
      <Circle cx="35" cy="60" r="30" fill="#E6BE8A" /> {/* Head */}
      <Path
        d="M20 55 Q35 65 50 55"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />{' '}
      {/* Smile */}
      <Ellipse cx="25" cy="50" rx="3" ry="4" fill="black" /> {/* Left eye */}
      <Ellipse cx="45" cy="50" rx="3" ry="4" fill="black" /> {/* Right eye */}
      <Path d="M35 90 L35 130" stroke="#E6BE8A" strokeWidth="40" />{' '}
      {/* Torso */}
      <Rect x="15" y="90" width="40" height="40" rx="10" fill="#FFECD2" />{' '}
      {/* Top */}
      <Rect x="15" y="130" width="20" height="50" rx="10" fill="#FFECD2" />{' '}
      {/* Left leg */}
      <Rect x="35" y="130" width="20" height="50" rx="10" fill="#FFECD2" />{' '}
      {/* Right leg */}
      <Path
        d="M0 110 L15 110"
        stroke="#E6BE8A"
        strokeWidth="12"
        strokeLinecap="round"
      />{' '}
      {/* Left arm */}
      <Path
        d="M70 110 L55 110"
        stroke="#E6BE8A"
        strokeWidth="12"
        strokeLinecap="round"
      />{' '}
      {/* Right arm */}
    </G>

    {/* Woman 4 - Pear shape */}
    <G transform="translate(270, 40)">
      <Ellipse cx="35" cy="130" rx="35" ry="40" fill="#A0522D" /> {/* Body */}
      <Circle cx="35" cy="60" r="30" fill="#A0522D" /> {/* Head */}
      <Path
        d="M20 55 Q35 65 50 55"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />{' '}
      {/* Smile */}
      <Ellipse cx="25" cy="50" rx="3" ry="4" fill="black" /> {/* Left eye */}
      <Ellipse cx="45" cy="50" rx="3" ry="4" fill="black" /> {/* Right eye */}
      <Path d="M35 90 Q25 120 35 130" stroke="#A0522D" strokeWidth="25" />{' '}
      {/* Torso */}
      <Path d="M35 90 Q45 120 35 130" stroke="#A0522D" strokeWidth="25" />{' '}
      {/* Torso */}
      <Rect x="22" y="90" width="26" height="40" rx="10" fill="#B5EAD7" />{' '}
      {/* Top */}
      <Rect x="15" y="130" width="20" height="50" rx="10" fill="#B5EAD7" />{' '}
      {/* Left leg */}
      <Rect x="35" y="130" width="20" height="50" rx="10" fill="#B5EAD7" />{' '}
      {/*<!-- Right leg --> */}
      <Path
        d="M5 100 L22 100"
        stroke="#A0522D"
        strokeWidth="8"
        strokeLinecap="round"
      />{' '}
      {/* Left arm */}
      <Path
        d="M65 100 L48 100"
        stroke="#A0522D"
        strokeWidth="8"
        strokeLinecap="round"
      />{' '}
      {/* Right arm */}
    </G>
  </Svg>
)

function BodyPositivityScreen() {
  const router = useRouter()

  const handleReady = () => {
    // Navigate to the next logical step, e.g., paywall or main app
    router.push('/(onboarding)/goal') // Example: Navigate to home tab
  }

  return (
    <View
      className="relative flex-1"
      style={{ paddingTop: Constants.statusBarHeight }}
    >
      <StatusBar translucent={true} hidden={true} />
      {/* Background Shapes */}
      <View
        style={StyleSheet.absoluteFill}
        className="-z-10 overflow-hidden opacity-50"
      >
        <View style={styles.shape1} />
        <View style={styles.shape2} />
        <View style={styles.shape3} />
      </View>

      {/* Main Content Area */}
      <View className="flex-1 px-8 pb-8">
        {/* Text Content */}
        <View className="mb-8 mt-12">
          <FadeInView delay={300} duration={1000}>
            <Text className="mb-4 text-center font-inter-bold text-3xl text-black">
              Hey Beautiful,
            </Text>
          </FadeInView>
          <FadeInView delay={600} duration={1000}>
            <Text className="text-center font-inter text-base leading-relaxed text-black">
              At Snatched AI, we believe every body is already beautiful. We're
              here to support your transformation all the way.
            </Text>
          </FadeInView>
        </View>

        {/* Image Container */}
        <View className="mt-12 flex-1 justify-start">
          <FadeInView
            delay={0}
            duration={1000}
            style={{ width: '100%', aspectRatio: 400 / 360 }}
          >
            <Image
              source={bodyPositivity}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
          </FadeInView>
        </View>

        {/* CTA Button */}
        <FadeInView delay={900} duration={1000} style={{ width: '100%' }}>
          <StyledButton
            title="I'm Ready"
            onPress={handleReady}
            variant="primary"
          />
        </FadeInView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  shape1: {
    position: 'absolute',
    width: 300,
    height: 300,
    backgroundColor: '#FF9A9E',
    borderRadius: 150,
    opacity: 0.2,
    top: -100,
    left: -100
  },
  shape2: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: '#FAD0C4',
    borderRadius: 100,
    opacity: 0.2,
    bottom: -50,
    right: -50
  },
  shape3: {
    position: 'absolute',
    width: 150,
    height: 150,
    backgroundColor: '#FFECD2',
    borderRadius: 75,
    opacity: 0.2,
    top: '50%',
    right: -50
  }
})

export default withOnboardingTracking(BodyPositivityScreen, 'body_positivity')
