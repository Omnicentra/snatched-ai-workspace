// components/SliderComponent.tsx (Requires @react-native-community/slider)
import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';

interface SliderComponentProps {
    label: string;
    valueLabel: string;
    minValueLabel?: string;
    maxValueLabel?: string;
    value: number; // 0 to 100
    onValueChange: (value: number) => void;
}

export const SliderComponent: React.FC<SliderComponentProps> = ({
    label, valueLabel, minValueLabel="Natural", maxValueLabel="Defined", value, onValueChange
}) => {
    return (
         <View>
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-black font-inter-medium">{label}</Text>
                <Text className="text-black text-sm">{valueLabel}</Text>
            </View>
            <View className="flex-row items-center">
                 {minValueLabel && <Text className="text-black text-xs mr-3">{minValueLabel}</Text>}
                <Slider
                    style={{ flex: 1, height: 40 }}
                    minimumValue={0}
                    maximumValue={100}
                    value={value}
                    onValueChange={onValueChange} // Continuous updates
                    // onSlidingComplete={onValueChange} // Updates only on release
                    minimumTrackTintColor="#F6ADCE" // Start of gradient
                    maximumTrackTintColor="#FED0E2" // End of gradient (or use gray)
                    thumbTintColor="#f472b6" // Thumb color
                    // thumbImage={require('../assets/thumb.png')} // Optional custom thumb
                />
                {maxValueLabel && <Text className="text-black text-xs ml-3">{maxValueLabel}</Text>}
            </View>
        </View>
    );
};