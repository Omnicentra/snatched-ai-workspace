// components/SettingItem.tsx
import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface SettingItemProps {
    icon: React.ReactNode
    label: string
    value?: string | React.ReactNode
    onPress?: () => void
    iconBg?: string
}

export const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    label,
    value,
    onPress,
    iconBg = 'bg-gray-100'
}) => {
    return (
        <Pressable
            onPress={onPress}
            className="flex-row items-center justify-between rounded-xl p-3 active:bg-gray-50" // Add active state
        >
            <View className="flex-row items-center">
                <View
                    className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}
                >
                    {icon}
                </View>
                <Text className="font-inter text-sm text-black">{label}</Text>
            </View>
            <View className="flex-row items-center">
                {typeof value === 'string' ? (
                    <Text className="mr-2 text-xs text-gray-500">{value}</Text>
                ) : (
                    value
                )}
                {onPress && (
                    <Ionicons
                        name="chevron-forward-outline"
                        size={18}
                        color="rgb(156 163 175)" /* gray-400 */
                    />
                )}
            </View>
        </Pressable>
    )
}
