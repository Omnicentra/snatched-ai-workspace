import React, { useState, useRef, useEffect } from 'react'
import {
  Text,
  View,
  Pressable,
  SafeAreaView,
  Alert,
  StyleSheet,
  useWindowDimensions,
  Linking,
} from 'react-native' // Added Alert, StyleSheet, Linking
// No 'styled' import
import type { CameraType} from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import sillhouetteFront from '@/assets/images/silhouette-front.png';
import * as ImagePicker from 'expo-image-picker';
import { getOrCreateDeviceId } from '@/utils/device-id';
import { onboardingStore$ } from '@/stores/onboarding.store';
import { api } from '@/utils/api';

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
const Silhouette = () => {
  const { height: HEIGHT } = useWindowDimensions();
  return (
    <Image
      // source="https://picsum.photos/seed/696/3000/2000"
      source={sillhouetteFront}
      style={{ height: HEIGHT- 400, width: 200 }}
      contentFit="cover"
      className="h-full w-full"
      transition={300} />
  );
}

// Reusable Camera Button
const CameraButton = ({ onPress, isRetake }: { onPress: () => void, isRetake?: boolean }) => (
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

export default function ScanFrontScreen() {
  const router = useRouter()
  const [type, setType] = useState<CameraType>('back')
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [mediaPermission, requestMediaPermission] =
    MediaLibrary.usePermissions()
  const cameraRef = useRef<CameraView>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const countdownRef = useRef<NodeJS.Timeout>()
  
  // Get the mutation from tRPC
  const generatePhotoUploadUrl = api.user.generatePhotoUploadUrl.useMutation();

  useEffect(() => {
    // Request permissions on mount
    void requestCameraPermission()
    void requestMediaPermission()
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
          void takePicture()
          return null
        }
        return prev ? prev - 1 : null
      })
    }, 1000)
  }

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
          { text: 'Grant Permission', onPress: () => void requestMediaPermission() }
        ]
      )
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
        photoType: 'front', 
        fileType: mimeType,
      });
      
      // Upload directly to S3
      const uploadSuccess = await uploadToS3(uri, result.presignedUrl);
      
      if (uploadSuccess) {
        console.log('Upload successful');
        
        // Store the image key in LegendState
        onboardingStore$.onboarding.frontViewPhoto.set(result.key);
        console.log('Stored image key in LegendState:', result.key);
        
        // Navigate to next screen
        router.push('/(onboarding)/scan-side');
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
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset) {
          setCapturedImage(asset.uri);
        }
      }
    } catch (error) {
      console.error('Failed to select image from gallery:', error);
      Alert.alert('Error', 'Failed to select image from gallery.');
    }
  };

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
          onPress={async () => {
            const permission = await requestCameraPermission();
            if (!permission.granted) {
              Alert.alert(
                'Permission Required',
                'Please enable camera access in your device settings to use this feature.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Open Settings', 
                    onPress: () => void Linking.openSettings() 
                  }
                ]
              );
            }
          }}
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
    <View className="flex-1 bg-black/20">
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
          {/* Top Section: Progress, Back Button, and Camera Controls */}
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
          </View>

          {/* Countdown Display */}
          {countdown && (
            <View className="absolute inset-0 z-30 items-center justify-center">
              <Text className="text-8xl font-bold text-white">{countdown}</Text>
            </View>
          )}

          {/* Tip Card - positioned absolutely */}
          {!capturedImage && (
            <View className="absolute left-6 right-6 top-32 z-20">
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
          )}

          {/* Silhouette - Centered */}
          {!capturedImage && (
            <View className="pointer-events-none absolute inset-0 z-10 items-center justify-center top-20">
              <Silhouette />
            </View>
          )}

          {/* Preview Image */}
          {capturedImage && (
            <View className="absolute inset-0 z-10">
              <Image
                source={{ uri: capturedImage }}
                style={StyleSheet.absoluteFill}
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
                <MaterialCommunityIcons name="upload" size={32} color="white" />
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
                  className="h-[70px] px-8 items-center justify-center rounded-full bg-pink-400"
                >
                  <Text className="font-inter-medium text-white">Continue</Text>
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
