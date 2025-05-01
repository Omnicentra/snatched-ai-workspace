import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Svg, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 32; // Total horizontal padding
const CIRCLE_SIZE = SCREEN_WIDTH - PADDING; // Circle will fill screen width minus padding
const CIRCLE_LENGTH = CIRCLE_SIZE * Math.PI; // Circumference
const CIRCLE_RADIUS = CIRCLE_SIZE / 2; // Radius
const INITIAL_TIME = 45; // Default exercise time in seconds

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function WorkoutStartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [currentExercise, setCurrentExercise] = useState(1);
  // Use a ref to track initial setup
  const initialSetupRef = useRef(true);
  const progress = useSharedValue(initialSetupRef.current ? 1 : 0);
  
  // Get parameters from URL
  const workoutId = typeof params.workoutId === 'string' ? parseInt(params.workoutId, 10) : undefined;
  const workoutTitle = params.workoutTitle as string || 'Workout';
  const totalExercises = typeof params.totalExercises === 'string' ? parseInt(params.totalExercises, 10) : 6;
  const duration = typeof params.duration === 'string' ? parseInt(params.duration, 10) : 30;
  const _difficultyLevel = params.difficultyLevel as string || 'Intermediate';
  const exerciseName = params.exerciseName as string || 'Exercise';
  const nextExerciseName = 'Next Exercise'; // In a real app, this would come from your workout data
  
  // Total calories estimated based on workout duration and difficulty
  const estimatedCalories = Math.round(duration * 8.3); // Simple estimation formula

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset timer - using withTiming instead of direct mutation
  const resetTimer = useCallback(() => {
    setTimeLeft(INITIAL_TIME);
    progress.value = withTiming(1, { duration: 300 });
  }, [progress]);
  
  // Mark setup as complete after initial render
  useEffect(() => {
    initialSetupRef.current = false;
  }, []);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    if (currentExercise >= totalExercises) {
      // Workout completed
      router.push({
        pathname: '/(modals)/workout-complete',
        params: {
          workoutId: workoutId?.toString(),
          workoutTitle,
          duration: duration.toString(),
          calories: estimatedCalories.toString(),
          moves: totalExercises.toString(),
        }
      });
    } else {
      // Move to next exercise
      setCurrentExercise(prev => prev + 1);
      resetTimer();
    }
  }, [router, resetTimer, currentExercise, totalExercises, workoutId, workoutTitle, duration, estimatedCalories]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Animate progress ring with withTiming
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
    if (currentExercise > 1) {
      setCurrentExercise(prev => prev - 1);
    }
    resetTimer();
  };

  // Format the workout type display
  const formatWorkoutType = () => {
    return workoutTitle.toUpperCase();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable onPress={handleBack} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text className="text-base font-inter-medium">Move {currentExercise} of {totalExercises}</Text>
        <View className="bg-pink-100 px-3 py-1 rounded-full">
          <Text className="text-pink-600 font-inter-medium">{formatWorkoutType()}</Text>
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
              {exerciseName}
            </Text>
            <Text className="text-gray-600 text-center text-sm mb-8">
              Keep your core tight and maintain proper form
            </Text>
            
            {/* Timer */}
            <Text className="text-7xl font-inter-bold mb-8">
              {formatTime(timeLeft)}
            </Text>
            
            <Text className="text-gray-500 text-sm">
              Up Next: {nextExerciseName}
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