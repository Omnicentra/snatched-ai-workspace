import React, { useState } from 'react'
import { View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { StyledButton } from '@/components/core'
import { LinearGradient } from 'expo-linear-gradient'

// Day Pill Component
const DayPill = ({
  dayLetter,
  dayNumber,
  isActive,
  onPress
}: {
  dayLetter: string
  dayNumber: string | number
  isActive: boolean
  onPress: () => void
}) => (
  <Pressable className="items-center" onPress={onPress}>
    {isActive ? (
      <LinearGradient
        colors={['#f472b6', '#F6ADCE']}
        style={{
          borderRadius: 100,
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 4
        }}
      >
        <Text className="font-inter-medium text-sm text-white">
          {dayLetter}
        </Text>
      </LinearGradient>
    ) : (
      <View className="mb-1 h-10 w-10 items-center justify-center rounded-full border border-gray-200">
        <Text className="font-inter-medium text-sm text-gray-400">
          {dayLetter}
        </Text>
      </View>
    )}
    <Text className={`font-inter text-xs ${isActive ? 'text-pink-500' : 'text-gray-400'}`}>
      {dayNumber}
    </Text>
  </Pressable>
)

// Progress Summary Card
const ProgressSummaryCard = () => {
  return (
    <View className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
      <Text className="mb-4 font-inter-bold text-lg text-black">Today's Progress</Text>
      <View className="flex-row justify-between">
        <View className="items-center">
          <Text className="font-inter-bold text-2xl text-black">1,918</Text>
          <Text className="font-inter text-xs text-gray-500">Cal Left</Text>
        </View>
        <View className="items-center">
          <Text className="font-inter-bold text-2xl text-green-500">+320</Text>
          <Text className="font-inter text-xs text-gray-500">Cal Burned</Text>
        </View>
        <View className="items-center">
          <Text className="font-inter-bold text-2xl text-pink-500">-580</Text>
          <Text className="font-inter text-xs text-gray-500">Cal Eaten</Text>
        </View>
      </View>
    </View>
  )
}

// Plan Item Card Component
const PlanItemCard = ({
  icon,
  title,
  description,
  bgColor = 'bg-pink-100',
  isWorkout = false,
  onPress
}: {
  icon: React.ReactNode
  title: string
  description: string
  bgColor?: string
  isWorkout?: boolean
  onPress?: () => void
}) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <Pressable
      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      onPress={isWorkout ? () => setExpanded(!expanded) : onPress}
    >
      <View className="mb-3 flex-row items-center">
        <View
          className={`mr-4 flex h-10 w-10 items-center justify-center rounded-full ${bgColor}`}
        >
          {icon}
        </View>
        <View className="flex-1">
          <Text className="font-inter-medium text-black">{title}</Text>
          <Text className="font-inter text-xs text-black">{description}</Text>
        </View>
        <Pressable
          className="h-8 w-8 items-center justify-center rounded-full bg-black"
          onPress={onPress}
        >
          {isWorkout ? (
            <Ionicons
              name={expanded ? 'chevron-up' : 'play'}
              size={16}
              color="white"
            />
          ) : (
            <Ionicons name="arrow-forward" size={16} color="white" />
          )}
        </Pressable>
      </View>
      {isWorkout && expanded && (
        <View className="mt-2 gap-y-2 border-t border-gray-100 pl-14 pt-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-black">Dumbbell Bench Press</Text>
            <Text className="text-xs text-black">3 x 12</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-black">Lateral Raise</Text>
            <Text className="text-xs text-black">3 x 15</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-black">+ 4 more exercises</Text>
          </View>
        </View>
      )}
    </Pressable>
  )
}

export default function PlanScreen() {
  const router = useRouter()
  const [activeDayIndex, setActiveDayIndex] = useState(2) // Wednesday active
  const weekDates = [
    { letter: 'M', number: 15 },
    { letter: 'T', number: 16 },
    { letter: 'W', number: 17 },
    { letter: 'T', number: 18 },
    { letter: 'F', number: 19 },
    { letter: 'S', number: 20 },
    { letter: 'S', number: 21 }
  ]

  // Navigation functions
  const goToWorkout = () => router.push('/(modals)/workout-detail')
  const goToNutrition = () => router.push('/(modals)/nutrition')
  const goToSnatchHack = () => router.push('/(modals)/snatch-hack-detail')
  const goToStylingTip = () => router.push('/(modals)/styling-tip-detail')
  const takePhoto = () => router.push('/(modals)/progress-front')

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-6">
        <Text className="font-inter-bold text-xl text-black">Progress</Text>
        <Pressable>
          <Ionicons name="calendar-outline" size={24} color="black" />
        </Pressable>
      </View>

      {/* Week Selector */}
      <View className="px-6 pb-6">
        <View className="flex-row justify-between">
          {weekDates.map((day, index) => (
            <DayPill
              key={index}
              dayLetter={day.letter}
              dayNumber={day.number}
              isActive={index === activeDayIndex}
              onPress={() => setActiveDayIndex(index)}
            />
          ))}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6">
        {/* Progress Summary */}
        <ProgressSummaryCard />

        {/* Snatch Update Card */}
        <View className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-inter-bold text-lg text-black">
              Drop Today's Snatch Update
            </Text>
            <Ionicons name="camera-outline" size={24} color="black" />
          </View>
          <Text className="mb-4 font-inter text-sm text-gray-500">
            Compare with last week to see your progress
          </Text>
          <StyledButton
            title="Take Photo"
            onPress={takePhoto}
            variant="primary"
          />
        </View>

        {/* Daily Plan List */}
        <View className="gap-y-4 pb-6">
          <Text className="mb-2 font-inter-medium text-base text-black">
            Today's Activities
          </Text>
          <PlanItemCard
            icon={
              <MaterialCommunityIcons
                name="heart-pulse"
                size={20}
                color="#F472B6"
              />
            }
            title="💪 Morning Workout"
            description="Full Body Blast • 30 min"
            bgColor="bg-pink-50"
            isWorkout={true}
            onPress={goToWorkout}
          />
          <PlanItemCard
            icon={
              <Ionicons name="restaurant-outline" size={20} color="#34D399" />
            }
            title="🍎 Breakfast"
            description="Oatmeal + Protein Shake • 420 cal"
            bgColor="bg-green-50"
            onPress={goToNutrition}
          />
          <PlanItemCard
            icon={<Ionicons name="sparkles-outline" size={20} color="#A855F7" />}
            title="✨ Snatch Hack"
            description="Morning Debloat Trick • 2 min"
            bgColor="bg-purple-50"
            onPress={goToSnatchHack}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
