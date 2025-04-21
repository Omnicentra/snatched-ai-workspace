import React, { useState, useRef, useEffect } from 'react'
import {
  Text,
  View,
  Pressable,
  SafeAreaView,
  Alert,
  StyleSheet
} from 'react-native' // Added Alert, StyleSheet
// No 'styled' import
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import Svg, { Path } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'

// Reusable Progress Bar (Import or define as before using View)
const ProgressBar = ({ progress }: { progress: number }) => (
  <View className="h-1 w-full rounded-full bg-gray-700">
    {/* Use LinearGradient or simple color */}
    <View
      className="h-1 rounded-full bg-pink-400"
      style={{ width: `${progress * 100}%` }}
    />
  </View>
)

// Simplified Silhouette
const Silhouette = () => (
  <Svg width="220" height="500" viewBox="0 0 220 500">
    <Path
      d="M110 120 C 140 120, 160 140, 160 170 C 160 190, 150 210, 130 220 C 140 225, 150 235, 150 250 C 150 270, 140 290, 130 310 C 125 320, 120 330, 120 340 C 120 350, 120 360, 120 370 C 120 380, 115 390, 110 400 C 105 390, 100 380, 100 370 C 100 360, 100 350, 100 340 C 100 330, 95 320, 90 310 C 80 290, 70 270, 70 250 C 70 235, 80 225, 90 220 C 70 210, 60 190, 60 170 C 60 140, 80 120, 110 120"
      stroke="white"
      strokeWidth="2"
      strokeDasharray="4" // Animation for dash requires Reanimated/Animated API
      fill="none"
    />
  </Svg>
)

// Reusable Camera Button
const CameraButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable
    className="h-[70px] w-[70px] items-center justify-center rounded-full bg-white shadow-lg active:opacity-70"
    onPress={onPress}
  >
    <View className="h-[54px] w-[54px] rounded-full border-2 border-black" />{' '}
    {/* Use border-2/border-4 etc */}
  </Pressable>
)

export default function ScanFrontScreen() {
  const router = useRouter()
  const [type, setType] = useState<CameraType>('back')
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions()
  const cameraRef = useRef<CameraView>(null)

  useEffect(() => {
    // Request permissions on mount
    requestCameraPermission()
    requestMediaPermission()
  }, [])

  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Error', 'Camera not available.')
      return
    }
    if (!mediaPermission?.granted) {
      Alert.alert(
        'Permission Required',
        'Please grant media library permission to save photos.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: requestMediaPermission }
        ]
      )
      return
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 }) // Add quality option
      console.log('Photo URI:', photo?.uri)
      // TODO: Store photo URI (e.g., in Zustand store or pass via params if small enough - unlikely)
      // Consider saving to a temporary location managed by expo-file-system if not saving to library
      // await MediaLibrary.saveToLibraryAsync(photo.uri); // Optional save
      router.push('/(modals)/progress-side')
    } catch (error) {
      console.error('Failed to take picture:', error)
      Alert.alert('Capture Failed', 'Could not take photo. Please try again.')
    }
  }

  if (!cameraPermission) {
    return <View className="flex-1 bg-black" /> // Loading state
  }

  if (!cameraPermission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black p-5">
        <Text className="mb-5 text-center font-inter text-white">
          We need your permission to use the camera.
        </Text>
        <Pressable
          onPress={requestCameraPermission}
          className="rounded-lg bg-white px-5 py-3"
        >
          <Text className="font-inter-medium text-black">
            Grant Camera Permission
          </Text>
        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFill}
        ref={cameraRef}
        ratio="16:9"
        facing={type}
      >
        {/* Overlay uses SafeAreaView for status bar handling */}
        <SafeAreaView
          style={{ paddingTop: Constants.statusBarHeight }}
          className="flex-1 justify-between"
        >
          {/* Top Section: Progress & Back Button */}
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
                  Front View
                </Text>
                <Text className="text-xs text-white">1 of 3</Text>
              </View>
              <ProgressBar progress={1 / 3} />
            </View>
            <View className="h-10 w-10" /> {/* Spacer to balance */}
          </View>

          {/* Tip Card - positioned absolutely */}
          <View className="absolute left-6 right-6 top-24 z-20">
            <BlurView
              intensity={80}
              tint="light"
              className="overflow-hidden rounded-xl p-4"
            >
              <View className="flex-row items-start">
                <View className="mr-3 mt-1 h-8 w-8 items-center justify-center rounded-full bg-pink-100">
                  <Text className="text-lg text-black">💡</Text>
                </View>
                <View>
                  <Text className="mb-1 font-inter-semibold text-sm text-black">
                    Front View Tips
                  </Text>
                  <Text className="font-inter text-xs text-black">
                    • Stand with feet shoulder-width apart
                  </Text>
                  <Text className="font-inter text-xs text-black">
                    • Arms relaxed at your sides
                  </Text>
                  <Text className="font-inter text-xs text-black">
                    • Face the camera directly
                  </Text>
                  <Text className="font-inter text-xs text-black">
                    • Wear form-fitting clothes
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Silhouette - Centered */}
          <View className="pointer-events-none absolute inset-0 z-10 items-center justify-center">
            <Silhouette />
          </View>

          {/* Bottom Controls */}
          <View className="z-20 items-center pb-10">
            <CameraButton onPress={takePicture} />
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  )
}
