import logo from "@/assets/images/logo-dark.png";
import { PedometerCard } from "@/components/core/PedometerCard";
import { NutritionStats } from "@/components/home/NutritionStats";
import { RecentlyLogged } from "@/components/home/RecentlyLogged";
import { SnatchHackCard } from "@/components/home/SnatchHackCard";
import { TodaysPlanCard } from "@/components/home/TodaysPlanCard";
import { authClient } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import * as Sentry from "@sentry/react-native";
import React, { useState, useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { api } from "@/utils/api";

// Day Pill Component
const DayPill = ({
  dayLetter,
  dayNumber,
  isActive,
  isFutureDay,
  onPress
}: {
  dayLetter: string
  dayNumber: string | number
  isActive: boolean
  isFutureDay: boolean
  onPress: () => void
}) => (
  <Pressable 
    className={`items-center ${isFutureDay ? 'opacity-50' : ''}`} 
    onPress={isFutureDay ? undefined : onPress}
    disabled={isFutureDay}
  >
    {isActive ? (
      <LinearGradient
        colors={['#f472b6', '#F6ADCE']}
        style={{
          borderRadius: 100,
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 2.5
        }}
      >
        <Text className="font-inter-medium text-sm text-white">
          {dayLetter}
        </Text>
      </LinearGradient>
    ) : (
      <View className="mb-1 h-10 w-10 items-center justify-center rounded-full border border-dashed border-primary">
        {isFutureDay ? (
          <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
        ) : (
          <Text className="font-inter-medium text-sm text-gray-400">
            {dayLetter}
          </Text>
        )}
      </View>
    )}
    <Text className={`font-inter text-xs ${isActive ? 'text-pink-500' : 'text-gray-400'}`}>
      {dayNumber}
    </Text>
  </Pressable>
)

export default function HomeScreen() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: session } = authClient.useSession();
  
  // Get current date and calculate the Monday of current week
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday, go back 6 days, else calculate days until Monday
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  // Calculate journey progress
  const journeyProgress = useMemo(() => {
    if (!session?.user.createdAt) return { week: 1, day: 1 };
    
    const startDate = new Date(session.user.createdAt);
    const diffTime = Math.abs(new Date().getTime() - startDate.getTime());
    const totalDays = Math.ceil(diffTime / (24 * 60 * 60 * 1000));
    
    return {
      week: Math.ceil(totalDays / 7),
      day: totalDays % 7 || 7
    };
  }, [session?.user.createdAt]);
  
  // Generate week dates starting from Monday
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
  
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const letter = dayLetters[index % 7];
    if (!letter) return null;
    return {
      letter,
      number: new Date(monday.getTime() + index * 24 * 60 * 60 * 1000).getDate(),
      fullDate: new Date(monday.getTime() + index * 24 * 60 * 60 * 1000)
    };
  }).filter((date): date is NonNullable<typeof date> => date !== null);

  // Find the index of today in our week array
  const todayIndex = weekDates.findIndex(
    date => date.fullDate.toDateString() === today.toDateString()
  );
  
  // Set active day to today's index, defaulting to 0 (Monday) if somehow not found
  const [activeDayIndex, setActiveDayIndex] = useState(Math.max(0, todayIndex));
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    void Promise.all([
      utils.nutrition.getTodaysMealPlan.invalidate(),
      utils.workout.getCurrentWeekPlan.invalidate(),
    ]).finally(() => {
      setRefreshing(false);
    });
  };

  return (
    <LinearGradient
      colors={['#e5e7eb', '#fff']}
      style={{ flexGrow: 1, paddingTop: Constants.statusBarHeight }} 
    >
      <StatusBar translucent={true} hidden={true} />
      {/* Header */}
      <View className="p-6">
        {/* Top Navigation Bar */}
        <View className="flex-row items-center justify-between">
          {/* Logo and Brand */}
          <View className="flex-row items-center">
            <View className="rounded-xl bg-black/5 p-2">
              <Image
                source={logo}
                style={{
                  width: 28,
                  height: 28,
                }}
              />
            </View>
            <Text className="font-inter-bold ml-3 text-2xl text-gray-900">
              Snatched AI
            </Text>
          </View>
          {/* Action Icons */}
          <View className="flex-row items-center gap-x-4">
            <View className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50">
              <Text className="font-inter-bold text-sm text-pink-500">0</Text>
            </View>
            <Pressable className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <Ionicons name="notifications-outline" size={20} color="#1F2937" />
            </Pressable>
            <Pressable 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              onPress={() => {
                Sentry.captureException(new Error("Profile button pressed"));
                router.push("/(modals)/profile")
              }}
            >
              <Ionicons name="person-outline" size={20} color="#1F2937" />
            </Pressable>
          </View>
        </View>

        {/* Week Selector */}
        <View className="mt-8">
          <View className="flex-row justify-between">
            {weekDates.map((day, index) => (
              <DayPill
                key={index}
                dayLetter={day.letter}
                dayNumber={day.number}
                isActive={index === activeDayIndex}
                isFutureDay={day.fullDate > today}
                onPress={() => setActiveDayIndex(index)}
              />
            ))}
          </View>
        </View>

        {/* User Welcome Section */}
        <View className="mt-8">
          <Text className="font-inter-bold text-3xl text-gray-900" numberOfLines={1} ellipsizeMode="tail">
            Hey, {session?.user.name.split(" ")[0]}!
          </Text>
          <Text className="font-inter mt-1 text-base text-gray-600">
            Week {journeyProgress.week}, Day {journeyProgress.day} of your journey
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        {/* Nutrition Stats */}
        <NutritionStats />

        {/* Pedometer Card */}
        <PedometerCard />

        {/* Today's Plan Card */}
        <TodaysPlanCard />

        {/* Snatch Hack Card */}
        <SnatchHackCard />

        {/* Recently Logged Section */}
        <RecentlyLogged />
      </ScrollView>
    </LinearGradient>
  );
}
