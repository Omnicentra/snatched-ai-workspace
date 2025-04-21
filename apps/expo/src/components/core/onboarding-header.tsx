// components/OnboardingHeader.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from './progress-bar'; // Assuming ProgressBar is in the same directory
import { cn } from '@/lib/utils';

interface OnboardingHeaderProps {
  progress: number; // 0 to 1
  title?: string;
  subtitle?: string;
  subtitleClassName?: string;
  showBack?: boolean;
  className?: string;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  progress,
  title,
  subtitle,
  subtitleClassName = '',
  showBack = true,
  className = '',
}) => {
  const router = useRouter();

  return (
    <View className={cn("mb-8", className)}>
      {showBack && (
        <View className="flex flex-row gap-x-3 items-center">
          <Pressable
            onPress={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 p-1.5"
          >
            <Ionicons name="arrow-back" size={18} color="black" />
          </Pressable>
          <ProgressBar progress={progress} offset={14} />
        </View>
      )}
      <View> {/* Adjust padding if back button overlaps */}
        {title && <Text className="text-3xl font-inter-bold text-black mt-8 mb-2">{title}</Text>}
        {subtitle && <Text className={cn("text-black text-sm mb-8 font-inter", subtitleClassName)}>{subtitle}</Text>}
      </View>
    </View>
  );
};