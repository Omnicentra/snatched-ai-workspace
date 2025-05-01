import React, { useState, useEffect } from 'react'
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import Constants from 'expo-constants'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { StyledButton } from '@/components/core'
import { api } from '@/utils/api'
import type { RouterOutputs } from '@/utils/api'

// Types
type WorkoutWithExercises = RouterOutputs['workout']['getWorkoutWithExercises']
type _WorkoutExercise = WorkoutWithExercises['exercises'][number]

// Reusable Exercise Card
const ExerciseCard = ({
  name,
  setsReps,
  target,
  rest,
  imageUrl,
  onPlay
}: {
  name: string
  setsReps: string
  target: string
  rest: string
  imageUrl: string
  onPlay: () => void
}) => (
  <View className="mb-4 overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
    <View className="mb-3 flex-row items-center">
      <View className="mr-4 h-16 w-16 overflow-hidden rounded-xl">
        <Image
          source={{ uri: imageUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>
      <View className="flex-1">
        <Text className="font-inter-semibold text-base text-gray-900">{name}</Text>
        <Text className="font-inter text-sm text-gray-500">{setsReps}</Text>
      </View>
      <Pressable
        className="h-10 w-10 items-center justify-center rounded-full bg-[#f472b6]15"
        onPress={onPlay}
      >
        <Ionicons name="play" size={20} color="#f472b6" />
      </Pressable>
    </View>
    {/* Details */}
    <View className="gap-y-1.5 pl-20">
      <View className="flex-row items-center">
        <MaterialCommunityIcons name="target" size={16} color="#9CA3AF" />
        <Text className="ml-2 font-inter text-sm text-gray-500">{target}</Text>
      </View>
      <View className="flex-row items-center">
        <MaterialCommunityIcons name="clock-outline" size={16} color="#9CA3AF" />
        <Text className="ml-2 font-inter text-sm text-gray-500">{rest}</Text>
      </View>
    </View>
  </View>
)

export default function WorkoutDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const workoutId = typeof params.workoutId === 'string' ? parseInt(params.workoutId, 10) : undefined
  const [isLoading, setIsLoading] = useState(true)

  // Get workout details with exercises
  const { data: workoutWithExercises, isLoading: isLoadingWorkout } = 
    api.workout.getWorkoutWithExercises.useQuery(
      { workoutId: workoutId ?? 0 },
      { enabled: !!workoutId && !isNaN(workoutId) }
    )
  
  // Update loading state when data changes
  useEffect(() => {
    setIsLoading(isLoadingWorkout)
  }, [isLoadingWorkout])

  const handlePlayWorkout = () => {
    if (!workoutWithExercises) return;
    
    router.push({
      pathname: '/(modals)/workout-start',
      params: {
        workoutId: workoutId?.toString(),
        workoutTitle: workoutWithExercises.title,
        totalExercises: workoutWithExercises.exercises.length.toString(),
        duration: workoutWithExercises.durationMinutes.toString(),
        categoryId: workoutWithExercises.categoryId?.toString() ?? '',
        difficultyLevel: workoutWithExercises.difficultyLevel,
      }
    });
  }

  const handlePlayVideo = (exerciseName: string) => {
    if (!workoutWithExercises) return;
    
    router.push({
      pathname: '/(modals)/workout-start',
      params: {
        workoutId: workoutId?.toString(),
        workoutTitle: workoutWithExercises.title,
        exerciseName,
        totalExercises: workoutWithExercises.exercises.length.toString(),
        duration: workoutWithExercises.durationMinutes.toString(),
      }
    });
  }

  const handleMarkComplete = () => {
    if (!workoutWithExercises) return;
    
    router.push({
      pathname: '/(modals)/workout-complete',
      params: {
        workoutId: workoutId?.toString(),
        workoutTitle: workoutWithExercises.title,
        duration: workoutWithExercises.durationMinutes.toString(),
        calories: workoutWithExercises.caloriesBurn?.toString() ?? '250',
        moves: workoutWithExercises.exercises.length.toString(),
      }
    });
  }

  // Format difficulty level for display
  const formatDifficulty = (level: string) => {
    if (!level) return 'Medium'
    
    switch (level.toLowerCase()) {
      case 'beginner': return 'Beginner'
      case 'intermediate': return 'Medium'
      case 'advanced': return 'Advanced'
      default: return level
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView 
        style={{ paddingTop: Constants.statusBarHeight }}
        className="flex-1 bg-white items-center justify-center"
      >
        <Text className="font-inter text-gray-500">Loading workout details...</Text>
      </SafeAreaView>
    )
  }

  if (!workoutWithExercises) {
    return (
      <SafeAreaView 
        style={{ paddingTop: Constants.statusBarHeight }}
        className="flex-1 bg-white items-center justify-center"
      >
        <Text className="font-inter text-gray-500">Workout not found</Text>
        <StyledButton
          title="Go Back"
          onPress={() => router.back()}
          variant="secondary"
          className="mt-4"
        />
      </SafeAreaView>
    )
  }

  // Prepare data
  const workout = workoutWithExercises
  const exercises = workoutWithExercises.exercises
  
  // Format date for display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  return (
    <SafeAreaView 
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-6">
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()} 
            className="mr-4 rounded-full bg-gray-100 p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="font-inter-bold text-2xl text-black">
            {workout.title}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6">
        {/* Workout Info */}
        <View className="mb-8 mt-6 flex-row items-center justify-between">
          <View>
            <Text className="font-inter-medium text-sm text-gray-500">
              {formattedDate}
            </Text>
            <Text className="font-inter-bold text-2xl text-gray-900">
              {workout.durationMinutes} min workout
            </Text>
          </View>
          <Pressable
            className="h-14 w-14 items-center justify-center rounded-full bg-[#f472b6]"
            onPress={handlePlayWorkout}
          >
            <Ionicons name="play" size={28} color="white" style={{ marginLeft: 2 }} />
          </Pressable>
        </View>

        {/* Stats */}
        <View className="mb-8 flex-row justify-between">
          <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm mr-3">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#f472b6]15">
                <MaterialCommunityIcons name="fire" size={20} color="#f472b6" />
              </View>
              <View>
                <Text className="font-inter text-xs text-gray-500">
                  Estimated calories
                </Text>
                <Text className="font-inter-bold text-lg text-gray-900">
                  {workout.caloriesBurn ?? '250-300'}
                  <Text className="font-inter-medium text-sm text-gray-500"> kcal</Text>
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-1 rounded-2xl bg-white p-4 shadow-sm">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#f472b6]15">
                <MaterialCommunityIcons name="heart-pulse" size={20} color="#f472b6" />
              </View>
              <View>
                <Text className="font-inter text-xs text-gray-500">
                  Intensity
                </Text>
                <Text className="font-inter-bold text-lg text-gray-900">
                  {formatDifficulty(workout.difficultyLevel)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Exercise List */}
        <Text className="mb-4 font-inter-bold text-lg text-black">
          Exercises ({exercises.length})
        </Text>
        <View>
          {exercises.length > 0 ? (
            exercises.map((ex, index) => (
              <ExerciseCard
                key={index}
                name={ex.name}
                setsReps={`${ex.sets} sets × ${ex.reps} reps`}
                target={ex.targetMuscles ?? 'Various muscle groups'}
                rest={`${ex.restSeconds} seconds between sets`}
                imageUrl={ex.imageUrl ?? 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438'}
                onPlay={() => handlePlayVideo(ex.name)}
              />
            ))
          ) : (
            <Text className="text-center py-4 text-gray-500 italic">
              No exercises found for this workout
            </Text>
          )}
        </View>
        <View className="h-6" />
      </ScrollView>

      {/* Footer Button */}
      <View 
        className="bg-white pt-6 px-6"
      >
        <StyledButton
          title="Mark as Completed"
          onPress={handleMarkComplete}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  )
}
