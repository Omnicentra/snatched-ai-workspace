import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface DayPillProps {
  dayLetter: string;
  dayNumber: string | number;
  isActive: boolean;
  isFutureDay: boolean;
  isCompleted?: boolean;
  onPress: () => void;
}

export function DayPill({
  dayLetter,
  dayNumber,
  isActive,
  isFutureDay,
  isCompleted,
  onPress
}: DayPillProps) {
  return (
    <Pressable 
      className={`items-center ${isFutureDay ? 'opacity-50' : ''}`} 
      onPress={isFutureDay ? undefined : onPress}
      disabled={isFutureDay}
    >
      {isActive ? (
        <LinearGradient
          colors={isCompleted ? ['#22C55E', '#4ADE80'] : ['#f472b6', '#F6ADCE']}
          style={{
            borderRadius: 100,
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 2.5
          }}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={16} color="white" />
          ) : (
            <Text className="font-inter-medium text-sm text-white">
              {dayLetter}
            </Text>
          )}
        </LinearGradient>
      ) : (
        <View className="mb-1 h-10 w-10 items-center justify-center rounded-full border border-dashed border-primary">
          {isFutureDay ? (
            <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
          ) : isCompleted ? (
            <Ionicons name="checkmark" size={16} color="#10B981" />
          ) : (
            <Text className="font-inter-medium text-sm text-gray-400">
              {dayLetter}
            </Text>
          )}
        </View>
      )}
      <Text className={`font-inter text-xs ${isActive ? (isCompleted ? 'text-green-500' : 'text-pink-500') : 'text-gray-400'}`}>
        {dayNumber}
      </Text>
    </Pressable>
  );
} 