import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient';
import Animated, {
  useAnimatedProps,
  withTiming,
  useSharedValue,
  useDerivedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircleProgressProps {
  size: number;
  progress: number;
  thickness?: number;
  indicatorColor?: string;
  unfilledColor?: string;
  innerFillColor?: string;
  innerFillGradient?: LinearGradientProps;
  style?: ViewStyle;
  duration?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  rotation?: number;
  children?: React.ReactNode;
}

export const CircleProgress: React.FC<CircleProgressProps> = ({
  size,
  progress,
  thickness = 10,
  indicatorColor = '#000',
  unfilledColor = 'rgba(0,0,0,0.1)',
  innerFillColor,
  innerFillGradient,
  style,
  duration = 500,
  strokeLinecap = 'round',
  rotation = -90,
  children,
}) => {
  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration });
  }, [progress, duration]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progressValue.value);
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[{ width: size, height: size }, style]}>
      {/* Background Fill */}
      {innerFillGradient ? (
        <LinearGradient
          style={{
            position: 'absolute',
            width: size - thickness * 2,
            height: size - thickness * 2,
            borderRadius: (size - thickness * 2) / 2,
            top: thickness,
            left: thickness,
          }}
          {...innerFillGradient}
        />
      ) : innerFillColor ? (
        <View
          style={{
            position: 'absolute',
            width: size - thickness * 2,
            height: size - thickness * 2,
            borderRadius: (size - thickness * 2) / 2,
            backgroundColor: innerFillColor,
            top: thickness,
            left: thickness,
          }}
        />
      ) : null}

      <Svg width={size} height={size}>
        <G rotation={rotation} origin={`${center}, ${center}`}>
          {/* Background Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={unfilledColor}
            strokeWidth={thickness}
            fill="none"
          />

          {/* Progress Circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={indicatorColor}
            strokeWidth={thickness}
            strokeLinecap={strokeLinecap}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>

      {/* Children (e.g., centered content) */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
}; 