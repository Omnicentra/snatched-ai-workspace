import React, { useState, useEffect, useCallback } from 'react';
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
import { api } from '@/utils/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 32; // Total horizontal padding
const CIRCLE_SIZE = SCREEN_WIDTH - PADDING; // Circle will fill screen width minus padding
const CIRCLE_LENGTH = CIRCLE_SIZE * Math.PI; // Circumference
const CIRCLE_RADIUS = CIRCLE_SIZE / 2; // Radius

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function WorkoutStartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isPaused, setIsPaused] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const progress = useSharedValue(1);
  
  // Get workout ID from params
  const workoutId = typeof params.workoutId === 'string' ? parseInt(params.workoutId, 10) : undefined;

  // Fetch workout details with exercises
  const { data: workoutData } = api.workout.getWorkoutWithExercises.useQuery(
    { workoutId: workoutId ?? 0 },
    { enabled: !!workoutId }
  );

  // Track workout progress mutation
  const trackProgressMutation = api.workout.trackWorkoutProgress.useMutation();

  // Current exercise data
  const currentExercise = workoutData?.exercises[currentExerciseIndex];
  const nextExercise = workoutData?.exercises[currentExerciseIndex + 1];
  const totalExercises = workoutData?.exercises.length ?? 0;
  
  // Calculate exercise duration (work time + rest time)
  const calculateExerciseDuration = useCallback((exercise: NonNullable<typeof currentExercise>) => {
    // Each set takes: (time for reps) + rest time
    const timePerRep = 3; // Assume 3 seconds per rep
    return exercise.sets * ((exercise.reps * timePerRep) + exercise.restSeconds);
  }, []);

  // Initialize timer when exercise changes
  useEffect(() => {
    if (currentExercise) {
      const duration = calculateExerciseDuration(currentExercise);
      setTimeLeft(duration);
      progress.value = withTiming(1, { duration: 300 });
    }
  }, [currentExercise, calculateExerciseDuration, progress]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (!isPaused && timeLeft > 0 && currentExercise) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Update progress ring
          const exerciseDuration = calculateExerciseDuration(currentExercise);
          progress.value = withTiming(newTime / exerciseDuration, {
            duration: 1000,
            easing: Easing.linear,
          });
          return newTime;
        });
        setTotalTimeElapsed(prev => prev + 1);
        // Rough calorie calculation (based on MET value of moderate exercise)
        setCaloriesBurned(prev => prev + 0.1); // ~360 calories per hour
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, currentExercise, progress, calculateExerciseDuration]);

  // Handle exercise completion
  useEffect(() => {
    if (timeLeft === 0 && currentExercise) {
      if (currentExerciseIndex + 1 < totalExercises) {
        // Move to next exercise
        setCurrentExerciseIndex(prev => prev + 1);
      } else {
        // Workout complete
        void handleWorkoutComplete();
      }
    }
  }, [timeLeft, currentExercise, currentExerciseIndex, totalExercises]);

  const handleWorkoutComplete = async () => {
    if (!workoutData || !workoutId) return;

    try {
      // Track workout progress
      await trackProgressMutation.mutateAsync({
        userId: 1, // Replace with actual user ID from auth
        workoutId,
        durationMinutes: Math.ceil(totalTimeElapsed / 60),
        caloriesBurned: Math.round(caloriesBurned),
      });

      // Navigate to completion screen
      router.push({
        pathname: '/(modals)/workout-complete',
        params: {
          workoutId: workoutId.toString(),
          workoutTitle: workoutData.title,
          duration: Math.ceil(totalTimeElapsed / 60).toString(),
          calories: Math.round(caloriesBurned).toString(),
          moves: totalExercises.toString(),
        }
      });
    } catch (error) {
      console.error('Failed to track workout progress:', error);
    }
  };

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
    if (currentExerciseIndex + 1 < totalExercises) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      handleWorkoutComplete();
    }
  };

  const handlePrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!workoutData || !currentExercise) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="font-inter text-gray-500">Loading workout...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <Pressable onPress={handleBack} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text className="text-base font-inter-medium">
          Exercise {currentExerciseIndex + 1} of {totalExercises}
        </Text>
        <View className="bg-pink-100 px-3 py-1 rounded-full">
          <Text className="text-pink-600 font-inter-medium">
            {workoutData.title.toUpperCase()}
          </Text>
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
              {currentExercise.name}
            </Text>
            <Text className="text-gray-600 text-center text-sm mb-4">
              {currentExercise.sets} sets × {currentExercise.reps} reps
            </Text>
            <Text className="text-gray-600 text-center text-sm mb-8">
              {currentExercise.restSeconds}s rest between sets
            </Text>
            
            {/* Timer */}
            <Text className="text-7xl font-inter-bold mb-8">
              {formatTime(timeLeft)}
            </Text>
            
            {nextExercise && (
            <Text className="text-gray-500 text-sm">
                Up Next: {nextExercise.name}
            </Text>
            )}
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row justify-around px-6 mb-8">
        <View className="items-center">
          <Text className="font-inter-bold text-2xl text-black">
            {Math.round(caloriesBurned)}
          </Text>
          <Text className="font-inter text-sm text-gray-500">Cal Burned</Text>
        </View>
        <View className="items-center">
          <Text className="font-inter-bold text-2xl text-black">
            {formatTime(totalTimeElapsed)}
          </Text>
          <Text className="font-inter text-sm text-gray-500">Duration</Text>
        </View>
      </View>

      {/* Control Buttons */}
      <View className="flex-row items-center justify-center gap-x-8 pb-8">
        <Pressable 
          onPress={handlePrevious}
          className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center"
          disabled={currentExerciseIndex === 0}
        >
          <Ionicons 
            name="play-skip-back" 
            size={24} 
            color={currentExerciseIndex === 0 ? "#9CA3AF" : "black"} 
          />
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