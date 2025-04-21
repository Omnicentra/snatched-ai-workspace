// components/AnimatedBubbleLetter.tsx
import React, { useEffect } from 'react'
import { Text, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated'

interface AnimatedBubbleLetterProps {
  character: string
  index: number
  // Optional props to customize animation
  amplitude?: number // How many pixels to move up/down
  duration?: number // Duration of one full up/down cycle
  delayFactor?: number // How much delay between adjacent letters
  color?: string // Color of the letter
  loop?: boolean // Whether to loop the animation
}

export const AnimatedBubbleLetter: React.FC<AnimatedBubbleLetterProps> = ({
  character,
  index,
  amplitude = 2, // Default: move 2px up/down
  duration = 2000, // Default: 1.5 seconds per cycle
  delayFactor = 0.05, // Default: 10% of duration delay per index
  loop = true, // Default: true
  color = 'white' // Default: white
}) => {
  const phase = useSharedValue(0)

  useEffect(() => {
    // Start the animation after a delay based on the index
    const startDelay = index * (duration * delayFactor)
    
    setTimeout(() => {
      if (loop) {
        // For looping animation, use withRepeat
        phase.value = withRepeat(
          withTiming(1, { 
            duration: duration, 
            easing: Easing.linear 
          }),
          -1, // Infinite repeats
          false // No reversing needed for phase
        )
      } else {
        // For non-looping animation, do one cycle and return to start
        phase.value = withSequence(
          withTiming(1, { 
            duration: duration / 2, 
            easing: Easing.linear 
          }),
          withTiming(0, { 
            duration: duration / 2, 
            easing: Easing.linear 
          })
        )
      }
    }, startDelay)
  }, [duration, loop, index, delayFactor]) // Include all dependencies

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate the offset phase for this specific letter
    const offsetPhase = phase.value

    // Use Math.sin for smooth up/down oscillation
    const translateY = Math.sin(offsetPhase * 2 * Math.PI) * amplitude

    return {
      transform: [{ translateY }]
    }
  })

  // Base styles for the letter - using StyleSheet for textShadow
  // Apply Tailwind classes directly in the component using this if preferred
  const letterStyle = [styles.baseText]

  // Render space characters without animation if desired, or apply minimal animation
  if (character === ' ') {
    return <Text style={[letterStyle, { color: color }]}> </Text>
  }

  return (
    <Animated.Text style={[letterStyle, animatedStyle]}>
      {character}
    </Animated.Text>
  )
}

// Using StyleSheet primarily for textShadow which isn't directly in NativeWind v4 className
const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'Fredoka-Bold', // MAKE SURE this matches the font loaded in _layout.tsx
    fontSize: 22, // Equivalent to text-xl
    fontWeight: 'bold', // Handled by custom font usually
    letterSpacing: 2.5,
    // Apply text shadow using inline style or StyleSheet
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5
  }
})

export default AnimatedBubbleLetter
