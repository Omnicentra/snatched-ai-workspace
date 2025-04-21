// components/ProgressRing.tsx
import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
    Easing
} from 'react-native-reanimated'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface ProgressRingProps {
    size: number
    strokeWidth: number
    progress: number // 0 to 1
    bgColor?: string
    progressColor?: string
    textColor?: string
    textSize?: number
    showPercentage?: boolean
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
    size,
    strokeWidth,
    progress, // Should be between 0 and 1
    bgColor = 'rgba(255, 255, 255, 0.3)', // Default white with opacity
    progressColor = 'white',
    textColor = 'white',
    textSize = 14,
    showPercentage = true
}) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const progressValue = useSharedValue(0)

    useEffect(() => {
        progressValue.value = withTiming(progress, {
            duration: 500,
            easing: Easing.out(Easing.ease)
        })
    }, [progress])

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference * (1 - progressValue.value)
        return {
            strokeDashoffset
        }
    })

    return (
        <View
            style={{ width: size, height: size }}
            className="items-center justify-center"
        >
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background Circle */}
                <Circle
                    stroke={bgColor}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                {/* Progress Circle */}
                <AnimatedCircle
                    stroke={progressColor}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`} // Rotate to start from top
                />
            </Svg>
            {showPercentage && (
                <View className="absolute inset-0 items-center justify-center">
                    <Text
                        className="font-inter-bold" // Use your loaded bold font
                        style={{ color: textColor, fontSize: textSize }}
                    >
                        {`${Math.round(progress * 100)}%`}
                    </Text>
                </View>
            )}
        </View>
    )
}
