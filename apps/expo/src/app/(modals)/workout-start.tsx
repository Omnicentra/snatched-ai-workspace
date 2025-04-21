import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  FadeIn,
  Easing,
} from 'react-native-reanimated';
import { Svg, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 32; // Total horizontal padding
const CIRCLE_SIZE = SCREEN_WIDTH - PADDING; // Circle will fill screen width minus padding
const CIRCLE_LENGTH = CIRCLE_SIZE * Math.PI; // Circumference
const CIRCLE_RADIUS = CIRCLE_SIZE / 2; // Radius
const INITIAL_TIME = 60; // 60 seconds

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface WorkoutStartProps {
  title?: string;
  subtitle?: string;
  totalMoves?: number;
  currentMove?: number;
  nextExercise?: string;
  workoutType?: string;
}

export default function WorkoutStartScreen() {
  const router = useRouter();
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const progress = useSharedValue(1);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset timer
  const resetTimer = useCallback(() => {
    setTimeLeft(INITIAL_TIME);
    progress.value = 1;
  }, []);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    resetTimer();
    router.push('/(modals)/workout-complete');
  }, [router, resetTimer]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Animate progress ring
          progress.value = withTiming(newTime / INITIAL_TIME, {
            duration: 1000,
            easing: Easing.linear,
          });
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, progress, handleTimerComplete]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_LENGTH * (1 - progress.value),
  }));

  const handleBack = () => {
    router.back();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleNext = () => {
    handleTimerComplete();
  };

  const handlePrevious = () => {
    resetTimer();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable onPress={handleBack} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text className="text-base font-inter-medium">Move 3 of 6</Text>
        <View className="bg-pink-100 px-3 py-1 rounded-full">
          <Text className="text-pink-600 font-inter-medium">BOOTY BOOST</Text>
        </View>
      </View>

      {/* Progress Circle */}
      <View className="flex-1 items-center justify-center px-4">
        <View className="relative items-center justify-center">
          {/* SVG Progress Ring */}
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
            {/* Background Circle */}
            <Circle
              cx={CIRCLE_RADIUS}
              cy={CIRCLE_RADIUS}
              r={CIRCLE_RADIUS - 10}
              stroke="#f3f4f6"
              strokeWidth={12}
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <AnimatedCircle
              cx={CIRCLE_RADIUS}
              cy={CIRCLE_RADIUS}
              r={CIRCLE_RADIUS - 10}
              stroke="#f472b6"
              strokeWidth={12}
              strokeDasharray={CIRCLE_LENGTH}
              animatedProps={animatedProps}
              strokeLinecap="round"
              rotation="-90"
              origin={`${CIRCLE_RADIUS}, ${CIRCLE_RADIUS}`}
              fill="transparent"
            />
          </Svg>

          {/* Content inside the circle */}
          <View className="absolute items-center px-8">
            <Text className="text-xl font-inter-bold mb-2 text-center">
              Lying Bent Knee Clamshell
            </Text>
            <Text className="text-gray-600 text-center text-sm mb-8">
              Keep your knees stacked and your core tight
            </Text>
            
            {/* Timer */}
            <Text className="text-7xl font-inter-bold mb-8">
              {formatTime(timeLeft)}
            </Text>
            
            <Text className="text-gray-500 text-sm">
              Up Next: Fire Hydrants
            </Text>
          </View>
        </View>
      </View>

      {/* Control Buttons */}
      <View className="flex-row items-center justify-center gap-x-8 pb-8">
        <Pressable 
          onPress={handlePrevious}
          className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="play-skip-back" size={24} color="black" />
        </Pressable>
        
        <Pressable 
          onPress={togglePause}
          className="w-20 h-20 rounded-full bg-black items-center justify-center"
        >
          <Ionicons 
            name={isPaused ? "play" : "pause"} 
            size={32} 
            color="white" 
          />
        </Pressable>
        
        <Pressable 
          onPress={handleNext}
          className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="play-skip-forward" size={24} color="black" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
} 