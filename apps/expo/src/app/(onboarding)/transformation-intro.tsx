// app/(onboarding)/transformation-intro.tsx // <-- Assuming file name might be this based on component name
import React, { useEffect } from 'react'
import { View, Text, SafeAreaView, ScrollView, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { OnboardingHeader, StyledButton } from '@/components/core' // Assuming core components path
import Svg, { Path, Circle } from 'react-native-svg'
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
  withDelay,
  FadeIn, // Import FadeIn
  useAnimatedStyle, // Import useAnimatedStyle for the circle
  interpolate, // Import interpolate
} from 'react-native-reanimated'

const AnimatedPath = Animated.createAnimatedComponent(Path)
// const AnimatedCircle = Animated.createAnimatedComponent(Circle); // Option 1: Animate Circle directly
// Option 2: Wrap Circle in Animated.View (often simpler for opacity/transform)

export default function TransformationIntroScreen() {
  const router = useRouter()
  const { width: screenWidth } = Dimensions.get('window')
  const progress = useSharedValue(0) // Animation driver (0 to 1)

  // --- Graph Dimensions ---
  const containerPaddingHorizontal = 32 // Match ScrollView px-8 (16 * 2)
  const graphWidth = screenWidth - containerPaddingHorizontal * 2 // Adjust for screen padding
  const graphHeight = 280
  const xAxisPadding = 40 // Space for Y-axis label
  const yAxisPadding = 30 // Space for X-axis labels
  const plotWidth = graphWidth - xAxisPadding - 20 // Right padding within graph
  const plotHeight = graphHeight - yAxisPadding - 20 // Top padding within graph

  // --- Animation Setup ---
  const animationDuration = 2500 // Make lines draw a bit faster
  const startDelay = 300

  useEffect(() => {
    progress.value = 0 // Reset on mount/re-mount
    progress.value = withDelay(
      startDelay,
      withTiming(1, {
        duration: animationDuration,
        easing: Easing.bezier(0.35, 0, 0.65, 1), // Smoother easing
      })
    )
  }, [])

  // --- Path Definitions --- (Use calculated dimensions)
  const visibleWaistlinePath = `
    M ${xAxisPadding} ${graphHeight - yAxisPadding}
    C ${xAxisPadding + plotWidth * 0.3} ${graphHeight - yAxisPadding - plotHeight * 0.3},
      ${xAxisPadding + plotWidth * 0.7} ${graphHeight - yAxisPadding - plotHeight * 0.7},
      ${xAxisPadding + plotWidth} ${graphHeight - yAxisPadding - plotHeight * 0.9}
  `
  const optimizedHabitsPath = `
    M ${xAxisPadding} ${graphHeight - yAxisPadding}
    C ${xAxisPadding + plotWidth * 0.3} ${graphHeight - yAxisPadding - plotHeight * 0.2},
      ${xAxisPadding + plotWidth * 0.7} ${graphHeight - yAxisPadding - plotHeight * 0.5},
      ${xAxisPadding + plotWidth} ${graphHeight - yAxisPadding - plotHeight * 0.7}
  `

  // --- Animated Props for Paths (Stroke Dash) ---
  // Estimate a reasonable dash length, adjust if needed
  const dashLength = plotWidth * 1.5 // A rough estimate, usually larger than actual length works ok

  const animatedPathProps = useAnimatedProps(() => ({
    strokeDashoffset: Math.max(0, (1 - progress.value) * dashLength), // Ensure offset doesn't go negative
    strokeDasharray: [dashLength, dashLength],
    opacity: interpolate(progress.value, [0, 0.05], [0, 1]), // Fade in paths quickly at the start
  }))

  // --- Animated Style for the End Circle ---
  const animatedCircleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.85, 0.95], [0, 0, 1]), // Fade in near the end
    transform: [
      {
        scale: interpolate(progress.value, [0, 0.9, 1], [0.5, 0.5, 1]), // Scale up slightly at the end
      },
    ],
  }))

  const handleContinue = () => {
    router.push('/(onboarding)/health') // Navigate to the next screen
  }

  // --- Base Delay for Staggering Elements ---
  const baseElementDelay = startDelay + 500 // Start animating elements after lines start drawing

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      {/* Use ScrollView for content that might exceed screen height */}
      <View
        style={{ flexGrow: 1 }}
        className="px-8" // Use className for padding
      >
        {/* --- Header --- */}
        <Animated.View entering={FadeIn.delay(startDelay - 100).duration(400)}>
          <OnboardingHeader
            showBack={true}
            progress={10 / 20}
            title="Snatched AI creates long-term results" // Consistent title
            subtitle="Your final snatch" // Keeping subtitle from original code
            subtitleClassName="text-xl font-inter-bold mt-5"
          />
        </Animated.View>

        {/* --- Graph Section --- */}
        <View className="mb-12 mt-5">
          {/* Container for Graph + Axes + Labels */}
          <View className="relative" style={{ height: graphHeight }}>
            {/* Axes Lines (Static - appear instantly or with graph container) */}
            <View className="absolute w-[1.5px] bg-gray-200" style={{ bottom: yAxisPadding, left: xAxisPadding, top: 10 }}/>
            <View className="absolute h-[1.5px] bg-gray-200" style={{ bottom: yAxisPadding, left: xAxisPadding, right: 10 }}/>

            {/* Grid Lines (Fade in slightly after axes) */}
            <Animated.View
              entering={FadeIn.delay(startDelay + 100).duration(300)}
              className="absolute"
              style={{ left: xAxisPadding, right: 10, bottom: yAxisPadding, top: 10 }}
            >
              {/* Create vertical grid lines based on plot height */}
              {[...Array(5)].map((_, i) => (
                <View
                  key={`h-${i}`}
                  className="flex-1 border-b border-dashed border-gray-100" // Use flex-1 for height distribution
                  // style={{ height: plotHeight / 4 }} // flex-1 replaces specific height calculation
                />
              ))}
              {/* Add bottom border to complete the grid look if needed */}
              <View className="absolute bottom-0 left-0 right-0 h-px"/>
            </Animated.View>

            {/* --- SVG Canvas --- */}
            <Svg width={graphWidth} height={graphHeight} style={{ position: 'absolute', top: 0, left: 0 }}>
              {/* Optimized habits curve (bottom, pinker) */}
              <AnimatedPath
                animatedProps={animatedPathProps}
                d={optimizedHabitsPath}
                stroke="#fb7185" // Rose color
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Visible waistline curve (top, brighter pink) */}
              <AnimatedPath
                animatedProps={animatedPathProps}
                d={visibleWaistlinePath}
                stroke="#f472b6" // Pink color
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* --- Animated End Point Circle --- */}
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    left: xAxisPadding + plotWidth - 6,
                    top: graphHeight - yAxisPadding - plotHeight * 0.9 - 6,
                  },
                  animatedCircleStyle,
                ]}
              >
                <Circle
                  cx={6}
                  cy={6}
                  r={6}
                  fill="#f472b6"
                />
              </Animated.View>
            </Svg>

            {/* --- X-axis labels --- */}
            <Animated.View
              entering={FadeIn.delay(baseElementDelay + 200).duration(500)}
              className="absolute bottom-0 flex-row justify-between"
              // Position relative to the graph container edges
              style={{ left: xAxisPadding, right: 10, height: yAxisPadding, alignItems: 'center' }}
            >
              <Text className="text-xs text-gray-600">Day 1</Text>
              <Text className="text-xs text-gray-600">Day 7</Text>
              <Text className="text-xs text-gray-600">Day 30</Text>
            </Animated.View>

            {/* --- Y-axis label --- */}
            <Animated.View
              entering={FadeIn.delay(baseElementDelay + 400).duration(500)}
              // // Position precisely using absolute and transform
              // className="absolute -left-12 top-32"
              style={{
                position: 'absolute',
                left: xAxisPadding / 2 -5, // Adjust positioning as needed
                top: graphHeight,
                width: graphHeight, // Give it width for rotation centering
                transform: [{ translateX: -graphHeight / 2 }, { rotate: '-90deg' }, {translateX: graphHeight / 2}], // Standard rotate from center
                alignItems: 'center', // Center text within the rotated view
              }}
            >
              <Text className="text-xs text-gray-600">Waistline Change</Text>
            </Animated.View>
          </View>

          {/* --- Legend --- */}
          <Animated.View
            entering={FadeIn.delay(baseElementDelay + 600).duration(500)}
            className="mt-6 flex-row justify-center gap-x-6" // Reduced gap slightly
          >
            <View className="flex-row items-center">
              <View className="h-2.5 w-2.5 rounded-full bg-[#f472b6]" />
              <Text className="ml-1.5 text-xs text-gray-700">Visible Waistline</Text>
            </View>
            <View className="flex-row items-center">
              <View className="h-2.5 w-2.5 rounded-full bg-[#fb7185]" />
              <Text className="ml-1.5 text-xs text-gray-700">Optimized Habits</Text>
            </View>
          </Animated.View>
        </View>

        {/* Spacer to push button down if content is short */}
        <View style={{ flex: 1 }} />

      </View>

      {/* --- Bottom Section (Fixed at Bottom) --- */}
      <View className="p-8 pt-4 gap-y-4 border-t border-gray-100 bg-white">
         {/* --- Descriptive Text --- */}
         <Animated.View entering={FadeIn.delay(baseElementDelay + 800).duration(500)}>
            <Text className="text-center text-xs text-gray-500">
              Based on Snatched AI user trends, visual changes usually begin
              after Day 7 — and by Day 30, results become truly noticeable.
            </Text>
         </Animated.View>

        {/* --- Continue Button --- */}
        <View className="mt-auto">
          <StyledButton title="Continue" onPress={handleContinue} variant="primary" />
        </View>
      </View>
    </SafeAreaView>
  )
}