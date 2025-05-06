import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  SafeAreaView,
  FlatList
} from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/utils/api'
import type { RouterOutputs } from '@/utils/api'

// Define workout type for better typing
type Workout = RouterOutputs['workout']['getWorkouts'][number]
type WorkoutCategory = RouterOutputs['workout']['getWorkoutCategories'][number]

// Workout Card Component
const WorkoutCard = ({
  title,
  duration,
  description,
  rating,
  imageUrl,
  difficultyLevel,
  id,
  onPress
}: {
  title: string
  duration: string
  description: string
  rating: string
  imageUrl: string
  difficultyLevel: string
  id: number
  onPress: (id: number) => void
}) => (
  <Pressable
    className="mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
    onPress={() => onPress(id)}
  >
    <View className="flex-row">
      <View className="h-24 w-24 bg-gray-100">
        <Image
          source={{ uri: imageUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>
      <View className="flex-1 justify-between p-3">
        <View>
          <Text className="font-inter-bold text-base text-black">{title}</Text>
          <Text className="font-inter text-xs text-gray-500" numberOfLines={2}>
            {description}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text className="ml-1 font-inter text-xs text-gray-500">{duration}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#FACC15" />
            <Text className="ml-1 font-inter text-xs text-gray-500">{rating}</Text>
          </View>
          <View className="rounded-full bg-gray-100 px-2 py-1">
            <Text className="font-inter text-xs capitalize text-gray-500">
              {difficultyLevel}
            </Text>
          </View>
        </View>
      </View>
    </View>
  </Pressable>
)

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
    className={`mr-3 rounded-full px-4 py-2 ${
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

export default function AllWorkoutsScreen() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch workouts using tRPC
  const { data: workoutsData, isLoading: isLoadingWorkouts, refetch, isRefetching } = api.workout.getWorkouts.useQuery()
  
  // Get the categories from API data
  const { data: categoriesData, isLoading: isLoadingCategories } = api.workout.getWorkoutCategories.useQuery()
  
  // Extract categories from data
  const categories = React.useMemo(() => {
    if (!categoriesData) return ['All']
    return ['All', ...categoriesData.map(category => category.name).filter(Boolean)]
  }, [categoriesData])

  // Filter workouts based on active category and search query
  const filteredWorkouts = React.useMemo(() => {
    if (!workoutsData) return []
    
    return workoutsData.filter(workout => {
      // Filter by category
      const matchesCategory = activeCategory === 'All' || !activeCategory || 
        (workout.categoryId && categoriesData?.some(cat => 
          cat.id === workout.categoryId && cat.name === activeCategory))
      
      // Filter by search term
      const matchesSearch = 
        !searchQuery ||
        workout.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (workout.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      return matchesCategory && matchesSearch
    })
  }, [workoutsData, categoriesData, activeCategory, searchQuery])

  // Sort workouts (by newest, rating, etc.) - currently just alphabetical for demonstration
  const sortedWorkouts = React.useMemo(() => {
    return [...filteredWorkouts].sort((a, b) => a.title.localeCompare(b.title))
  }, [filteredWorkouts])

  const navigateToWorkoutDetail = (workoutId: number) => {
    router.push(`/(modals)/workout-detail?workoutId=${workoutId}`)
  }

  const isLoading = isLoadingWorkouts || isLoadingCategories

  return (
    <SafeAreaView style={{ paddingTop: Constants.statusBarHeight }} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 rounded-full bg-gray-100 p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="font-inter-bold text-xl text-black">All Workouts</Text>
        </View>
      </View>

      {/* Search */}
      <View className="border-b border-gray-100 p-4">
        <View className="relative">
          <TextInput
            placeholder="Search workouts..."
            className="rounded-xl bg-gray-100 px-4 py-3 pr-10 text-base text-black"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View className="absolute right-3 top-3">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          </View>
        </View>
      </View>

      {/* Categories */}
      <View className="py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-4"
        >
          {categories.map((cat) => (
            <CategoryPill
              key={cat}
              label={cat}
              isActive={activeCategory === cat || (cat === 'All' && !activeCategory)}
              onPress={() => setActiveCategory(cat === 'All' ? null : cat)}
            />
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
          <Text className="mt-4 font-inter text-gray-500">Loading workouts...</Text>
        </View>
      ) : (
        <View className="flex-1 px-4">
          <View className="flex-row items-center justify-between py-2">
            <Text className="font-inter-medium text-gray-500">
              {sortedWorkouts.length} workouts found
            </Text>
          </View>

          <FlatList
            onRefresh={() => {
              void refetch()
            }}
            refreshing={isRefetching}
            data={sortedWorkouts}
            keyExtractor={(item) => `workout-${item.id}`}
            renderItem={({ item }) => (
              <WorkoutCard
                id={item.id}
                title={item.title}
                duration={`${item.durationMinutes} min`}
                description={item.description ?? ''}
                rating={item.rating ?? '4.5'}
                imageUrl={item.imageUrl ?? 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438'}
                difficultyLevel={item.difficultyLevel}
                onPress={navigateToWorkoutDetail}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Ionicons name="fitness-outline" size={48} color="#D1D5DB" />
                <Text className="mt-2 font-inter-medium text-center text-gray-400">
                  No workouts found
                </Text>
                <Text className="font-inter text-center text-gray-400">
                  Try adjusting your search or filters
                </Text>
              </View>
            }
          />
        </View>
      )}
    </SafeAreaView>
  )
} 