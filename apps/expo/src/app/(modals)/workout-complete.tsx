import { StyledButton } from '@/components/core'
import { MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { Pressable, Text, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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
  const _workoutId = typeof params.workoutId === 'string' ? parseInt(params.workoutId, 10) : undefined
  const workoutTitle = params.workoutTitle as string || 'Workout'
  
  // Get workout stats from parameters or use defaults
  const stats: WorkoutStats = {
    minutes: typeof params.duration === 'string' ? parseInt(params.duration, 10) : 30,
    calories: typeof params.calories === 'string' ? parseInt(params.calories, 10) : 250,
    moves: typeof params.moves === 'string' ? parseInt(params.moves, 10) : 6,
    streak: 1 // Hardcoded for now, would come from user progress data
  }
  
  const handleStartCooldown = () => {
    // Navigate to cooldown workout
    router.push('/(modals)/workout-start')
  }

  const handleSaveProgress = async () => {
    try {
      setSaveInProgress(true)
      
      // Simulate API delay for saving workout progress
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Success - go back to workouts screen
      router.push('/(tabs)/workouts')
    } catch (error) {
      console.error('Failed to save workout progress:', error)
    } finally {
      setSaveInProgress(false)
    }
  }

  const handleShareProgress = () => {
    // Share progress logic would go here
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
          <StyledButton
            title="Start Cooldown"
            onPress={handleStartCooldown}
            variant="primary"
          />
          <StyledButton
            title={saveInProgress ? "Saving..." : "Save Progress"}
            onPress={handleSaveProgress}
            variant="secondary"
            disabled={saveInProgress}
          />
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
