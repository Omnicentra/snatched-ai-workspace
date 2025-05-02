import logo from "@/assets/images/logo-dark.png";
import { ProgressRing } from "@/components/core";
import { PedometerCard } from "@/components/core/PedometerCard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import * as Progress from "react-native-progress";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { nutritionStore$ } from "@/stores/nutrition.store";
import { use$ } from "@legendapp/state/react";
import * as Sentry from "@sentry/react-native";

type IconName = keyof typeof Ionicons.glyphMap;

// Nutrition Stats Card Component
const NutritionStats = () => {
  const router = useRouter();
  const bodyRating = use$(onboardingStore$.bodyRating);

  // Calculate the overall snatched score as an average of all metrics
  const snatchedScore = Math.round(
    [
      bodyRating.waistDefinition ?? 0,
      bodyRating.hipCurve ?? 0,
      bodyRating.gluteShape ?? 0,
      bodyRating.posture ?? 0,
      bodyRating.armShape ?? 0,
      bodyRating.backDefinition ?? 0,
    ].filter(Boolean).reduce((a, b) => a + b, 0) / 6
  );

  const bodyPartStats: {
    label: string;
    value: number;
    icon: IconName;
  }[] = [
    { label: "Waist Definition", value: bodyRating.waistDefinition ?? 0, icon: "hourglass-outline" },
    { label: "Arm Shape", value: bodyRating.armShape ?? 0, icon: "barbell" },
    { label: "Glute Shape", value: bodyRating.gluteShape ?? 0, icon: "fitness" },
    { label: "Hip Curve", value: bodyRating.hipCurve ?? 0, icon: "walk" },
    { label: "Back Definition", value: bodyRating.backDefinition ?? 0, icon: "body" },
    { label: "Posture", value: bodyRating.posture ?? 0, icon: "shield" },
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
              progress={snatchedScore / 100}
              bgColor="#F3F4F6"
              progressColor="#F472B6"
            />
            <View className="absolute inset-0 items-center justify-center">
              <Text className="font-inter-bold text-4xl text-black">{snatchedScore}</Text>
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
                  progress={stat.value / 100}
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
  const router = useRouter();
  const loggedMeals = use$(nutritionStore$.loggedMeals);
  
  // Get today's meals
  // const today = new Date().toISOString().split('T')[0];
  const todaysMeals = Object.entries(loggedMeals).sort((a, b) => new Date(b[1].loggedAt).getTime() - new Date(a[1].loggedAt).getTime());

    console.log(JSON.stringify(todaysMeals, null, 2));

  return (
    <View className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
      <Text className="font-inter-bold mb-1 text-lg text-black">
        Recently logged
      </Text>
      {todaysMeals.length > 0 ? (
        <View>
          {todaysMeals.map(([id, meal]) => (
            <View key={id} className="mt-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Ionicons name="restaurant-outline" size={20} color="#1F2937" />
                </View>
                <View>
                  <Text className="font-inter-medium text-base text-black">
                    {meal.mealName}
                  </Text>
                  <Text className="font-inter text-sm text-gray-500">
                    {new Date(meal.loggedAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              </View>
              <Pressable 
                className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
                onPress={() => {
                  router.push(`/(modals)/recipe-detail?mealId=${id}`);
                }}
              >
                <Ionicons name="chevron-forward" size={20} color="#1F2937" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <View className="items-center py-4">
          <Text className="font-inter-medium mb-2 text-base text-black">
            You haven't uploaded any food
          </Text>
          <Text className="font-inter mb-4 text-center text-sm text-gray-500">
            Start tracking today's meals by taking a quick picture.
          </Text>
          <Pressable 
            onPress={() => router.push("/(tabs)/nutrition")} 
            className="h-14 w-14 items-center justify-center rounded-full bg-black"
          >
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>
      )}
    </View>
  );
};

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
  const userName = "Suzie";
  
  // Get current date and calculate the Monday of current week
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // If Sunday, go back 6 days, else calculate days until Monday
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  
  // Generate week dates starting from Monday
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      letter: dayLetters[index % 7],
      number: date.getDate(),
      fullDate: date
    };
  });

  // Find the index of today in our week array
  const todayIndex = weekDates.findIndex(
    date => date.fullDate.toDateString() === today.toDateString()
  );
  
  // Set active day to today's index, defaulting to 0 (Monday) if somehow not found
  const [activeDayIndex, setActiveDayIndex] = useState(Math.max(0, todayIndex));

  const navigateToWorkout = () => router.push("/(modals)/workout-detail?workoutId=3");
  const navigateToSnatchHack = () => router.push("/(modals)/snatch-hack-detail");

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

        {/* Pedometer Card */}
        <PedometerCard />

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
