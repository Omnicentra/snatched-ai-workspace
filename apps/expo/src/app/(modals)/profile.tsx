import React from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image
} from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { BubblyLogo, SettingItem } from '@/components/core'
import { StatusBar } from 'expo-status-bar' // Reusing components

export default function ProfileScreen() {
  const router = useRouter()
  const userName = 'Suzie Smith'
  const membershipStatus = 'Premium Member'
  const currentWeek = 2
  const progressPercent = 35

  // Navigation functions for settings items
  const goToPersonalInfo = () => console.log('Navigate to Personal Info')
  const goToSecurity = () => console.log('Navigate to Security')
  const goToPayments = () => console.log('Navigate to Payments')
  const goToSubscription = () => console.log('Navigate to Subscription')
  const goToNotifications = () => console.log('Navigate to Notifications')
  const goToWorkoutSchedule = () => console.log('Navigate to Workout Schedule')
  const goToDietaryPrefs = () => console.log('Navigate to Dietary Prefs')
  const goToHelpCenter = () => console.log('Navigate to Help Center')
  const goToContactSupport = () => console.log('Navigate to Contact Support')
  const goToTerms = () => console.log('Navigate to Terms')
  const handleLogout = () => {
    console.log('Logout')
    // Add logout logic (clear state, storage, navigate to login/onboarding)
    // Example: router.replace('/login');
  }

  return (
    <>
      <StatusBar translucent={true} hidden={true} />
      {/* Header */}
      <LinearGradient
        colors={['#f472b6', '#FED0E2']}
        style={{
          paddingHorizontal: 18,
          paddingTop: Constants.statusBarHeight,
          paddingBottom: 15
        }}
      >
        <View className="flex-row items-center justify-center">
          <BubblyLogo />
          <Pressable className="absolute right-2 flex h-8 w-8 grow items-center justify-center rounded-full bg-white/20">
            <Ionicons name="notifications-outline" size={18} color="white" />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Profile Info */}
      <View className="flex-row items-center p-5">
        <View className="mr-4 h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-gray-200 shadow-md">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
            }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>
        <View>
          <Text className="font-inter-bold text-lg text-black">{userName}</Text>
          <Text className="font-inter text-xs text-gray-500">
            {membershipStatus}
          </Text>
          <View className="mt-1 flex-row items-center">
            <View className="mr-2 rounded-full bg-pink-100 px-2 py-0.5">
              <Text className="font-inter-medium text-xs text-black">
                Week {currentWeek}
              </Text>
            </View>
            <View className="rounded-full bg-green-100 px-2 py-0.5">
              <Text className="font-inter-medium text-xs text-black">
                {progressPercent}% Complete
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Settings List */}
      <ScrollView className="flex-1 px-5 py-2">
        {/* Account Section */}
        <Text className="mb-3 font-inter-bold text-base text-black">
          Account
        </Text>
        <View className="mb-6 gap-y-1 rounded-xl bg-white">
          <SettingItem
            icon={<Ionicons name="person-outline" size={16} color="black" />}
            label="Personal Information"
            onPress={goToPersonalInfo}
          />
          <SettingItem
            icon={
              <Ionicons name="lock-closed-outline" size={16} color="black" />
            }
            label="Password & Security"
            onPress={goToSecurity}
          />
          <SettingItem
            icon={<Ionicons name="card-outline" size={16} color="black" />}
            label="Payment Methods"
            onPress={goToPayments}
          />
          <SettingItem
            icon={<Ionicons name="ribbon-outline" size={16} color="black" />}
            label="Subscription"
            value={<Text className="mr-2 text-xs text-green-500">Premium</Text>}
            onPress={goToSubscription}
          />
        </View>

        {/* Preferences Section */}
        <Text className="mb-3 font-inter-bold text-base text-black">
          Preferences
        </Text>
        <View className="mb-6 gap-y-1 rounded-xl bg-white">
          <SettingItem
            icon={
              <Ionicons name="notifications-outline" size={16} color="black" />
            }
            label="Notifications"
            onPress={goToNotifications}
          />
          <SettingItem
            icon={<Ionicons name="calendar-outline" size={16} color="black" />}
            label="Workout Schedule"
            onPress={goToWorkoutSchedule}
          />
          <SettingItem
            icon={
              <Ionicons name="restaurant-outline" size={16} color="black" />
            }
            label="Dietary Preferences"
            onPress={goToDietaryPrefs}
          />
        </View>

        {/* Support Section */}
        <Text className="mb-3 font-inter-bold text-base text-black">
          Support
        </Text>
        <View className="mb-6 gap-y-1 rounded-xl bg-white">
          <SettingItem
            icon={
              <Ionicons name="help-circle-outline" size={16} color="black" />
            }
            label="Help Center"
            onPress={goToHelpCenter}
          />
          <SettingItem
            icon={
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color="black"
              />
            }
            label="Contact Support"
            onPress={goToContactSupport}
          />
          <SettingItem
            icon={
              <Ionicons name="document-text-outline" size={16} color="black" />
            }
            label="Terms & Privacy"
            onPress={goToTerms}
          />
        </View>

        {/* Logout Button */}
        <Pressable
          className="mb-6 w-full items-center justify-center rounded-xl border border-red-200 py-3 active:bg-red-50"
          onPress={handleLogout}
        >
          <Text className="font-inter-medium text-red-500">Log Out</Text>
        </Pressable>
        {/* Padding at bottom */}
        <View className="h-6" />
      </ScrollView>

      {/* Bottom Navigation is handled by app/(tabs)/_layout.tsx */}
    </>
  )
}
