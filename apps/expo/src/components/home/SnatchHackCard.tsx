import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { SNATCH_HACKS } from "../../constants/snatch-hacks";
import { authClient } from "../../utils/auth";
import { snatchHackStore$ } from "@/stores/snatch-hack.store";
import { use$ } from "@legendapp/state/react";

export const SnatchHackCard = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const snatchHackStore = use$(snatchHackStore$);

  // Get today's date as a string to use as a seed
  const today = new Date().toISOString().split('T')[0];
  
  // Use the date string to generate a consistent random index for the day
  const getRandomHackForDay = (dateStr: string) => {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % SNATCH_HACKS.length;
  };

  const todaysHackIndex = today ? getRandomHackForDay(today) : 0;
  const todaysHack = SNATCH_HACKS[todaysHackIndex];
  const isCompleted = snatchHackStore.completedHacks[today]?.hackId === todaysHack?.id;

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
        <View className={`flex h-12 w-12 items-center justify-center rounded-full ${todaysHack.bgColor}`}>
          {isCompleted ? (
            <Ionicons name="checkmark-circle" size={24} color={todaysHack.color} />
          ) : (
            <Ionicons name={todaysHack.icon} size={24} color={todaysHack.color} />
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