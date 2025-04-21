// Similar structure to scan-front.tsx, just change titles, progress, tips, and navigation target.
import React, { useState, useRef, useEffect } from 'react'
import {
  Text,
  View,
  Pressable,
  SafeAreaView,
  Alert,
  StyleSheet
} from 'react-native'
import { CameraType, CameraView } from 'expo-camera'
import {
  PermissionStatus,
  usePermissions,
  getPermissionsAsync
} from 'expo-media-library'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import Svg, { Path } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'

// Import or define ProgressBar, Silhouette, CameraButton components as in scan-front.tsx

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
  // Duplicated for brevity - Use shared component
  <Svg width="220" height="500" viewBox="0 0 220 500">
    <Path
      d="M110 120 C 130 120, 150 130, 160 150 C 165 160, 170 170, 170 180 C 170 190, 165 200, 160 210 C 155 220, 150 230, 145 240 C 140 250, 135 260, 130 270 C 125 280, 120 290, 120 300 C 120 310, 120 320, 120 330 C 120 340, 120 350, 120 360 C 120 370, 115 380, 110 390 C 105 380, 100 370, 100 360 C 100 350, 100 340, 100 330 C 100 320, 100 310, 100 300 C 100 290, 95 280, 90 270 C 85 260, 80 250, 75 240 C 70 230, 65 220, 60 210 C 55 200, 50 190, 50 180 C 50 170, 55 160, 60 150 C 70 130, 90 120, 110 120"
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
    <View className="h-[54px] w-[54px] rounded-full border-2 border-black" />
  </Pressable>
)

export default function ScanSideScreen() {
  const router = useRouter()
  const [type, setType] = useState<CameraType>('back')
  const [cameraPermission, setCameraPermission] =
    useState<PermissionStatus | null>(null)
  const [mediaPermission, requestMediaPermission] = usePermissions()
  const cameraRef = useRef<CameraView>(null)

  useEffect(() => {
    // Permissions likely already requested, but good practice to check/request if needed
    if (cameraPermission !== PermissionStatus.GRANTED) {
      getPermissionsAsync().then((p) => {
        setCameraPermission(p.status)
      })
    }
    if (!mediaPermission?.granted) requestMediaPermission()
  }, [])

  const takePicture = async () => {
    if (!cameraRef.current || !mediaPermission?.granted) {
      Alert.alert('Error', 'Camera not ready or permissions missing.')
      return
    }
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 })
      console.log('Side Photo URI:', photo?.uri)
      // TODO: Store photo URI
      router.push('/(modals)/progress-back') // Navigate to BACK scan
    } catch (error) {
      console.error('Failed to take picture:', error)
      Alert.alert('Capture Failed', 'Could not take photo. Please try again.')
    }
  }

  if (!cameraPermission) return <View className="flex-1 bg-black" />
  if (cameraPermission !== PermissionStatus.GRANTED)
    return (
      <View className="flex-1 bg-black">
        <Text>Camera permission not granted</Text>
      </View>
    )

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFill}
        ref={cameraRef}
        ratio="16:9"
        facing={type}
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
                  Side View
                </Text>
                <Text className="text-xs text-white">2 of 3</Text>
              </View>
              <ProgressBar progress={2 / 3} />
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
                <View className="mr-3 mt-1 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Text className="text-lg text-black">💡</Text>
                </View>
                <View>
                  <Text className="mb-1 font-inter-semibold text-sm text-black">
                    Side View Tips
                  </Text>
                  <Text className="font-inter text-xs text-black">
                    • Stand with your right side to the camera
                  </Text>
                  <Text className="font-inter text-xs text-black">
                    • Keep your back straight
                  </Text>
                  <Text className="font-inter text-xs text-black">
                    • Arms relaxed at your sides
                  </Text>
                  <Text className="font-inter text-xs text-black">
                    • Look straight ahead
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Silhouette */}
          <View className="pointer-events-none absolute inset-0 z-10 items-center justify-center">
            <Silhouette />
          </View>

          {/* Controls */}
          <View className="z-20 items-center pb-10">
            <CameraButton onPress={takePicture} />
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  )
}
