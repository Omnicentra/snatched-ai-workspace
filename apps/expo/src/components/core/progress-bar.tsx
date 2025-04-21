// components/ProgressBar.tsx (as defined before)
import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Reusable Progress Bar (put in components/ProgressBar.tsx)
// Use standard View with className

export const ProgressBar = ({ progress, offset = 0 }: { progress: number; offset?: number }) => ( // progress is 0 to 1
    <View className="bg-gray-100 rounded-full h-1" style={{ width: `${100 - offset}%`}}>
        {/* Use LinearGradient for the actual gradient or a simple color */}
        {/* <LinearGradient
            colors={['#FF9A9E', '#FAD0C4']} // Gradient colors
            className="h-1 rounded-full"
            style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} // Ensure progress is between 0 and 1
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }} // Horizontal gradient
        /> */}
        {/* Simple pink color for now: */}
        <View
            className="bg-pink-400 h-1 rounded-full"
            style={{ width: `${progress * 100}%` }}
        />
    </View>
);