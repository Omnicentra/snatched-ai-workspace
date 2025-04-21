// components/PlanCardWithLock.tsx (Used in Screen 26)
import React from 'react';
import { View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface PlanCardWithLockProps {
    icon: React.ReactNode;
    iconBg?: string;
    title: string;
    description: string;
}

export const PlanCardWithLock: React.FC<PlanCardWithLockProps> = ({ icon, iconBg = 'bg-pink-100', title, description }) => {
    return (
         <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex-col items-center relative overflow-hidden">
            <View className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${iconBg}`}>
                {icon}
            </View>
            <Text className="text-black font-inter-medium text-center text-sm">{title}</Text>
            <Text className="text-black text-xs text-center font-inter">{description}</Text>
            {/* Blur Overlay */}
            <BlurView intensity={20} tint="light" className="absolute inset-0 items-center justify-center">
                 <View className="w-7 h-7 rounded-full bg-white/80 items-center justify-center">
                     <Ionicons name="lock-closed-outline" size={14} color="black" />
                 </View>
            </BlurView>
        </View>
    );
};
