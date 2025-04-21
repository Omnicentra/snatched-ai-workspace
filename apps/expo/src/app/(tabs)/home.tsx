import React from 'react'
import { View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { ProgressRing, BubblyLogo } from '@/components/core'
import * as Progress from 'react-native-progress'
import { StatusBar } from 'expo-status-bar'

type IconName = keyof typeof Ionicons.glyphMap

// Simple Bar Chart Component
const WeeklyProgressBarChart = () => {
  const data = [30, 60, 35, 0, 0, 0, 0] // Example percentages
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <View className="h-28 flex-row items-end justify-between px-2">
      {data.map((percentage, index) => (
        <View key={index} className="flex-1 items-center">
          <View className="h-20 w-full flex-col-reverse px-1">
            <View
              className={`w-full rounded-lg ${
                index === 2 ? 'bg-pink-400' : 'bg-gray-100'
              }`}
              style={{ height: `${percentage}%` }}
            />
          </View>
          <Text
            className={`mt-2 text-xs ${
              index === 2 ? 'text-pink-500 font-inter-medium' : 'text-gray-500 font-inter'
            }`}
          >
            {days[index]}
          </Text>
        </View>
      ))}
    </View>
  )
}

// Nutrition Stats Card Component
const NutritionStats = () => {
  const stats: Array<{
    label: string
    value: string
    icon: IconName
  }> = [
    { label: 'Calories left', value: '1918', icon: 'flame-outline' },
    { label: 'Protein left', value: '120g', icon: 'fish-outline' },
    { label: 'Carbs left', value: '239g', icon: 'nutrition-outline' },
    { label: 'Fat left', value: '53g', icon: 'water-outline' }
  ]

  return (
    <View className="mb-8">
      {/* Main Calories Card */}
      <View className="mb-4 rounded-3xl bg-white p-6 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-bold text-4xl text-black">{stats[0].value}</Text>
            <Text className="mt-1 font-inter text-sm text-gray-500">{stats[0].label}</Text>
          </View>
          <View className="relative">
            <ProgressRing
              size={80}
              strokeWidth={6}
              progress={0.65}
              bgColor="#F3F4F6"
              progressColor="#F472B6"
            />
            <View className="absolute inset-0 items-center justify-center">
              <Ionicons name={stats[0].icon} size={32} color="#F472B6" />
            </View>
          </View>
        </View>
      </View>

      {/* Macros Grid */}
      <View className="flex-row justify-between gap-x-4">
        {stats.slice(1).map((stat, index) => {
          const iconColor = index === 0 ? '#EF4444' : // Red for protein
                          index === 1 ? '#F59E0B' : // Orange for carbs
                          '#3B82F6' // Blue for fat
          
          return (
            <View key={index} className="flex-1 rounded-3xl bg-white p-4 shadow-sm">
              <Text className="font-inter-bold text-xl text-black">{stat.value}</Text>
              <Text className="mt-1 font-inter text-xs text-gray-500">{stat.label}</Text>
              <View className="mt-3 items-center">
                <View className="relative h-[50px] w-[50px]">
                  <ProgressRing
                    size={50}
                    strokeWidth={4}
                    progress={0.3 + (index * 0.2)}
                    bgColor="#F3F4F6"
                    progressColor={iconColor}
                  />
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-white/80">
                      <Ionicons 
                        name={stat.icon} 
                        size={18}
                        color={iconColor}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

// Recently Logged Component
const RecentlyLogged = () => {
  return (
    <View className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
      <Text className="mb-4 font-inter-bold text-lg text-black">Recently logged</Text>
      <View className="items-center py-4">
        <Text className="mb-2 font-inter-medium text-base text-black">
          You haven't uploaded any food
        </Text>
        <Text className="mb-4 text-center font-inter text-sm text-gray-500">
          Start tracking today's meals by taking a quick picture.
        </Text>
        <Pressable className="h-14 w-14 items-center justify-center rounded-full bg-black">
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  )
}

export default function HomeScreen() {
  const router = useRouter()
  const userName = 'Suzie'
  const weekProgress = 0.35

  const navigateToWorkout = () => router.push('/(modals)/workout-detail')
  const navigateToSnatchHack = () => router.push('/(modals)/snatch-hack-detail')
  const navigateToProgress = () => router.push('/(modals)/progress-tracker')

  return (
    <>
      <StatusBar translucent={true} hidden={true} />
      {/* Header */}
      <LinearGradient
        colors={['#f472b6', '#FED0E2']}
        style={{
          paddingTop: Constants.statusBarHeight + 10,
          paddingHorizontal: 24,
          paddingBottom: 24
        }}
      >
        <View className="flex-row items-center justify-between">
          <BubblyLogo loop={false} />
          <View className="flex-row items-center gap-x-3">
            <View className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Text className="font-inter-bold text-sm text-white">0</Text>
            </View>
            <Pressable className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Ionicons name="notifications-outline" size={20} color="white" />
            </Pressable>
          </View>
        </View>
        <View className="mt-6 flex-row items-center justify-between">
          <View>
            <Text className="font-inter-bold text-2xl text-white">
              Hey, {userName}!
            </Text>
            <Text className="font-inter text-sm text-white/90">
              Week 2, Day 3 of your journey
            </Text>
          </View>
          <View className="items-center">
            <ProgressRing
              size={90}
              strokeWidth={8}
              progress={weekProgress}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView className="flex-1 bg-white px-6 pt-8">
        {/* Nutrition Stats */}
        <NutritionStats />

        {/* Recently Logged Section */}
        <RecentlyLogged />

        {/* Today's Plan Card */}
        <View className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <Text className="mb-6 font-inter-bold text-lg text-black">
            Today's Plan
          </Text>
          {/* Workout Item */}
          <View className="mb-6 flex-row items-center gap-x-4">
            <View className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-50">
              <MaterialCommunityIcons
                name="heart-pulse"
                size={26}
                color="#F472B6"
              />
            </View>
            <View className="flex-1">
              <Text className="mb-1 font-inter-medium text-base text-black">
                Lower Body Workout
              </Text>
              <Text className="mb-3 font-inter text-sm text-gray-500">
                30 min • Glute focus
              </Text>
              <Progress.Bar
                progress={0}
                width={null}
                height={4}
                color="#F472B6"
                unfilledColor="#F3F4F6"
                borderColor="transparent"
                borderRadius={2}
                useNativeDriver={true}
              />
            </View>
            <Pressable
              className="rounded-full bg-black px-5 py-2.5"
              onPress={navigateToWorkout}
            >
              <Text className="font-inter-medium text-sm text-white">
                Start
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Snatch Hack Card */}
        <Pressable
          className="mb-8 rounded-3xl bg-white p-6 shadow-sm"
          onPress={navigateToSnatchHack}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-inter-bold text-lg text-black">
              Today's Snatch Hack
            </Text>
            <Text className="font-inter text-sm text-gray-400">Day 17</Text>
          </View>
          <View className="flex-row items-start gap-x-4">
            <View className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
              <Ionicons name="sparkles-outline" size={24} color="#A855F7" />
            </View>
            <View className="flex-1">
              <Text className="mb-2 font-inter-medium text-base text-black">
                Posture Check
              </Text>
              <Text className="font-inter text-sm leading-6 text-gray-500">
                Set hourly reminders to check your posture. Good posture
                instantly makes you look more toned and confident.
              </Text>
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </>
  )
}
