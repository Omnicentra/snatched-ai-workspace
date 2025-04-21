// components/MessageBubble.tsx
import React from 'react'
import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface MessageBubbleProps {
    message: string
    isUser: boolean
    children?: React.ReactNode // For embedding cards etc.
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isUser,
    children
}) => {
    const bubbleStyle = 'p-3 max-w-[80%] rounded-2xl'
    const userStyle = 'bg-gray-100 rounded-br-md self-end'
    const coachStyle = 'rounded-bl-md self-start' // Gradient handled below

    if (isUser) {
        return (
            <View className={`${bubbleStyle} ${userStyle}`}>
                <Text className="font-inter text-sm text-black">{message}</Text>
                {children}
            </View>
        )
    } else {
        return (
            <LinearGradient
                colors={['#FF9A9E', '#FAD0C4']}
                className={`${bubbleStyle} ${coachStyle}`}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text className="font-inter text-sm text-white">{message}</Text>
                {children}
            </LinearGradient>
        )
    }
}
