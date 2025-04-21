// components/CarouselIndicator.tsx (Used in feature screens)
import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CarouselIndicatorProps {
    count: number;
    activeIndex: number;
}

export const CarouselIndicator: React.FC<CarouselIndicatorProps> = ({ count, activeIndex }) => {
    return (
        <View className="flex-row items-center justify-center mb-8">
            {Array.from({ length: count }).map((_, index) => {
                const isActive = index === activeIndex;
                if (isActive) {
                    return (
                         <View
                            key={index}
                            className="w-5 h-2 rounded-full mx-1 bg-pink-200"
                         />
                    );
                }
                return (
                    <View key={index} className="w-2 h-2 rounded-full bg-gray-200 mx-1" />
                );
            })}
        </View>
    );
};