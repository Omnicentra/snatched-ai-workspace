import { cooldownWorkoutId } from '@/lib/utils';
import { api } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, Text, View, Image } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle, Svg } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 34; // Total horizontal padding
const CIRCLE_SIZE = SCREEN_WIDTH - PADDING; // Circle will fill screen width minus padding
const CIRCLE_X = CIRCLE_SIZE / 2;
const CIRCLE_Y = CIRCLE_SIZE / 2;
const CIRCLE_RADIUS = (CIRCLE_SIZE / 2) - 70; // Radius
const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS; // Circumference of the actual progress ring

console.log({CIRCLE_LENGTH,CIRCLE_X, CIRCLE_Y, CIRCLE_RADIUS, CIRCLE_SIZE})

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function WorkoutStartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isPaused, setIsPaused] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(
    typeof params.exerciseIndex === 'string' ? parseInt(params.exerciseIndex, 10) : 0
  );
  const [timeLeft, setTimeLeft] = useState(-1);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const progress = useSharedValue(1);

  const interval = useRef<NodeJS.Timeout>();
  
  // Get workout ID from params
  const workoutId = typeof params.workoutId === 'string' ? parseInt(params.workoutId, 10) : undefined;

  const { mutateAsync: completeWorkoutPlan } = api.workout.completeWorkoutPlan.useMutation()
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
    if (workoutId === Number(cooldownWorkoutId)) {
      return 120; // 2 minutes for cooldown workout
    }
    // Each set takes: (time for reps) + rest time
    const timePerRep = 3; // Assume 3 seconds per rep
    return exercise.sets * ((exercise.reps * timePerRep) + exercise.restSeconds);
  }, [workoutId]);

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
    if (!isPaused && timeLeft > 0 && currentExercise) {
      interval.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Update progress ring
          const exerciseDuration = calculateExerciseDuration(currentExercise);
          if (exerciseDuration) {
            progress.value = withTiming(newTime / exerciseDuration, {
              duration: 1000,
              easing: Easing.linear,
            });
          }
          return newTime;
        });
        setTotalTimeElapsed(prev => prev + 1);
        // Rough calorie calculation (based on MET value of moderate exercise)
        setCaloriesBurned(prev => prev + 0.1); // ~360 calories per hour
      }, 1000);
    }

    return () => clearInterval(interval.current);
  }, [isPaused, timeLeft, currentExercise, progress, calculateExerciseDuration]);

  // Handle exercise completion
  useEffect(() => {
    if (timeLeft === 0 && currentExercise) {
      if (currentExerciseIndex + 1 < totalExercises) {
        // Move to next exercise
        setCurrentExerciseIndex(prev => prev + 1);
      } else {
        // Workout complete
        clearInterval(interval.current);
        void handleWorkoutComplete();
      }
    }
  }, [timeLeft, currentExercise, currentExerciseIndex, totalExercises]);

  /**
   * @param auto - if true, indicates the user marked th
   * @returns 
   */
  const handleWorkoutComplete = async () => {
    if (!workoutData || !workoutId) return;

    try {
      // Track workout progress
      await trackProgressMutation.mutateAsync({
        workoutId,
        durationMinutes: Math.ceil(totalTimeElapsed / 60),
        caloriesBurned: Math.round(caloriesBurned),
      });

      // Complete the workout plan
      await completeWorkoutPlan({
        workoutId,
        planId: workoutData.planId,
        dayNumber: workoutData.dayNumber,
      })

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
      void handleWorkoutComplete();
      clearInterval(interval.current);
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

      {/* Progress Circle with Image inside */}
      <View className="flex-1 items-center justify-center px-4">
        <View style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: 'center', justifyContent: 'center' }}>
          {/* SVG Progress Ring */}
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Background Circle */}
            <Circle
              cx={CIRCLE_X}
              cy={CIRCLE_Y}
              r={CIRCLE_RADIUS}
              stroke="#f3f4f6"
              strokeWidth={12}
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <AnimatedCircle
              cx={CIRCLE_X}
              cy={CIRCLE_Y}
              r={CIRCLE_RADIUS}
              stroke="#f472b6"
              strokeWidth={12}
              strokeDasharray={CIRCLE_LENGTH}
              animatedProps={animatedProps}
              strokeLinecap="round"
              rotation="-90"
              origin={`${CIRCLE_X}, ${CIRCLE_Y}`}
              fill="transparent"
            />
          </Svg>
          {/* Exercise Image Centered in Circle */}
          {currentExercise.imageUrl && (
            <Image
              source={{ uri: currentExercise.imageUrl }}
              style={{
                width: CIRCLE_SIZE * 0.6,
                height: CIRCLE_SIZE * 0.6,
                resizeMode: 'cover',
                borderRadius: (CIRCLE_SIZE * 0.6) / 2,
                backgroundColor: '#FDF6E3', // Optional: soft background
              }}
            />
          )}
        </View>
        {/* Exercise Details and Timer BELOW the circle */}
        <View className="w-full items-center px-8">
          <Text className="text-xl font-inter-bold mb-2 text-center">
            {currentExercise.name}
          </Text>
          {workoutId !== Number(cooldownWorkoutId) && (
            <>
              <Text className="text-gray-600 text-center text-sm mb-4">
                {currentExercise.sets} sets × {currentExercise.reps} reps
              </Text>
              <Text className="text-gray-600 text-center text-sm mb-8">
                {currentExercise.restSeconds}s rest between sets
              </Text>
            </>
          )}
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