// Similar to scan-front/side, adjust titles, progress, tips, and navigation target.
import React, { useState, useRef, useEffect } from 'react'
import {
  Text,
  View,
  Pressable,
  SafeAreaView,
  Alert,
  StyleSheet
} from 'react-native'
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import Svg, { Path } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { usePermissions } from 'expo-media-library'

// Import or define ProgressBar, Silhouette, CameraButton components

const ProgressBar = (
  { progress }: { progress: number } // Duplicated for brevity
) => (
  <View className="h-1 w-full rounded-full bg-gray-700">
    <View
      className="h-1 rounded-full bg-pink-400"
      style={{ width: `${progress * 100}%` }}
    />
  </View>
)
const Silhouette = () => (
  // Duplicated for brevity
  <Svg width="220" height="500" viewBox="0 0 220 500">
    <Path
      d="M110 120 C 140 120, 160 140, 160 170 C 160 190, 150 210, 130 220 C 140 225, 150 235, 150 250 C 150 270, 140 290, 130 310 C 125 320, 120 330, 120 340 C 120 350, 120 360, 120 370 C 120 380, 115 390, 110 400 C 105 390, 100 380, 100 370 C 100 360, 100 350, 100 340 C 100 330, 95 320, 90 310 C 80 290, 70 270, 70 250 C 70 235, 80 225, 90 220 C 70 210, 60 190, 60 170 C 60 140, 80 120, 110 120"
      stroke="white"
      strokeWidth="2"
      strokeDasharray="4"
      fill="none"
    />
  </Svg>
)
const CameraButton = (
  { onPress }: { onPress: () => void } // Duplicated for brevity
) => (
  <Pressable
    className="h-[70px] w-[70px] items-center justify-center rounded-full bg-white shadow-lg active:opacity-70"
    onPress={onPress}
  >
    {/* Add pulsing animation with Reanimated later */}
    <View className="h-[54px] w-[54px] rounded-full border-2 border-black" />
  </Pressable>
)

export default function ScanBackScreen() {
  const router = useRouter()
  const [type, setType] = useState<CameraType>('back')
  const [cameraPermission] = useCameraPermissions() // Assume permissions granted
  const [mediaPermission] = usePermissions()
  const cameraRef = useRef<CameraView>(null)

  const takePicture = async () => {
    if (!cameraRef.current || !mediaPermission?.granted) {
      Alert.alert('Error', 'Camera not ready or permissions missing.')
      return
    }
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 })
      console.log('Back Photo URI:', photo?.uri)
      // TODO: Store photo URI
      // TODO: Trigger analysis process (mocked for now)
      router.push('/(tabs)/home') // Navigate after final scan
    } catch (error) {
      console.error('Failed to take picture:', error)
      Alert.alert('Capture Failed', 'Could not take photo. Please try again.')
    }
  }

  if (!cameraPermission) return <View className="flex-1 bg-black" />
  // Assume permission granted from previous steps for simplicity here

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={type}
        ref={cameraRef}
        ratio="16:9"
      >
        <SafeAreaView
          style={{ paddingTop: Constants.statusBarHeight }}
          className="flex-1 justify-between"
        >
          {/* Top Section */}
          <View className="z-20 flex-row items-center justify-between px-6 pt-2">
            <Pressable
              onPress={() => router.back()}
              className="z-30 h-10 w-10 items-center justify-center rounded-full bg-black/50"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </Pressable>
            <View className="mx-4 flex-1">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-inter-medium text-xs text-white">
                  Back View
                </Text>
                <Text className="text-xs text-white">3 of 3</Text>
              </View>
              <ProgressBar progress={1} /> {/* Full progress */}
            </View>
            <View className="h-10 w-10" />
          </View>

          {/* Tip Card */}
          <View className="absolute left-6 right-6 top-24 z-20">
            <BlurView
              intensity={80}
              tint="light"
              className="overflow-hidden rounded-xl p-4"
            >
              <View className="flex-row items-start">
                <View className="mr-3 mt-1 h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                  <Text className="text-lg text-black">💡</Text>
                </View>
                <View>
                  <Text className="mb-1 font-inter-semibold text-sm text-black">
                    Back View Tips
                  </Text>
                  <Text className="font-inter text-xs text-black">
                    • Stand with your back to the camera
                  </Text>
                  <Text className="font-inter text-xs text-black">
                    • Feet shoulder-width apart
                  </Text>
                  <Text className="font-inter text-xs text-black">
                    • Arms relaxed at your sides
                  </Text>
                  <Text className="font-inter text-xs text-black">
                    • Stand up straight
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Silhouette */}
          <View className="pointer-events-none absolute inset-0 z-10 items-center justify-center">
            <Silhouette />
          </View>

          {/* Almost done message */}
          <View className="absolute bottom-28 left-6 right-6 z-20">
            <BlurView
              intensity={50}
              tint="dark"
              className="items-center justify-center overflow-hidden rounded-lg p-3"
            >
              <Text className="font-inter-medium text-sm text-white">
                Almost done! Last photo needed
              </Text>
            </BlurView>
          </View>

          {/* Controls */}
          <View className="z-20 items-center pb-10">
            {/* Add pulsing animation later */}
            <CameraButton onPress={takePicture} />
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  )
}
