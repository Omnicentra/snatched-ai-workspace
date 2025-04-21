import React from 'react'
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Platform
} from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { StyledButton } from '@/components/core'

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

// Mock data
const exercises = [
  {
    name: 'Dumbbell Bench Press',
    setsReps: '3 sets × 12 reps',
    target: 'Chest, shoulders, triceps',
    rest: '60 seconds between sets',
    imageUrl:
      'https://images.unsplash.com/photo-1571019113664-8a70d82d31d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Lateral Raise',
    setsReps: '3 sets × 15 reps',
    target: 'Shoulders, upper back',
    rest: '45 seconds between sets',
    imageUrl:
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Squat',
    setsReps: '3 sets × 15 reps',
    target: 'Glutes, quads, hamstrings',
    rest: '60 seconds between sets',
    imageUrl:
      'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Glute Bridge',
    setsReps: '3 sets × 20 reps',
    target: 'Glutes, lower back',
    rest: '45 seconds between sets',
    imageUrl:
      'https://images.unsplash.com/photo-1571019113664-8a70d82d31d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
  }
]

export default function WorkoutDetailScreen() {
  const router = useRouter()

  const handlePlayWorkout = () => {
    router.push('/(modals)/workout-start')
  }

  const handlePlayVideo = (exerciseName: string) => {
    router.push('/(modals)/workout-start')
  }

  const handleMarkComplete = () => {
    console.log('Workout marked complete')
    router.back()
  }

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
            Full Body Blast
          </Text>
        </View>
        <Pressable
          className="rounded-full bg-gray-100 p-2"
          onPress={() => console.log('Options')}
        >
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="#374151" />
        </Pressable>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6">
        {/* Workout Info */}
        <View className="mb-8 mt-6 flex-row items-center justify-between">
          <View>
            <Text className="font-inter-medium text-sm text-gray-500">
              Wednesday, May 17
            </Text>
            <Text className="font-inter-bold text-2xl text-gray-900">
              30 min workout
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
                  250-300
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
                  Medium
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Exercise List */}
        <Text className="mb-4 font-inter-bold text-lg text-black">Exercises</Text>
        <View>
          {exercises.map((ex, index) => (
            <ExerciseCard
              key={index}
              {...ex}
              onPlay={() => handlePlayVideo(ex.name)}
            />
          ))}
        </View>
        <View className="h-6" />
      </ScrollView>

      {/* Footer Button */}
      <View 
        className="border-t border-gray-100 bg-white p-6"
        style={{
          paddingBottom: Platform.OS === 'ios' ? 34 : 24
        }}
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
