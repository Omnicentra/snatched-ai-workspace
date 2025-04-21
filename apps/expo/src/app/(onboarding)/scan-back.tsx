// app/(onboarding)/scan-back.tsx
// Similar to scan-front/side, adjust titles, progress, tips, and navigation target.
import React, { useState, useRef, useEffect } from 'react'
import {
  Text,
  View,
  Pressable,
  SafeAreaView,
  Alert,
  StyleSheet,
  useWindowDimensions
} from 'react-native'
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera'
import * as MediaLibrary from 'expo-media-library'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import Svg, { Path } from 'react-native-svg'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import { usePermissions } from 'expo-media-library'
import sillhouetteBack from '@/assets/images/silhouette-back.png'
import * as ImagePicker from 'expo-image-picker'

// Import or define ProgressBar, Silhouette, CameraButton components

const ProgressBar = ({ progress }: { progress: number }) => (
  <View className="h-1 w-full rounded-full bg-gray-700">
    <View
      className="h-1 rounded-full bg-pink-400"
      style={{ width: `${progress * 100}%` }}
    />
  </View>
)

const Silhouette = () => {
  const { height: HEIGHT } = useWindowDimensions()
  return (
    <Image
      // source="https://picsum.photos/seed/696/3000/2000"
      source={sillhouetteBack}
      style={{ height: HEIGHT - 400, width: 200 }}
      contentFit="cover"
      className="h-full w-full"
      transition={300}
    />
  )
}

const CameraButton = ({
  onPress,
  isRetake
}: {
  onPress: () => void
  isRetake?: boolean
}) => (
  <Pressable
    className="h-[70px] w-[70px] items-center justify-center rounded-full bg-white shadow-lg active:opacity-70"
    onPress={onPress}
  >
    {isRetake ? (
      <Ionicons name="refresh" size={30} color="black" />
    ) : (
      <View className="h-[54px] w-[54px] rounded-full border-2 border-black" />
    )}
  </Pressable>
)

// Reusable Control Button
const ControlButton = ({ onPress, icon }: { onPress: () => void; icon: React.ReactNode }) => (
  <Pressable
    className="h-12 w-12 items-center justify-center rounded-full bg-black/50"
    onPress={onPress}
  >
    {icon}
  </Pressable>
)

export default function ScanBackScreen() {
  const router = useRouter()
  const [type, setType] = useState<CameraType>('back')
  const [cameraPermission] = useCameraPermissions()
  const [mediaPermission] = MediaLibrary.usePermissions()
  const cameraRef = useRef<CameraView>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const countdownRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [])

  const startCountdown = () => {
    setCountdown(5)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownRef.current)
          takePicture()
          return null
        }
        return prev ? prev - 1 : null
      })
    }, 1000)
  }

  const takePicture = async () => {
    if (!cameraRef.current || !mediaPermission?.granted) {
      Alert.alert('Error', 'Camera not ready or permissions missing.')
      return
    }
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 })
      if (photo?.uri) {
        setCapturedImage(photo.uri)
      }
    } catch (error) {
      console.error('Failed to take picture:', error)
      Alert.alert('Capture Failed', 'Could not take photo. Please try again.')
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
  }

  const handleContinue = () => {
    if (capturedImage) {
      router.push('/(onboarding)/desired-shape')
    }
  }

  const handleCameraFlip = () => {
    setType(current => (current === 'front' ? 'back' : 'front'))
  }

  const handleGalleryUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.7,
      })

      const uri = result.assets?.[0]?.uri
      if (!result.canceled && uri) {
        setCapturedImage(uri)
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image from gallery.')
    }
  }

  if (!cameraPermission) return <View className="flex-1 bg-black" />

  return (
    <View className="flex-1 bg-black/20">
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
              <ProgressBar progress={1} />
            </View>
          </View>

          {/* Countdown Display */}
          {countdown && (
            <View className="absolute inset-0 z-30 items-center justify-center">
              <Text className="text-8xl font-bold text-white">{countdown}</Text>
            </View>
          )}

          {/* Tip Card */}
          {!capturedImage && (
            <View className="absolute left-6 right-6 top-32 z-20">
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
          )}

          {/* Silhouette */}
          {!capturedImage && (
            <View className="pointer-events-none absolute inset-0 top-20 z-10 items-center justify-center">
              <Silhouette />
            </View>
          )}

          {/* Preview Image Layer */}
          {capturedImage && (
            <View className="absolute inset-0 z-10">
              <Image
                source={{ uri: capturedImage }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            </View>
          )}

          {/* Almost done message */}
          {!capturedImage && (
            <View className="absolute bottom-40 left-6 right-6 z-20">
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
          )}

          {/* Bottom Controls */}
          <View className="absolute bottom-0 right-0 left-0 z-20 flex-row items-center justify-center gap-x-8 pb-10" style={{ elevation: 10 }}>
            {capturedImage ? (
              <>
                <CameraButton onPress={handleRetake} isRetake />
                <Pressable
                  onPress={handleContinue}
                  className="h-[70px] items-center justify-center rounded-full bg-pink-400 px-8"
                >
                  <Text className="font-inter-medium text-lg text-white">
                    Continue
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <ControlButton
                  onPress={handleCameraFlip}
                  icon={<MaterialCommunityIcons name="camera-flip" size={24} color="white" />}
                />
                <CameraButton onPress={startCountdown} />
                <ControlButton
                  onPress={handleGalleryUpload}
                  icon={<MaterialCommunityIcons name="image" size={24} color="white" />}
                />
              </>
            )}
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  )
}
