// components/StyledButton.tsx
import React, { useEffect } from 'react'
import {
    Pressable,
    Text,
    ActivityIndicator,
    ViewStyle,
    View,
    StyleProp
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics';
import { cn } from '@/lib/utils'
import { onboardingStore$ } from '@/stores/onboarding.store';
import { usePathname } from 'expo-router';
interface StyledButtonProps {
    onPress: () => void
    title: string
    variant?: 'primary' | 'secondary' | 'gradient' | 'ghost'
    disabled?: boolean
    loading?: boolean
    icon?: React.ReactNode
    style?: StyleProp<ViewStyle>
    testID?: string // Add testI
    className?: string
}

export const StyledButton: React.FC<StyledButtonProps> = ({
    onPress,
    title,
    variant = 'primary',
    disabled = false,
    loading = false,
    icon,
    style,
    testID,
    className = ''
}) => {
    const pathname = usePathname();

    useEffect(() => {
        console.log(JSON.stringify(onboardingStore$.onboarding, null, 2));
    }, [pathname])

    const baseClasses =
        'w-full py-5 px-6 rounded-full shadow-md flex-row items-center justify-center'
    const baseStyles: StyleProp<ViewStyle> = {
        borderRadius: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 16,
        width: '100%',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)'
    }
    const disabledClasses = 'opacity-50'

    const getVariantClasses = () => {
        switch (variant) {
            case 'gradient':
                return 'text-white' // Handled by LinearGradient
            case 'secondary':
                return 'bg-gray-100'
            case 'ghost':
                return 'bg-transparent'
            case 'primary':
            default:
                return 'bg-pink-400'
        }
    }

    const getTextColor = () => {
        switch (variant) {
            case 'gradient':
            case 'primary':
                return 'text-white'
            case 'ghost':
                return 'text-gray-500'
            case 'secondary':
                return 'text-black'
            default:
                return 'text-white'
        }
    }

    if (variant === 'gradient') {
        return (
            <Pressable
                onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                    onPress()
                }}
                disabled={disabled || loading}
                style={style}
                testID={testID}
            >
                <LinearGradient
                    colors={
                        disabled || loading
                            ? ['#D1D5DB', '#E5E7EB']
                            : ['#f472b6', '#F6ADCE']
                    }
                    className={cn(
                        baseClasses,
                        disabled || (loading && disabledClasses),
                        className
                    )}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={baseStyles}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <View className='flex flex-row items-center gap-x-2'>
                            <Text
                                className={`text-center font-inter-semibold text-lg ${getTextColor()}`}
                            >
                                {title}
                            </Text>
                            {icon && <View className="mr-2">{icon}</View>}
                        </View>
                    )}
                </LinearGradient>
            </Pressable>
        )
    }

    return (
        <Pressable
            testID={testID} // Apply testID
            className={`${baseClasses} ${getVariantClasses()} ${disabled || loading ? disabledClasses : ''}`}
            onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                onPress()
            }}
            disabled={disabled || loading}
            style={style}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'secondary' ? 'black' : 'white'}
                />
            ) : (
                <>
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text
                        className={`text-center font-inter-semibold text-lg ${getTextColor()}`}
                    >
                        {title}
                    </Text>
                </>
            )}
        </Pressable>
    )
}
