// components/FeatureCard.tsx (Used in Welcome Screen)
import React from 'react';
import { View, Text } from 'react-native';

interface FeatureCardProps {
    icon: React.ReactNode;
    iconBg?: string;
    title: string;
    description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, iconBg = 'bg-pink-100', title, description }) => {
    return (
         <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex-row items-start">
            <View className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${iconBg}`}>
                {icon}
            </View>
            <View className="flex-1">
                <Text className="text-black font-inter-medium mb-1">{title}</Text>
                <Text className="text-black text-xs font-inter">{description}</Text>
            </View>
        </View>
    );
};