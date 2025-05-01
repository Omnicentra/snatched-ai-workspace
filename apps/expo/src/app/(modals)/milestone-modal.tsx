import React, { useCallback } from 'react'
import {
  View,
  Text,
  Modal,
  Dimensions
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS
} from 'react-native-reanimated'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from 'react-native-gesture-handler'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.3

interface MilestoneModalProps {
  isVisible: boolean
  onClose: () => void
  currentDay: number
  totalDays: number
  emoji: string
  accentColor: string
  type: 'nutrition' | 'workout'
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isVisible,
  onClose,
  currentDay,
  totalDays,
  emoji,
  accentColor,
  type
}) => {
  const translateY = useSharedValue(0)
  const context = useSharedValue({ y: 0 })

  const scrollTo = useCallback((destination: number) => {
    'worklet';
    translateY.value = withSpring(destination, { damping: 50 })
  }, [])

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value }
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y)
    })
    .onEnd((event) => {
      if (event.velocityY > 500) {
        runOnJS(onClose)()
      } else {
        const shouldClose = translateY.value > SCREEN_HEIGHT * 0.3
        if (shouldClose) {
          runOnJS(onClose)()
        } else {
          scrollTo(0)
        }
      }
    })

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      height: SCREEN_HEIGHT,
      top: SCREEN_HEIGHT * 0.7,
    }
  })

  const days = Array.from({ length: totalDays }, (_, i) => i + 1)
  const midPoint = Math.floor(days.length / 2)
  const firstRow = days.slice(0, midPoint)
  const secondRow = days.slice(midPoint).reverse()

  const renderDay = (day: number) => {
    const isCompleted = day < currentDay
    const isActive = day === currentDay

    return (
      <View key={day} className="items-center">
        <View 
          className={`relative h-14 w-14 items-center justify-center rounded-full ${
            isActive ? 'border-2 border-dashed bg-white' : 
            isCompleted ? '' : 'bg-white border border-gray-100'
          }`}
          style={{
            borderColor: accentColor,
            backgroundColor: isCompleted ? accentColor : 'white'
          }}
        >
          {isCompleted && day === 1 && (
            <Text className="text-xl">{emoji}</Text>
          )}
          {isCompleted && day === totalDays && (
            <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
          )}
          {!isCompleted && !isActive && (
            <Text className="font-inter-medium text-sm text-gray-400">
              {day}
            </Text>
          )}
          {isActive && (
            <Text className="text-xl">{emoji}</Text>
          )}
        </View>
      </View>
    )
  }

  const getContextualContent = () => {
    if (type === 'nutrition') {
      return {
        title: 'Nutrition Progress',
        subtitle: 'Building healthy eating habits!',
        goalTitle: "Today's Nutrition Goal",
        goalDescription: 'Complete your daily macro targets and log all meals to maintain your streak!'
      }
    }
    return {
      title: 'Workout Progress',
      subtitle: 'Crushing those fitness goals!',
      goalTitle: "Today's Workout Goal",
      goalDescription: 'Complete your scheduled workout and track your progress to keep the momentum going!'
    }
  }

  const content = getContextualContent()

  if (!isVisible) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-black/30">
          <GestureDetector gesture={gesture}>
            <Animated.View 
              className="absolute w-full overflow-hidden rounded-t-3xl bg-white"
              style={[rBottomSheetStyle]}
            >
              <LinearGradient
                colors={['#FDF2F8', '#FCE7F3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: '100%',
                  width: '100%'
                }}
              >
                <View className="h-full px-6 pb-12 pt-4">
                  <View className="mb-6 items-center">
                    <View className="h-1.5 w-16 rounded-full bg-gray-300/50" />
                  </View>
                  
                  <View className="mb-8 flex-row items-center justify-between">
                    <View>
                      <Text className="font-inter-medium text-base text-gray-600">
                        {content.title} {emoji}
                      </Text>
                      <Text className="mt-1 font-inter text-sm text-gray-500">
                        {content.subtitle}
                      </Text>
                    </View>
                    <Text className="font-inter-medium text-lg text-gray-900">
                      {currentDay}/{totalDays}
                    </Text>
                  </View>

                  <View className="mb-8 h-2 w-full overflow-hidden rounded-full bg-white/80">
                    <View 
                      className="h-full"
                      style={{ 
                        width: `${(currentDay / totalDays) * 100}%`,
                        backgroundColor: accentColor
                      }}
                    />
                  </View>

                  <View className="mt-8">
                    <View className="flex-row justify-between">
                      {firstRow.map((day) => renderDay(day))}
                    </View>
                    <View className="mt-8 flex-row justify-between">
                      {secondRow.map((day) => renderDay(day))}
                    </View>
                  </View>

                  <View className="mt-12 rounded-2xl bg-white/80 p-6 shadow-sm">
                    <Text className="font-inter-semibold text-lg text-gray-900">
                      {content.goalTitle}
                    </Text>
                    <Text className="mt-2 font-inter text-base text-gray-600">
                      {content.goalDescription}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </GestureDetector>
        </View>
      </Modal>
    </GestureHandlerRootView>
  )
} 