import { StyledButton } from '@/components/core'
import { cooldownWorkoutId } from '@/lib/utils'
import { api } from '@/utils/api'
import { MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Pressable, SafeAreaView, Text, View } from 'react-native'
import Share from 'react-native-share'

interface WorkoutStats {
  minutes: number
  calories: number
  moves: number
  streak?: number
}

export default function WorkoutCompleteScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [saveInProgress, setSaveInProgress] = useState(false)
  
  // Get parameters from URL
  const workoutId = typeof params.workoutId === 'string' ? parseInt(params.workoutId, 10) : undefined
  const workoutTitle = params.workoutTitle as string || 'Workout'
  
  // Check if this is a cooldown workout
  const isCooldownWorkout = workoutId === Number(cooldownWorkoutId)
  
  // Get workout stats from parameters or use defaults
  const stats: WorkoutStats = {
    minutes: typeof params.duration === 'string' ? parseInt(params.duration, 10) : 30,
    calories: typeof params.calories === 'string' ? parseInt(params.calories, 10) : 250,
    moves: typeof params.moves === 'string' ? parseInt(params.moves, 10) : 6,
    streak: 1 // Hardcoded for now, would come from user progress data
  }

  // Mutations
  const trackProgressMutation = api.workout.trackWorkoutProgress.useMutation()
  
  const handleStartCooldown = () => {
    // Navigate to cooldown workout using the cooldownWorkoutId
    router.push({
      pathname: '/(modals)/workout-start',
      params: {
        workoutId: cooldownWorkoutId
      }
    })
  }

  const handleFinishWorkout = () => {
    if (!workoutId) return
    // Success - go back to workouts screen
    router.replace('/(tabs)/workouts')
  }

  const handleSaveProgress = async () => {
    if (!workoutId) return

    try {
      setSaveInProgress(true)
      
      // Track workout progress in the database
      await trackProgressMutation.mutateAsync({
        workoutId,
        durationMinutes: stats.minutes,
        caloriesBurned: stats.calories
      })
      
      // Success - go back to workouts screen
      router.replace('/(tabs)/workouts')
    } catch (error) {
      console.error('Failed to save workout progress:', error)
    } finally {
      setSaveInProgress(false)
    }
  }

  const handleShareProgress = async () => {
    try {
      const message = `🏋️‍♀️ Just completed ${workoutTitle}!\n\n` +
        `💪 ${stats.minutes} minutes\n` +
        `🔥 ${stats.calories} calories burned\n` +
        `🎯 ${stats.moves} exercises completed\n` +
        `🔄 ${stats.streak} day streak\n\n` +
        `💪 Join me on my fitness journey with Snatched AI!`

      await Share.open({
        message,
        title: 'Share Workout Progress',
      })
    } catch (error) {
      console.error('Error sharing progress:', error)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center px-6">
        {/* Trophy Icon */}
        <View className="mt-12 h-24 w-24 items-center justify-center rounded-full bg-pink-100">
          <SimpleLineIcons name="trophy" size={40} color="black" />
        </View>

        {/* Completion Text */}
        <Text className="mt-6 text-center font-inter-bold text-3xl">
          Workout Complete!
        </Text>
        <Text className="mt-2 text-center text-base text-gray-600">
          You just got 1 rep closer to your dream shape.
        </Text>

        {/* Stats Card */}
        <View className="mt-8 w-full rounded-3xl bg-gray-50 p-6">
          <Text className="mb-4 text-center font-inter-bold text-xl">
            {workoutTitle}
          </Text>

          {/* Stats Grid */}
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="font-inter-bold text-2xl">{stats.minutes}</Text>
              <Text className="text-sm text-gray-600">minutes</Text>
            </View>
            <View className="items-center">
              <Text className="font-inter-bold text-2xl">{stats.calories}</Text>
              <Text className="text-sm text-gray-600">calories</Text>
            </View>
            <View className="items-center">
              <Text className="font-inter-bold text-2xl">{stats.moves}</Text>
              <Text className="text-sm text-gray-600">moves</Text>
            </View>
          </View>

          {/* Streak */}
          <View className="mt-6 flex-row items-center">
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-pink-100">
              <MaterialCommunityIcons name="fire" size={24} color="black" />
            </View>
            <View>
              <Text className="font-inter-medium text-base">
                You're on fire!
              </Text>
              <Text className="text-sm text-gray-600">
                {stats.streak} day streak
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-auto w-full gap-y-4 pb-8">
          {isCooldownWorkout ? (
            <StyledButton
              title={saveInProgress ? "Finishing..." : "Finish Workout"}
              onPress={handleFinishWorkout}
              variant="primary"
              disabled={saveInProgress}
            />
          ) : (
            <StyledButton
              title="Start Cooldown"
              onPress={handleStartCooldown}
              variant="primary"
            />
          )}
          {!isCooldownWorkout && (
            <StyledButton
              title={saveInProgress ? "Saving..." : "Save Progress"}
              onPress={handleSaveProgress}
              variant="secondary"
              disabled={saveInProgress}
            />
          )}
          {saveInProgress && (
            <ActivityIndicator size="small" color="#9CA3AF" className="mt-2" />
          )}
          <Pressable
            onPress={handleShareProgress}
            className="flex-row items-center justify-center gap-x-2 rounded-full border border-gray-200 bg-white py-4"
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={20}
              color="black"
            />
            <Text className="font-inter-medium">Share My Progress</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
