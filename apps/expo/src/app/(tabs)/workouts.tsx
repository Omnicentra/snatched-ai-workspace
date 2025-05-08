// app/(tabs)/workouts.tsx
import { MilestoneModal } from '@/app/(modals)/milestone-modal'
import { StyledButton } from '@/components/core'
import { api, RouterOutputs } from '@/utils/api'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View
} from 'react-native'

type UserWorkoutStats = RouterOutputs['workout']['getUserWorkoutStats']

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
const StatsSummary = ({ stats }: { stats?: UserWorkoutStats }) => {
  if (!stats) {
    return (
      <View className="mb-8 flex-row justify-between rounded-3xl bg-white p-6 shadow-sm">
        <View className="items-center">
          <Text className="font-inter-bold text-2xl text-black">-</Text>
          <Text className="font-inter text-xs text-gray-500">Workouts</Text>
        </View>
        <View className="items-center">
          <Text className="font-inter-bold text-2xl text-green-500">-</Text>
          <Text className="font-inter text-xs text-gray-500">Cal Burned</Text>
        </View>
        <View className="items-center">
          <Text className="font-inter-bold text-2xl text-pink-500">-</Text>
          <Text className="font-inter text-xs text-gray-500">Active Time</Text>
        </View>
      </View>
    )
  }
  
  return (
    <View className="mb-8 flex-row justify-between rounded-3xl bg-white p-6 shadow-sm">
      <View className="items-center">
        <Text className="font-inter-bold text-2xl text-black">{stats.totalWorkouts}</Text>
        <Text className="font-inter text-xs text-gray-500">Workouts</Text>
      </View>
      <View className="items-center">
        <Text className="font-inter-bold text-2xl text-green-500">{Math.round(stats.totalCalories)}</Text>
        <Text className="font-inter text-xs text-gray-500">Cal Burned</Text>
      </View>
      <View className="items-center">
        <Text className="font-inter-bold text-2xl text-pink-500">{stats.totalDuration}m</Text>
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
  id,
  onPress
}: {
  title: string
  duration: string
  description: string
  rating: string
  imageUrl: string
  id: number
  onPress: (id: number) => void
}) => (
  <Pressable
    className="mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
    onPress={() => onPress(id)}
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
            {rating}
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
  id,
  onPress
}: {
  title: string
  description: string
  imageUrl: string
  id: number
  onPress: (id: number) => void
}) => (
  <Pressable
    className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
    onPress={() => onPress(id)}
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, _] = useState('')
  const [showMilestone, setShowMilestone] = useState(false)
  const { data: stats } = api.workout.getUserWorkoutStats.useQuery({
    period: "week"
  });
  
  // Fetch workouts using tRPC
  const { data: workoutsData, isLoading, isRefetching, refetch } = api.workout.getWorkouts.useQuery()
  
  // Get the categories from API data
  const { data: categoriesData } = api.workout.getWorkoutCategories.useQuery()
  
  // Set initial active category when categories load
  React.useEffect(() => {
    if (categoriesData?.length && !activeCategory && categoriesData[0]?.name) {
      setActiveCategory(categoriesData[0].name)
    }
  }, [categoriesData, activeCategory])
  
  // Filter workouts based on active category and search query
  const filteredWorkouts = React.useMemo(() => {
    if (!workoutsData) return []
    
    return workoutsData.filter(workout => {
      // Filter by category if one is selected
      const matchesCategory = !activeCategory || 
        (workout.categoryId && categoriesData?.some(cat => 
          cat.id === workout.categoryId && cat.name === activeCategory))
      
      // Filter by search term
      const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (workout.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      return matchesCategory && matchesSearch
    })
  }, [workoutsData, categoriesData, activeCategory, searchQuery])
  
  // Group workouts by difficulty level
  const recommendedWorkouts = React.useMemo(() => {
    return filteredWorkouts
      .filter(workout => workout.difficultyLevel === 'intermediate')
      .slice(0, 3)
  }, [filteredWorkouts])
  
  // Quick workouts are shorter duration workouts
  const quickWorkouts = React.useMemo(() => {
    return filteredWorkouts
      .filter(workout => workout.durationMinutes <= 30)
      .slice(0, 4)
  }, [filteredWorkouts])

  // Extract categories from data
  const categories = React.useMemo(() => {
    if (!categoriesData) return []
    return categoriesData.map(category => category.name).filter(Boolean)
  }, [categoriesData])

  const navigateToWorkoutDetail = (workoutId: number) => {
    router.push(`/(modals)/workout-detail?workoutId=${workoutId}`)
  }
  
  const handleViewAllWorkouts = () => {
    router.push('/(modals)/all-workouts')
  }

  return (
    <LinearGradient
      colors={['#e5e7eb', '#fff']}
      style={{ flexGrow: 1, paddingTop: Constants.statusBarHeight }} 
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
        </View>
      </View>

      {/* Workout Lists */}
      <ScrollView className="flex-1 px-6" refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        {/* Search and Filter */}
        {/* <View className="relative mb-6">
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
        </View> */}

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
        <StatsSummary stats={stats} />

        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#f472b6" />
            <Text className="mt-4 font-inter text-gray-500">Loading workouts...</Text>
          </View>
        ) : (
          <>
            <Text className="mb-4 font-inter-bold text-lg text-black">
              Recommended For You
            </Text>
            <View className="mb-8">
              {recommendedWorkouts.length > 0 ? (
                recommendedWorkouts.map((workout) => (
                  <WorkoutCardLarge
                    key={`rec-${workout.id}`}
                    id={workout.id}
                    title={workout.title}
                    duration={`${workout.durationMinutes} min`}
                    description={workout.description ?? ''}
                    rating={workout.rating ?? '4.5'}
                    imageUrl={workout.imageUrl ?? 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438'}
                    onPress={navigateToWorkoutDetail}
                  />
                ))
              ) : (
                <Text className="text-gray-500 italic py-4">No recommended workouts found</Text>
              )}
            </View>

            <Text className="mb-4 font-inter-bold text-lg text-black">
              Quick Workouts
            </Text>
            <View className="grid grid-cols-2 gap-4 pb-6">
              {quickWorkouts.length > 0 ? (
                quickWorkouts.map((workout) => (
                  <View key={`quick-${workout.id}`} className="flex-1">
                    <WorkoutCardSmall
                      id={workout.id}
                      title={workout.title}
                      description={workout.description ?? ''}
                      imageUrl={workout.imageUrl ?? 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a'}
                      onPress={navigateToWorkoutDetail}
                    />
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 italic py-4">No quick workouts found</Text>
              )}
            </View>
            
            {/* View All Workouts Button */}
            <View className="mb-8 mt-4">
              <StyledButton
                title="View All Workouts"
                onPress={handleViewAllWorkouts}
                variant="secondary"
              />
            </View>
          </>
        )}
      </ScrollView>

      <MilestoneModal
        isVisible={showMilestone}
        onClose={() => setShowMilestone(false)}
        type="workout"
      />
    </LinearGradient>
  )
}
