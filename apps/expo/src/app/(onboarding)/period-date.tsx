// app/(onboarding)/period-date.tsx
import { InfoCard, OnboardingHeader, StyledButton } from '@/components/core'
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking'
import { onboardingStore$ } from '@/stores/onboarding.store'
import { Ionicons } from '@expo/vector-icons'
import { use$ } from '@legendapp/state/react'
import Constants from 'expo-constants'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native'
import type { DateData } from 'react-native-calendars'
import { Calendar } from 'react-native-calendars'
import { z } from 'zod'

// Function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const periodDateValidationSchema = z.object({
  last_period_start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
});

function PeriodDateScreen() {
  const router = useRouter()
  // Use YYYY-MM-DD format for react-native-calendars
  const selectedDate = use$(onboardingStore$.onboarding.lastPeriodDate);

  const handleDayPress = (day: DateData) => {
    onboardingStore$.onboarding.lastPeriodDate.set(day.dateString)
  }

  const handleContinue = () => {
    const periodData = {
      last_period_start_date: selectedDate,
    };

    const result = periodDateValidationSchema.safeParse(periodData);

    if (result.success) {
      onboardingStore$.onboarding.lastPeriodDate.set(selectedDate);
      router.push('/(onboarding)/cravings')
    } else {
      console.error("Period date validation failed:", result.error);
    }
  }

  useEffect(() => {
    onboardingStore$.onboarding.lastPeriodDate.set(getTodayDateString());
  }, []);

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
          <Pressable>
            <View className="w-full flex-row items-center justify-between rounded-xl border border-gray-200 p-4">
              <Text className="font-inter-medium text-xl text-black">
                {selectedDate || 'Select Date'}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="rgb(156 163 175)"
              />
            </View>
          </Pressable>
        </View>

        <View className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <Calendar
            current={selectedDate}
            onDayPress={(day: DateData) => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
              handleDayPress(day)
            }}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: '#FECDD3',
                selectedTextColor: 'black'
              }
            }}
            theme={{
              backgroundColor: '#F9FAFB',
              calendarBackground: '#F9FAFB',
              textSectionTitleColor: '#6B7280',
              selectedDayBackgroundColor: '#FECDD3',
              selectedDayTextColor: '#000000',
              todayTextColor: '#FF9A9E',
              dayTextColor: '#1F2937',
              textDisabledColor: '#D1D5DB',
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
                week: {
                  marginTop: 5,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }
              }
            }}
          />
        </View>

        <InfoCard
          icon={<Ionicons name="lock-closed-outline" size={20} color="black" />}
          text="This information is private and helps us optimize your workouts and nutrition around your cycle."
          iconBg="bg-yellow-100"
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

export default withOnboardingTracking(PeriodDateScreen, 'period_date');
