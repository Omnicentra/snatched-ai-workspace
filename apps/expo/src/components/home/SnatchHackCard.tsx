import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { SNATCH_HACKS } from "../../constants/snatch-hacks";
import { authClient } from "../../utils/auth";
import { snatchHackStore$ } from "@/stores/snatch-hack.store";
import { use$ } from "@legendapp/state/react";
import { api } from "@/utils/api";

export const SnatchHackCard = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const snatchHackStore = use$(snatchHackStore$);

  // Get database snatch hacks
  const { data: apiHacks } = api.snatchHack.getSnatchHacks.useQuery();
  const { data: completedToday } = api.snatchHack.getUserCompletedHackForToday.useQuery();

  // Get today's date as a string to use as a seed
  const today = new Date().toISOString().split('T')[0];
  
  // Use the date string to generate a consistent random index for the day
  const getRandomHackForDay = (dateStr: string) => {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Use either API hacks if available, or fallback to constant data
    const hacksArray = apiHacks?.length ? apiHacks : SNATCH_HACKS;
    return Math.abs(hash) % hacksArray.length;
  };

  const todaysHackIndex = today ? getRandomHackForDay(today) : 0;
  
  // Use API hacks if available, otherwise fallback to constants
  const hacksArray = apiHacks?.length ? apiHacks : SNATCH_HACKS;
  const todaysHack = hacksArray[todaysHackIndex];
  
  // Check completion status from both local storage and API
  const isLocallyCompleted = snatchHackStore.completedHacks[today]?.hackId === todaysHack?.id;
  const isApiCompleted = completedToday?.hack.id === todaysHack?.id;
  
  // Consider it completed if either source says so
  const isCompleted = isLocallyCompleted || isApiCompleted;

  // Calculate which day of the journey we're on using user's creation date
  const journeyDay = useMemo(() => {
    if (!session?.user.createdAt) return 1;
    
    const startDate = new Date(session.user.createdAt);
    const diffTime = Math.abs(new Date().getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [session?.user.createdAt]);

  const navigateToSnatchHack = () => {
    if (!todaysHack) return;
    
    router.push({
      pathname: "/(modals)/snatch-hack-detail",
      params: { 
        id: todaysHack.id.toString(),
        title: todaysHack.title,
        description: todaysHack.description
      }
    });
  };

  if (!todaysHack) return null;

  return (
    <Pressable
      className="mb-8 rounded-3xl bg-white p-6 shadow-sm"
      onPress={navigateToSnatchHack}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-inter-bold text-lg text-black">
          Today's Snatch Hack
        </Text>
        <Text className="font-inter text-sm text-gray-400">Day {journeyDay}</Text>
      </View>
      <View className="flex-row items-start gap-x-4">
        <View className={`flex h-12 w-12 items-center justify-center rounded-full ${
          // Handle both types of bgColor format (from API vs constants)
          todaysHack.bgColor?.startsWith('bg-') 
            ? todaysHack.bgColor 
            : todaysHack.bgColor?.startsWith('#') 
              ? 'bg-pink-50' // fallback if it's a hex color
              : 'bg-pink-50' // default fallback
        }`}>
          {isCompleted ? (
            <Ionicons name="checkmark-circle" size={24} color={todaysHack.color} />
          ) : (
            <Ionicons 
              name={
                // Handle emoji vs ionicon name formats from different sources
                todaysHack.icon?.length === 2 || todaysHack.icon?.length === 3
                  ? "sparkles-outline" // Fallback for emoji format
                  : todaysHack.icon || "sparkles-outline"
              } 
              size={24} 
              color={todaysHack.color} 
            />
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-inter-medium mb-2 text-base text-black">
              {todaysHack.title}
            </Text>
            {isCompleted && (
              <View className="rounded-full bg-green-100 px-2 py-1">
                <Text className="font-inter-medium text-xs text-green-700">
                  Completed
                </Text>
              </View>
            )}
          </View>
          <Text className="font-inter text-sm leading-6 text-gray-500">
            {todaysHack.description}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}; 