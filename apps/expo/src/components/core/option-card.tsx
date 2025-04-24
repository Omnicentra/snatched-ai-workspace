// components/OptionCard.tsx (Generic card for selections)
import React from 'react'
import { Text, View, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

interface OptionCardProps {
  text: string
  description?: string
  selected: boolean
  onPress: () => void
  icon?: React.ReactNode // Optional icon element
  emoji?: string
  iconBg?: string
  testID?: string
  hideCheckmark?: boolean // Add testID prop
}

export const OptionCard: React.FC<OptionCardProps> = ({
  text,
  description,
  selected,
  onPress,
  icon,
  emoji,
  iconBg = 'bg-transparent', // Default background if icon/emoji present
  testID,
  hideCheckmark = false
}) => {
  return (
    <Pressable
      testID={testID} // Apply testID
      className={`flex-row items-center rounded-2xl border p-5 ${
        selected ? 'border-pink-400 bg-pink-50' : 'border-gray-100 bg-gray-50'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}

      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        onPress()
      }}
    >
      {icon && <View className={`${iconBg} mr-4 rounded-lg p-2`}>{icon}</View>}
      {emoji && (
        <View
          className={`mr-4 h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
        >
          <Text className="text-xl">{emoji}</Text>
        </View>
      )}
      <View className="flex-1">
        <Text
          className={`font-inter-medium ${selected ? 'text-pink-600' : 'text-black'
            }`}
        >
          {text}
        </Text>
        {description && (
          <Text className="mt-1 text-sm text-gray-600">{description}</Text>
        )}
      </View>
      {!hideCheckmark && selected && (
        <View className="ml-2">
          <View className="rounded-full bg-pink-400 p-1">
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        </View>
      )}
    </Pressable>
  )
}
