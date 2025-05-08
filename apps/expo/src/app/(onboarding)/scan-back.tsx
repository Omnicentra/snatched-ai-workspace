// app/(onboarding)/scan-back.tsx
// Similar to scan-front/side, adjust titles, progress, tips, and navigation target.
import sillhouetteBack from '@/assets/images/silhouette-back.png'
import { getOrCreateDeviceId } from '@/utils/device-id'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import type { CameraType} from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera'
import Constants from 'expo-constants'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native'
import { onboardingStore$ } from '@/stores/onboarding.store'
import { api } from '@/utils/api'
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay
} from 'react-native-reanimated'

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

// Loading animation components
function LoadingDot({ delay }: { delay: number }) {
  const dotStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withDelay(delay,
          withTiming(0.2, { duration: 500 })
        ),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    )
  }));

  return (
    <AnimatedIcon
      name="circle"
      size={12}
      color="white"
      style={dotStyle}
    />
  );
}

function LoadingDots() {
  return (
    <View className="flex-row gap-x-2">
      {[0, 1, 2].map((i) => (
        <LoadingDot key={i} delay={i * 200} />
      ))}
    </View>
  );
}

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
  const [isUploading, setIsUploading] = useState(false)
  const countdownRef = useRef<NodeJS.Timeout>()
  
  // Get the mutations from tRPC
  const generatePhotoUploadUrl = api.user.generatePhotoUploadUrl.useMutation();
  const validateUploadedImage = api.user.validateUploadedImage.useMutation();

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [])

  // Direct upload to S3 using the presigned URL
  const uploadToS3 = async (uri: string, presignedUrl: string): Promise<boolean> => {
    try {
      // Get the blob from uri
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload directly to S3 using the presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': blob.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      return false;
    }
  };

  const startCountdown = () => {
    setCountdown(5)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownRef.current)
          void takePicture()
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
      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.7,
        exif: true
      });

      if (photo?.uri) {
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error('Failed to take picture:', error)
      Alert.alert('Capture Failed', 'Could not take photo. Please try again.')
    }
  }

  const handlePhotoUpload = async (uri: string, mimeType: string) => {
    setIsUploading(true);
    
    try {
      // Get or create device ID
      const deviceId = await getOrCreateDeviceId();
      
      // Generate presigned URL using tRPC
      const result = await generatePhotoUploadUrl.mutateAsync({
        deviceId,
        photoType: 'back', 
        fileType: mimeType,
      });
      
      // Upload directly to S3
      const uploadSuccess = await uploadToS3(uri, result.presignedUrl);
      
      if (uploadSuccess) {
        console.log('Upload successful');
        
        // Validate the uploaded image
        const validationResult = await validateUploadedImage.mutateAsync({
          imageKey: result.key,
        });

        if (!validationResult.isValid) {
          Alert.alert(
            'Invalid Image',
            validationResult.rejectionReason ?? 'The image does not meet our requirements. Please try again.',
            [
              { 
                text: 'Retake Photo',
                onPress: () => {
                  setCapturedImage(null);
                  setIsUploading(false);
                }
              }
            ]
          );
          return;
        }
        
        // Store the image key in LegendState
        onboardingStore$.onboarding.backViewPhoto.set(result.key);
        console.log('Stored image key in LegendState:', result.key);
        
        // Navigate to next screen
        router.push('/(onboarding)/desired-shape');
      } else {
        Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error in image upload process:', error);
      Alert.alert('Upload Error', 'An error occurred during the upload process.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null)
  }

  const handleContinue = () => {
    if (capturedImage) {
      void handlePhotoUpload(capturedImage, 'image/jpeg');
    }
  }

  const handleCameraFlip = () => {
    setType(current => (current === 'front' ? 'back' : 'front'))
  }

  const handleGalleryUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        aspect: [3, 4],
        quality: 0.7,
      })

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset) {
          setCapturedImage(asset.uri);
        }
      }
    } catch (error) {
      console.error('Failed to select image from gallery:', error)
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
            <View className="absolute inset-0 z-10 pointer-events-none">
              <Image
                source={{ uri: capturedImage }}
                style={[StyleSheet.absoluteFill, { transform: [{ scaleX: -1 }] }]}
                contentFit="cover"
              />
            </View>
          )}

          {/* Loading Indicator */}
          {isUploading && (
            <View className="absolute inset-0 z-40 items-center justify-center bg-black/30">
              <BlurView
                intensity={40}
                tint="dark"
                className="items-center justify-center overflow-hidden rounded-xl p-6"
              >
                <Text className="mb-4 font-inter-semibold text-white">Uploading Image</Text>
                <LoadingDots />
              </BlurView>
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
          <View 
            className="absolute bottom-0 right-0 left-0 z-50 flex-row items-center justify-center gap-x-8 pb-10" 
            style={{ 
              elevation: 10,
              zIndex: 50,
              position: 'absolute',
              bottom: 0
            }}
          >
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
