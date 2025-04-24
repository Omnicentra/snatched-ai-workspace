import logo from "@/assets/images/logo-dark.png";
import { ProgressRing } from "@/components/core";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import * as Progress from "react-native-progress";

type IconName = keyof typeof Ionicons.glyphMap;

// Simple Bar Chart Component
const WeeklyProgressBarChart = () => {
  const data = [30, 60, 35, 0, 0, 0, 0]; // Example percentages
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <View className="h-28 flex-row items-end justify-between px-2">
      {data.map((percentage, index) => (
        <View key={index} className="flex-1 items-center">
          <View className="h-20 w-full flex-col-reverse px-1">
            <View
              className={`w-full rounded-lg ${
                index === 2 ? "bg-pink-400" : "bg-gray-100"
              }`}
              style={{ height: `${percentage}%` }}
            />
          </View>
          <Text
            className={`mt-2 text-xs ${
              index === 2
                ? "font-inter-medium text-pink-500"
                : "font-inter text-gray-500"
            }`}
          >
            {days[index]}
          </Text>
        </View>
      ))}
    </View>
  );
};

// Nutrition Stats Card Component
const NutritionStats = () => {
  const router = useRouter();
  const bodyPartStats: {
    label: string;
    value: string;
    icon: IconName;
  }[] = [
    { label: "Waist Definition", value: "65", icon: "hourglass-outline" },
    { label: "Arm Shape", value: "72", icon: "barbell" },
    { label: "Glute Progress", value: "58", icon: "fitness" },
    { label: "Leg Definition", value: "70", icon: "walk" },
    { label: "Back Shape", value: "63", icon: "body" },
    { label: "Core Strength", value: "68", icon: "shield" },
  ];

  return (
    <View className="mb-8">
      {/* Main Snatched Score Card */}
      <View className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
        <View className="items-center">
          <View className="relative mb-4">
            <ProgressRing
              size={160}
              strokeWidth={12}
              progress={0.72}
              bgColor="#F3F4F6"
              progressColor="#F472B6"
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="font-inter-bold text-4xl text-black">72</Text>
              <Text className="font-inter mt-1 text-sm text-gray-500">
                Snatched Score
              </Text>
            </View>
          </View>
          <Pressable 
            className="flex-row items-center rounded-full bg-pink-50 px-4 py-2"
            onPress={() => router.push("/(modals)/transformation-preview")}
          >
            <Ionicons name="image" size={18} color="#F472B6" />
            <Text className="font-inter-medium ml-2 text-sm text-pink-500">
              See Snatched Transformation
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Body Part Stats Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-4">
        {bodyPartStats.map((stat, index) => (
          <View
            key={index}
            className="w-[48%] rounded-3xl bg-white p-4 shadow-sm"
          >
            <Text className="font-inter-bold text-xl text-black">
              {stat.value}%
            </Text>
            <Text className="font-inter mt-1 text-xs text-gray-500">
              {stat.label}
            </Text>
            <View className="mt-3 items-center">
              <View className="relative h-[50px] w-[50px]">
                <ProgressRing
                  size={50}
                  strokeWidth={4}
                  progress={parseInt(stat.value) / 100}
                  bgColor="#F3F4F6"
                  progressColor="#F472B6"
                />
                <View className="absolute inset-0 items-center justify-center">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-white/80">
                    <Ionicons name={stat.icon} size={18} color="#F472B6" />
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Recently Logged Component
const RecentlyLogged = () => {
  return (
    <View className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
      <Text className="font-inter-bold mb-4 text-lg text-black">
        Recently logged
      </Text>
      <View className="items-center py-4">
        <Text className="font-inter-medium mb-2 text-base text-black">
          You haven't uploaded any food
        </Text>
        <Text className="font-inter mb-4 text-center text-sm text-gray-500">
          Start tracking today's meals by taking a quick picture.
        </Text>
        <Pressable className="h-14 w-14 items-center justify-center rounded-full bg-black">
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
};

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
      <View className="mb-1 h-10 w-10 items-center justify-center rounded-full border border-dashed border-primary">
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

export default function HomeScreen() {
  const router = useRouter();
  const userName = "Suzie";
  const [activeDayIndex, setActiveDayIndex] = useState(2); // Wednesday active

  const weekDates = [
    { letter: 'M', number: 15 },
    { letter: 'T', number: 16 },
    { letter: 'W', number: 17 },
    { letter: 'T', number: 18 },
    { letter: 'F', number: 19 },
    { letter: 'S', number: 20 },
    { letter: 'S', number: 21 }
  ];

  const navigateToWorkout = () => router.push("/(modals)/workout-detail");
  const navigateToSnatchHack = () => router.push("/(modals)/snatch-hack-detail");
  const navigateToProgress = () => router.push("/(modals)/progress-tracker");

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
                onPress={() => setActiveDayIndex(index)}
              />
            ))}
          </View>
        </View>

        {/* User Welcome Section */}
        <View className="mt-8">
          <Text className="font-inter-bold text-3xl text-gray-900">
            Hey, {userName}!
          </Text>
          <Text className="font-inter mt-1 text-base text-gray-600">
            Week 2, Day 3 of your journey
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6">
        {/* Nutrition Stats */}
        <NutritionStats />

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
              <Text className="font-inter-medium mb-2 text-base text-black">
                Posture Check
              </Text>
              <Text className="font-inter text-sm leading-6 text-gray-500">
                Set hourly reminders to check your posture. Good posture
                instantly makes you look more toned and confident.
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Recently Logged Section */}
        <RecentlyLogged />

        {/* Today's Plan Card */}
        <View className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <Text className="font-inter-bold mb-6 text-lg text-black">
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
              <Text className="font-inter-medium mb-1 text-base text-black">
                Lower Body Workout
              </Text>
              <Text className="font-inter mb-3 text-sm text-gray-500">
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
      </ScrollView>
    </LinearGradient>
  );
}
