// app/(modals)/nutrition-plan.tsx OR app/(details)/nutrition-plan.tsx
import React, { useState } from 'react'
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  Platform
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { StyledButton } from '@/components/core'
import { MilestoneModal } from '@/components/MilestoneModal'

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
      isActive ? 'bg-[#f472b6]' : 'border border-gray-200'
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

// Macro Pill Component
const MacroPill = ({
  label,
  amount,
  unit = 'g'
}: {
  label: string
  amount: number
  unit?: string
}) => (
  <View className="flex-row items-center rounded-xl bg-gray-50 px-4 py-2.5">
    <Text className="font-inter-medium text-sm text-gray-900">
      {amount}
      {unit}
    </Text>
    <Text className="ml-1 font-inter text-xs text-gray-500">{label}</Text>
  </View>
)

// Meal Card Component
const MealCard = ({
  name,
  calories,
  protein,
  carbs,
  fats,
  imageUrl,
  time,
  onPress
}: {
  name: string
  calories: number
  protein: number
  carbs: number
  fats: number
  imageUrl: string
  time: string
  onPress: () => void
}) => (
  <Pressable
    onPress={onPress}
    className="mb-4 overflow-hidden rounded-2xl bg-white"
    style={{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 15,
      elevation: 2
    }}
  >
    <View className="flex-row flex-wrap">
      <View className="flex-1 p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="font-inter-medium text-sm text-gray-500">
            {time}
          </Text>
          <Text className="font-inter text-sm text-[#f472b6]">
            {calories} cal
          </Text>
        </View>
        <Text className="mb-3 font-inter-semibold text-lg text-gray-900">
          {name}
        </Text>
        <View className="flex-row gap-2 flex-wrap">
          <MacroPill label="protein" amount={protein} />
          <MacroPill label="carbs" amount={carbs} />
          <MacroPill label="fats" amount={fats} />
        </View>
      </View>
      <View className="h-32 w-32">
        <Image
          source={{ uri: imageUrl }}
          className="h-full w-full"
          style={{
            borderRadius: 16,
            width: 128,
            height: 128
          }}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)']}
          className="absolute bottom-0 h-1/2 w-full"
        />
      </View>
    </View>
  </Pressable>
)

export default function NutritionPlanScreen() {
  const router = useRouter()
  const [showMilestone, setShowMilestone] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks']

  const meals = {
    breakfast: {
      name: 'Oatmeal Bowl',
      time: '8:00 AM',
      calories: 350,
      protein: 15,
      carbs: 45,
      fats: 8,
      imageUrl:
        'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    lunch: {
      name: 'Mediterranean Salad',
      time: '12:30 PM',
      calories: 450,
      protein: 35,
      carbs: 25,
      fats: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    snack: {
      name: 'Berry Protein Bowl',
      time: '3:30 PM',
      calories: 200,
      protein: 18,
      carbs: 15,
      fats: 5,
      imageUrl:
        'https://images.unsplash.com/photo-1575224526797-5730d09d781d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    dinner: {
      name: 'Grilled Salmon',
      time: '7:00 PM',
      calories: 500,
      protein: 35,
      carbs: 30,
      fats: 25,
      imageUrl:
        'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  }

  const navigateToRecipeDetail = (mealId: string) => {
    router.push(`/(modals)/recipe-detail?mealId=${mealId}`)
  }

  const handleLogMeals = () => {
    console.log('Log meals button pressed')
    router.back()
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-6">
        <Text className="font-inter-bold text-2xl text-black">Nutrition</Text>
        <View className="flex-row gap-2">
          <Pressable
            className="rounded-full bg-gray-100 p-2"
            onPress={() => setShowMilestone(true)}
          >
            <MaterialCommunityIcons
              name="trophy-outline"
              size={24}
              color="#f472b6"
            />
          </Pressable>
          <Pressable
            className="rounded-full bg-gray-100 p-2"
            onPress={() => console.log('Options')}
          >
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={24}
              color="#374151"
            />
          </Pressable>
        </View>
      </View>

      {/* Meal Lists */}
      <ScrollView className="flex-1 px-6">
        {/* Macro Progress */}
        <View className="mb-8 overflow-hidden rounded-3xl bg-white px-2 py-6 shadow-sm">
          <Text className="mb-4 font-inter-semibold text-base text-gray-600">
            Macro Progress
          </Text>
          <View className="flex-row justify-between">
            {[
              {
                name: 'Protein',
                target: 144,
                current: 103,
                color: '#f472b6',
                icon: 'arm-flex-outline' as const
              },
              {
                name: 'Carbs',
                target: 115,
                current: 87,
                color: '#60a5fa',
                icon: 'barley' as const
              },
              {
                name: 'Fats',
                target: 50,
                current: 38,
                color: '#fbbf24',
                icon: 'food-drumstick-outline' as const
              }
            ].map((macro) => (
              <View key={macro.name} className="items-center">
                <View
                  className="mb-2 h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${macro.color}15` }}
                >
                  <MaterialCommunityIcons
                    name={macro.icon}
                    size={24}
                    color={macro.color}
                  />
                </View>
                <View className="items-center">
                  <Text className="font-inter-medium text-xs text-gray-500">
                    {macro.name}
                  </Text>
                  <Text className="font-inter-bold text-2xl text-gray-900">
                    {macro.current}
                    <Text className="font-inter-medium text-base">g</Text>
                  </Text>
                  <Text className="font-inter-medium text-xs text-gray-500">
                    of {macro.target}g
                  </Text>
                </View>
                <View className="mt-3 h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                  <View
                    className="h-full"
                    style={{
                      width: `${(macro.current / macro.target) * 100}%`,
                      backgroundColor: macro.color
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Meals */}
        <Text className="mb-4 px-2 font-inter-bold text-lg text-black">
          Today's Meals
        </Text>
        {Object.entries(meals).map(([id, meal]) => (
          <MealCard
            key={id}
            {...meal}
            onPress={() => navigateToRecipeDetail(id)}
          />
        ))}
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
          title="Log Today's Meals"
          onPress={handleLogMeals}
          variant="primary"
        />
      </View>

      <MilestoneModal
        isVisible={showMilestone}
        onClose={() => setShowMilestone(false)}
        currentDay={1}
        totalDays={7}
        emoji="🥗"
        accentColor="#f472b6"
        bgColor="#FDF2F8"
      />
    </SafeAreaView>
  )
}
