// app/(tabs)/workouts.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  Image
} from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { MilestoneModal } from '@/components/MilestoneModal'

// Milestone Progress Component
const MilestoneProgress = ({
  level,
  currentDay,
  totalDays,
  emoji
}: {
  level: number
  currentDay: number
  totalDays: number
  emoji: string
}) => {
  const days = Array.from({ length: totalDays }, (_, i) => i + 1)
  const midPoint = Math.floor(days.length / 2)
  const firstRow = days.slice(0, midPoint)
  const secondRow = days.slice(midPoint).reverse()

  const renderDay = (day: number, isReversed: boolean = false) => {
    const isCompleted = day < currentDay
    const isActive = day === currentDay
    const position = isReversed ? 'bottom' : 'top'

    return (
      <View key={day} className="items-center">
        <View 
          className={`h-12 w-12 items-center justify-center rounded-full ${
            isActive ? 'border-2 border-dashed border-[#9333EA] bg-white' :
            isCompleted ? 'bg-[#9333EA]' : 'bg-white border border-gray-100'
          }`}
        >
          {isCompleted && day === 1 && (
            <Text className="text-lg">{emoji}</Text>
          )}
          {isCompleted && day === totalDays && (
            <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
          )}
          {!isCompleted && !isActive && (
            <Text className="font-inter-medium text-xs text-gray-400">
              {day}
            </Text>
          )}
          {isActive && (
            <Text className="text-lg">{emoji}</Text>
          )}
        </View>
        {day !== (isReversed ? secondRow[0] : firstRow[firstRow.length - 1]) && (
          <View 
            className={`absolute h-0.5 w-10 ${
              isCompleted ? 'bg-[#9333EA]' : 'bg-gray-100'
            } ${position === 'top' ? 'top-6' : 'bottom-6'} ${
              isReversed ? 'right-6' : 'left-6'
            }`} 
          />
        )}
      </View>
    )
  }

  return (
    <View className="mb-6 rounded-2xl bg-purple-50/50 p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="font-inter-medium text-sm text-gray-600">
          Level {level} {emoji}
        </Text>
        <Text className="font-inter text-xs text-gray-400">
          {currentDay}/{totalDays} days
        </Text>
      </View>
      <View className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
        <View 
          className="h-full bg-[#9333EA]" 
          style={{ width: `${(currentDay / totalDays) * 100}%` }}
        />
      </View>
      <View className="mt-4">
        <View className="flex-row justify-between">
          {firstRow.map((day) => renderDay(day))}
        </View>
        <View className="mt-3 flex-row justify-between">
          {secondRow.map((day) => renderDay(day, true))}
        </View>
      </View>
    </View>
  )
}

// Category Pill Component
const CategoryPill = ({
  label,
  isActive,
  onPress
}: {
  label: string
  isActive: boolean
  onPress: () => void
}) => (
  <Pressable
    className={`mr-3 rounded-full px-4 py-2.5 ${
      isActive ? 'bg-black' : 'border border-gray-200'
    }`}
    onPress={onPress}
  >
    <Text
      className={`font-inter-medium text-sm ${
        isActive ? 'text-white' : 'text-gray-500'
      }`}
    >
      {label}
    </Text>
  </Pressable>
)

// Stats Summary Component
const StatsSummary = () => {
  return (
    <View className="mb-8 flex-row justify-between rounded-3xl bg-white p-6 shadow-sm">
      <View className="items-center">
        <Text className="font-inter-bold text-2xl text-black">12</Text>
        <Text className="font-inter text-xs text-gray-500">Workouts</Text>
      </View>
      <View className="items-center">
        <Text className="font-inter-bold text-2xl text-green-500">320</Text>
        <Text className="font-inter text-xs text-gray-500">Cal Burned</Text>
      </View>
      <View className="items-center">
        <Text className="font-inter-bold text-2xl text-pink-500">45m</Text>
        <Text className="font-inter text-xs text-gray-500">Active Time</Text>
      </View>
    </View>
  )
}

// Workout Card Component (Large for Recommended)
const WorkoutCardLarge = ({
  title,
  duration,
  description,
  rating,
  imageUrl,
  onPress
}: {
  title: string
  duration: string
  description: string
  rating: number
  imageUrl: string
  onPress: () => void
}) => (
  <Pressable
    className="mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
    onPress={onPress}
  >
    <View className="h-48 w-full bg-gray-100">
      <Image
        source={{ uri: imageUrl }}
        className="h-full w-full"
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'transparent']}
        className="absolute inset-x-0 top-0 h-24"
      />
      <View className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1.5">
        <Text className="font-inter-medium text-sm text-white">{duration}</Text>
      </View>
    </View>
    <View className="p-4">
      <View className="mb-2 flex-row items-start justify-between">
        <Text className="flex-1 font-inter-bold text-lg text-black">{title}</Text>
        <View className="flex-row items-center">
          <Ionicons name="star" size={16} color="#FACC15" />
          <Text className="ml-1 font-inter-medium text-sm text-black">
            {rating.toFixed(1)}
          </Text>
        </View>
      </View>
      <Text className="font-inter text-sm text-gray-500">{description}</Text>
    </View>
  </Pressable>
)

// Workout Card Component (Small for Quick Workouts)
const WorkoutCardSmall = ({
  title,
  description,
  imageUrl,
  onPress
}: {
  title: string
  description: string
  imageUrl: string
  onPress: () => void
}) => (
  <Pressable
    className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
    onPress={onPress}
  >
    <View className="h-32 bg-gray-100">
      <Image
        source={{ uri: imageUrl }}
        className="h-full w-full"
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent']}
        className="absolute inset-x-0 top-0 h-16"
      />
    </View>
    <View className="p-4">
      <Text className="mb-1 font-inter-bold text-base text-black">{title}</Text>
      <Text className="font-inter text-sm text-gray-500">{description}</Text>
    </View>
  </Pressable>
)

export default function WorkoutLibraryScreen() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMilestone, setShowMilestone] = useState(false)

  const categories = [
    'All',
    'Full Body',
    'Lower Body',
    'Upper Body',
    'Core',
    'HIIT'
  ]

  // Mock data - filter based on activeCategory and searchQuery in real app
  const recommendedWorkouts = [
    {
      title: 'Full Body Blast',
      duration: '30 min',
      description: 'Complete workout targeting all major muscle groups',
      rating: 4.5,
      imageUrl:
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Booty Builder',
      duration: '25 min',
      description: 'Focused glute workout for shape and strength',
      rating: 4.9,
      imageUrl:
        'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Waist Snatched',
      duration: '20 min',
      description: 'Core-focused workout for a defined waistline',
      rating: 4.0,
      imageUrl:
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  ]

  const quickWorkouts = [
    {
      title: '10 Min Express',
      description: 'Quick full body workout',
      imageUrl:
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      title: '15 Min Burn',
      description: 'High-intensity cardio',
      imageUrl:
        'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  ]

  const navigateToWorkoutDetail = (workoutId: string) => {
    router.push(`/(modals)/workout-detail?workoutId=${workoutId}`)
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-6">
        <Text className="font-inter-bold text-2xl text-black">Workouts</Text>
        <View className="flex-row gap-2">
          <Pressable 
            className="rounded-full bg-gray-100 p-2"
            onPress={() => setShowMilestone(true)}
          >
            <MaterialCommunityIcons name="trophy-outline" size={24} color="#f472b6" />
          </Pressable>
          <Pressable className="rounded-full bg-gray-100 p-2">
            <Ionicons name="options-outline" size={24} color="black" />
          </Pressable>
        </View>
      </View>

      {/* Workout Lists */}
      <ScrollView className="flex-1 px-6">
        {/* Search and Filter */}
        <View className="relative mb-6">
          <TextInput
            placeholder="Search workouts..."
            className="rounded-2xl bg-gray-100 px-5 py-4 pr-12 text-base text-black"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View className="absolute right-4 top-4">
            <Ionicons name="search-outline" size={24} color="#9CA3AF" />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          <View className="flex-row py-2">
            {categories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                isActive={activeCategory === cat}
                onPress={() => setActiveCategory(cat)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Stats Summary */}
        <StatsSummary />

        <Text className="mb-4 font-inter-bold text-lg text-black">
          Recommended For You
        </Text>
        <View className="mb-8">
          {recommendedWorkouts.map((workout, index) => (
            <WorkoutCardLarge
              key={`rec-${index}`}
              {...workout}
              onPress={() => navigateToWorkoutDetail(workout.title)}
            />
          ))}
        </View>

        <Text className="mb-4 font-inter-bold text-lg text-black">
          Quick Workouts
        </Text>
        <View className="grid grid-cols-2 gap-4 pb-6">
          {quickWorkouts.map((workout, index) => (
            <View key={`quick-${index}`} className="flex-1">
              <WorkoutCardSmall
                {...workout}
                onPress={() => navigateToWorkoutDetail(workout.title)}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <MilestoneModal
        isVisible={showMilestone}
        onClose={() => setShowMilestone(false)}
        currentDay={1}
        totalDays={7}
        emoji="💪"
        accentColor="#f472b6"
        bgColor="#FDF2F8"
      />
    </SafeAreaView>
  )
}
