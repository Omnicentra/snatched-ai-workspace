// components/MetricCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import * as Progress from 'react-native-progress';

interface MetricCardProps {
    iconEmoji: string;
    title: string;
    progress: number; // 0 to 1
    description: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ iconEmoji, title, progress, description }) => {
    return (
        <View className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
            <View className="flex-row items-start">
                <Text className="mr-1.5 text-sm mt-0.5">{iconEmoji}</Text>
                <View className="flex-1">
                    <Text className="text-xs font-inter-medium text-black">{title}</Text>
                    <Progress.Bar
                        progress={progress}
                        width={null} // Takes full width of container
                        height={3}
                        color="black" // Or use gradient
                        unfilledColor="#F3F4F6"
                        borderColor="transparent"
                        borderRadius={1.5}
                        className="mt-1 mb-1"
                    />
                    <Text className="text-[9px] text-gray-500 font-inter">{description}</Text>
                </View>
            </View>
        </View>
    );
};