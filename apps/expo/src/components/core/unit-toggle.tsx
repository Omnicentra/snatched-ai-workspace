// components/UnitToggle.tsx
import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';

interface UnitToggleProps<T> {
  options: { label: string; value: T }[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

export function UnitToggle<T>({ options, selectedValue, onSelect }: UnitToggleProps<T>) {
  return (
    <View className="flex-row bg-gray-100 p-1 rounded-full self-start mb-8">
      {options.map((option, index) => (
        <Pressable
          key={index}
          className={`flex-1 py-2 px-4 rounded-full ${
            selectedValue === option.value ? 'bg-white shadow-sm' : ''
          }`}
          onPress={() => onSelect(option.value)}
        >
          <Text
            className={`text-center font-inter-medium text-sm ${
              selectedValue === option.value ? 'text-black' : 'text-gray-600'
            }`}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}