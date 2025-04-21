import React, { useState } from 'react'
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { AntDesign, Ionicons } from '@expo/vector-icons'
import { ProgressRing, StyledButton } from '@/components/core' // Reusing ProgressRing

// Reusable Week Tab
const WeekTab = ({
  week,
  isActive,
  onPress
}: {
  week: number
  isActive: boolean
  onPress: () => void
}) => (
  <Pressable
    className={`rounded-full ${isActive ? '' : 'bg-transparent'}`} // Active handled by gradient
    onPress={onPress}
  >
    {isActive ? (
      <LinearGradient
        colors={['#FF9A9E', '#FAD0C4']}
        style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 }}
      >
        <Text className="font-inter-medium text-xs text-white">
          Week {week}
        </Text>
      </LinearGradient>
    ) : (
      <Text className="px-4 py-2 font-inter-medium text-xs text-black">
        Week {week}
      </Text>
    )}
  </Pressable>
)

// Reusable Measurement Card
const MeasurementCard = ({
  label,
  value,
  change
}: {
  label: string
  value: string
  change: string
}) => (
  <View className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
    <Text className="mb-1 font-inter text-xs text-black">{label}</Text>
    <View className="flex-row items-end justify-between">
      <Text className="font-inter-bold text-xl text-black">{value}</Text>
      {/* Conditional styling for change */}
      <Text
        className={`text-xs ${change.startsWith('-') ? 'text-green-500' : change.startsWith('+') ? 'text-red-500' : 'text-gray-500'}`}
      >
        {change.startsWith('-') || change.startsWith('+') ? change : ''}{' '}
        {/* Show sign only if present */}
      </Text>
    </View>
  </View>
)

// Reusable Weekly Photo Item
const WeeklyPhoto = ({
  week,
  imageUrl,
  onAdd
}: {
  week: number | string
  imageUrl?: string
  onAdd?: () => void
}) => (
  <View className="items-center">
    <Pressable
      className="mb-2 h-32 w-24 overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-100"
      onPress={!imageUrl ? onAdd : undefined}
      disabled={!!imageUrl}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />
      ) : (
        <View className="flex-1 items-center justify-center border-dashed border-gray-300">
          <Ionicons
            name="add-outline"
            size={24}
            color="rgb(156 163 175)" /* gray-400 */
          />
        </View>
      )}
    </Pressable>
    <Text className="font-inter text-xs text-black">
      {typeof week === 'number' ? `Week ${week}` : week}
    </Text>
  </View>
)

export default function ProgressTrackerScreen() {
  const router = useRouter()
  const [activeWeek, setActiveWeek] = useState(1) // Week 1 active initially
  const totalWeeks = 8
  const overallProgress = 0.25 // Example 25%

  // Mock data for Week 1 (replace with actual data fetching based on activeWeek)
  const measurements = [
    { label: 'Waist', value: '28.5"', change: '-0.5"' },
    { label: 'Hips', value: '38"', change: '-0.25"' },
    { label: 'Thighs', value: '22"', change: '-0.5"' },
    { label: 'Weight', value: '132 lbs', change: '-3 lbs' }
  ]
  const photos = [
    {
      week: 'Start',
      imageUrl:
        'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
    },
    {
      week: 1,
      imageUrl:
        'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
    },
    { week: 2, imageUrl: undefined } // Placeholder for add
  ]

  const handleUpdateMeasurements = () => {
    console.log('Update measurements')
    // Navigate to measurement update screen
  }

  const handleTakePhoto = () => {
    console.log('Take photo')
    // Navigate to camera screen
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* Custom Header */}
      <View className="flex-row items-center p-6">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </Pressable>
        <Text className="font-inter-bold text-xl text-black">
          Progress Tracker
        </Text>
      </View>

      {/* Info Section */}
      <LinearGradient
        colors={['#FF9A9E', '#FAD0C4']}
        className="w-full"
        style={{ padding: 20 }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-medium text-sm text-white">
              Week {activeWeek + 1} of {totalWeeks}
            </Text>
            <Text className="font-inter-bold text-2xl text-white">
              {Math.round(overallProgress * 100)}% Complete
            </Text>
          </View>
          <ProgressRing
            size={60}
            strokeWidth={8}
            progress={overallProgress}
            bgColor="rgba(255, 255, 255, 0.3)"
            progressColor="white"
            showPercentage={false} // Percentage text is already shown
          />
        </View>
      </LinearGradient>

      {/* Week Tabs */}
      <View className="border-b border-gray-100 p-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8 }}
          contentContainerClassName="w-full"
        >
          <View className="flex grow flex-row items-center justify-around gap-x-2">
            {/* Generate tabs up to current week or total weeks */}
            {Array.from({ length: 4 }).map(
              (
                _,
                index // Example: show first 4 weeks
              ) => (
                <WeekTab
                  key={index}
                  week={index + 1}
                  isActive={index === activeWeek}
                  onPress={() => setActiveWeek(index)}
                />
              )
            )}
            {/* Add more tabs if needed */}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Measurements */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="font-inter-medium text-black">
            Body Measurements
          </Text>
          <Pressable
            className="flex-row items-center"
            onPress={handleUpdateMeasurements}
          >
            <AntDesign name="edit" size={16} color="black" className="mr-1" />
            <Text className="font-inter-medium text-sm text-black">Update</Text>
          </Pressable>
        </View>
        <View className="mb-8 grid grid-cols-2 gap-4">
          {/* Simulate grid */}
          <View className="flex-row justify-between gap-4">
            <View className="flex-1">
              <MeasurementCard {...measurements[0]} />
            </View>
            <View className="flex-1">
              <MeasurementCard {...measurements[1]} />
            </View>
          </View>
          <View className="mt-4 flex-row justify-between gap-4">
            <View className="flex-1">
              <MeasurementCard {...measurements[2]} />
            </View>
            <View className="flex-1">
              <MeasurementCard {...measurements[3]} />
            </View>
          </View>
        </View>

        {/* Weekly Photos */}
        <Text className="mb-4 font-inter-medium text-black">Weekly Photos</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          <View className="flex-row gap-x-4">
            {photos.map((photo, index) => (
              <WeeklyPhoto key={index} {...photo} onAdd={handleTakePhoto} />
            ))}
            {/* Add more placeholders if needed */}
          </View>
        </ScrollView>

        {/* Encouragement Card */}
        <View className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <View className="flex-row items-center">
            <View className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
              <Ionicons name="trophy-outline" size={20} color="black" />
            </View>
            <View className="flex-1">
              <Text className="font-inter-medium text-black">
                You're doing great!
              </Text>
              <Text className="font-inter text-xs text-black">
                You're on track to reach your goal by July 15.
              </Text>
            </View>
          </View>
        </View>

        {/* Padding at bottom */}
        <View className="h-6" />
      </ScrollView>

      {/* Footer Button */}
      <View className="border-t border-gray-100 p-6">
        <StyledButton
          title="Take This Week's Photo"
          onPress={handleTakePhoto}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  )
}
