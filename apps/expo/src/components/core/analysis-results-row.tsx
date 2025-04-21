// components/AnalysisResultRow.tsx
import React from 'react';
import { View, Text } from 'react-native';
import * as Progress from 'react-native-progress'; // Or use custom ProgressBar

interface AnalysisResultRowProps {
  emoji: string;
  label: string;
  score: number; // e.g., 8
  maxScore?: number; // e.g., 10
}

export const AnalysisResultRow: React.FC<AnalysisResultRowProps> = ({
  emoji,
  label,
  score,
  maxScore = 10,
}) => {
  const progress = score / maxScore;

  return (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
      <View className="flex-row items-center flex-1 mr-2">
         <Text className="text-lg mr-2">{emoji}</Text>
         <Text className="text-black font-inter-medium text-sm">{label}</Text>
      </View>
      <View className="flex-row items-center">
         {/* Progress Bar - Choose one implementation */}
         {/* Option 1: react-native-progress */}
         <Progress.Bar
             progress={progress}
             width={80} // Adjust width
             height={4}
             color="#FF9A9E"
             unfilledColor="#F3F4F6"
             borderColor="transparent"
             borderRadius={2}
             className="mr-2"
         />
         {/* Option 2: Custom component (if you made one) */}
         {/* <View className="w-20 h-1 bg-gray-200 rounded-full mr-2 overflow-hidden">
           <View className="bg-pink-400 h-1 rounded-full" style={{ width: `${progress * 100}%` }} />
         </View> */}

         <View className="bg-pink-100 border border-pink-200 rounded-full py-0.5 px-2">
            <Text className="text-pink-600 text-xs font-inter-bold">{score}/{maxScore}</Text>
         </View>
      </View>
    </View>
  );
};