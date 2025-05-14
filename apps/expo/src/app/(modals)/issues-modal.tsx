import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback } from 'react'
import {
  Dimensions,
  Text,
  View,
  TouchableOpacity
} from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView
} from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.1

interface IssuesModalProps {
  isVisible: boolean
  onClose: () => void
  issues: (string | null)[]
}

export const IssuesModal: React.FC<IssuesModalProps> = ({
  isVisible,
  onClose,
  issues
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
    }
  })

  if (!isVisible) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="absolute inset-0 bg-black/30">
        <GestureDetector gesture={gesture}>
          <Animated.View 
            className="absolute bottom-0 w-full overflow-hidden rounded-t-3xl"
            style={[rBottomSheetStyle]}
          >
            <LinearGradient
              colors={['#FDF2F8', '#FCE7F3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: '100%', height: '100%' }}
            >
              <View className="px-6 pb-12 pt-4">
                <View className="mb-6 items-center">
                  <View className="h-1.5 w-16 rounded-full bg-gray-300/50" />
                </View>
                
                <View className="mb-8 flex-row items-center justify-between">
                  <View>
                    <Text className="font-inter-bold text-xl text-gray-800">
                      Areas for Improvement
                    </Text>
                    <Text className="mt-1 font-inter text-sm text-gray-500">
                      Focus on these areas to achieve your goals
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={onClose}
                    className="rounded-full bg-gray-100 p-2"
                  >
                    <Text className="text-gray-600">✕</Text>
                  </TouchableOpacity>
                </View>

                <View className="gap-y-4">
                  {issues.map((issue, index) => (
                    issue ? (
                      <View key={index} className="flex-row items-start">
                        <Text className="mr-2 font-inter-bold text-pink-500">
                          {index + 1}.
                        </Text>
                        <Text className="flex-1 font-inter-medium text-gray-700">
                          {issue}
                        </Text>
                      </View>
                    ) : null
                  ))}
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  className="mt-8 rounded-xl bg-pink-500 p-4"
                >
                  <Text className="text-center font-inter-bold text-white">
                    Got it
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  )
} 