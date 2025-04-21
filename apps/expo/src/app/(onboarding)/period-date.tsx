// app/(onboarding)/period-date.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable
} from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { OnboardingHeader, InfoCard, StyledButton } from '@/components/core'
import { Ionicons } from '@expo/vector-icons'
import { Calendar, DateData } from 'react-native-calendars' // Import calendar
import * as Haptics from 'expo-haptics'
// Function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function PeriodDateScreen() {
  const router = useRouter()
  // Use YYYY-MM-DD format for react-native-calendars
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString())

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString)
  }

  const handleContinue = () => {
    // Store selectedDate
    router.push('/(onboarding)/cravings')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} contentContainerClassName="px-8 pt-8 pb-4">
        <OnboardingHeader
          progress={11 / 18}
          title="When do you have your period?"
          subtitle="This helps us plan around your cycle for optimal results."
        />

        <View className="mb-6">
          <Text className="mb-2 block font-inter-medium text-sm text-black">
            Start date of your last period
          </Text>
          {/* Consider using a dedicated Date Picker component instead of TextInput for better UX */}
          <Pressable
            onPress={() => {
              /* Open date picker? */
            }}
          >
            <View className="w-full flex-row items-center justify-between rounded-xl border border-gray-200 p-4">
              <Text className="font-inter-medium text-xl text-black">
                {selectedDate || 'Select Date'}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="rgb(156 163 175)"
              />
              {/* gray-400 */}
            </View>
          </Pressable>
        </View>

        {/* Calendar Component */}
        <View className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <Calendar
            current={selectedDate} // Control the visible month
            onDayPress={(day: DateData) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
              handleDayPress(day)
            }}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: '#FECDD3' /* pink-200 */,
                selectedTextColor: 'black'
              }
            }}
            theme={{
              backgroundColor: '#F9FAFB', // bg-gray-50
              calendarBackground: '#F9FAFB',
              textSectionTitleColor: '#6B7280', // text-gray-500
              selectedDayBackgroundColor: '#FECDD3',
              selectedDayTextColor: '#000000',
              todayTextColor: '#FF9A9E', // Highlight today's date
              dayTextColor: '#1F2937', // text-gray-800
              textDisabledColor: '#D1D5DB', // text-gray-300
              arrowColor: '#FF9A9E',
              monthTextColor: '#1F2937',
              indicatorColor: '#FF9A9E',
              textDayFontFamily: 'Inter_400Regular',
              textMonthFontFamily: 'Inter_500Medium',
              textDayHeaderFontFamily: 'Inter_500Medium',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
              'stylesheet.calendar.header': {
                // Example of deeper theme customization
                week: {
                  marginTop: 5,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }
              }
            }}
            // Add other props as needed (minDate, maxDate, etc.)
          />
        </View>

        <InfoCard
          icon={<Ionicons name="lock-closed-outline" size={20} color="black" />}
          text="This information is private and helps us optimize your workouts and nutrition around your cycle."
          iconBg="bg-yellow-100" // Match HTML
        />
      </ScrollView>
      <View className="mt-auto p-8">
        <StyledButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedDate}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  )
}
