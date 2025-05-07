import { Ionicons } from '@expo/vector-icons'
import { Pedometer } from 'expo-sensors'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

export function PedometerCard() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [todaySteps, setTodaySteps] = useState(0)
  const [yesterdaySteps, setYesterdaySteps] = useState(0)

  useEffect(() => {
    let subscription: { remove: () => void } | null = null

    async function initializePedometer() {
      try {
        const available = await Pedometer.isAvailableAsync()
        setIsAvailable(available)

        if (available) {
          // Get today's steps
          const now = new Date()
          const todayStart = new Date(now.setHours(0, 0, 0, 0))
          const todayStepsResult = await Pedometer.getStepCountAsync(todayStart, new Date())
          if (todayStepsResult) {
            setTodaySteps(todayStepsResult.steps)
          }

          // Get yesterday's steps
          const yesterdayStart = new Date(todayStart)
          yesterdayStart.setDate(yesterdayStart.getDate() - 1)
          const yesterdayEnd = new Date(todayStart)
          const yesterdayStepsResult = await Pedometer.getStepCountAsync(yesterdayStart, yesterdayEnd)
          if (yesterdayStepsResult) {
            setYesterdaySteps(yesterdayStepsResult.steps)
          }

          // Watch current steps
          subscription = await Pedometer.watchStepCount(result => {
            setTodaySteps(current => current + result.steps)
          })
        }
      } catch (err) {
        setError('Unable to access pedometer. Please check permissions.')
      } finally {
        setIsLoading(false)
      }
    }

    void initializePedometer()

    return () => {
      if (subscription) {
        subscription.remove()
      }
    }
  }, [])

  if (isLoading) {
    return (
      <View className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
        <View className="items-center justify-center py-4">
          <ActivityIndicator size="large" color="#EC4899" />
        </View>
      </View>
    )
  }

  if (!isAvailable || error) {
    return (
      <View className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
        <View className="items-center justify-center py-4">
          <Ionicons name="warning-outline" size={24} color="#EF4444" />
          <Text className="font-inter mt-2 text-center text-sm text-gray-500">
            {error ?? 'Pedometer is not available on this device'}
          </Text>
        </View>
      </View>
    )
  }

  const progress = yesterdaySteps > 0 ? (todaySteps / yesterdaySteps) * 100 : 0
  const isAheadOfYesterday = todaySteps > yesterdaySteps

  return (
    <View className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-inter-bold text-lg text-black">Daily Steps</Text>
        <View className="rounded-full bg-gray-100 px-3 py-1">
          <Text className="font-inter text-sm text-gray-600">Today</Text>
        </View>
      </View>

      <View className="items-center">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-pink-50">
          <Ionicons name="footsteps" size={32} color="#EC4899" />
        </View>
        <Text className="font-inter-bold text-3xl text-black">{todaySteps.toLocaleString()}</Text>
        <Text className="font-inter mt-1 text-sm text-gray-500">steps today</Text>

        {yesterdaySteps > 0 && (
          <View className={`mt-4 flex-row items-center rounded-full ${isAheadOfYesterday ? 'bg-green-50' : 'bg-gray-50'} px-3 py-1`}>
            <Ionicons 
              name={isAheadOfYesterday ? "trending-up" : "trending-down"} 
              size={16} 
              color={isAheadOfYesterday ? "#10B981" : "#6B7280"} 
            />
            <Text className={`font-inter-medium ml-1 text-sm ${isAheadOfYesterday ? 'text-green-600' : 'text-gray-600'}`}>
              {isAheadOfYesterday ? `${Math.round(progress - 100)}% ahead of` : `${Math.round(100 - progress)}% behind`} yesterday
            </Text>
          </View>
        )}
      </View>
    </View>
  )
} 