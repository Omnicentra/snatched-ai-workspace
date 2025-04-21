// components/InfoCard.tsx
import { cn } from '@/lib/utils';
import React from 'react';
import { View, Text } from 'react-native';

interface InfoCardProps {
    icon: React.ReactNode;
    text: string;
    iconBg?: string;
    className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ icon, text, iconBg = 'bg-pink-100', className }) => {
    return (
        <View className={cn("bg-gray-50 p-5 rounded-2xl border border-gray-100", className)}>
            <View className="flex-row items-center">
            <View className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${iconBg}`}>
                {icon}
            </View>
            <Text className="text-black text-sm flex-1">{text}</Text>
            </View>
      </View>
    );
};
