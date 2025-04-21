import React, { useState } from 'react'
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import Slider from '@react-native-community/slider' // Import slider
import { InfoCard, StyledButton } from '@/components/core' // Reusing components

// Placeholders
const currentShape =
  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
const goalShapeWeek4 =
  'https://images.unsplash.com/photo-1566241832378-917a0f30db2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' // Example image for week 4
const goalShapeWeek8 =
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80' // Example image for week 8

// Function to interpolate between images (basic opacity crossfade)
// In a real app, this might involve more complex AI image generation/selection
const getInterpolatedImage = (week: number) => {
  if (week <= 0) return currentShape
  if (week >= 8) return goalShapeWeek8
  if (week <= 4) return goalShapeWeek4 // Simple transition point
  return goalShapeWeek8 // Show final goal after midpoint
}

// Reusable Change Item Component
const ChangeItem = ({
  icon,
  title,
  changeText
}: {
  icon: React.ReactNode
  title: string
  changeText: string
}) => (
  <View className="mb-3 flex-row items-start">
    <View className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
      {icon}
    </View>
    <View>
      <Text className="font-inter-medium text-sm text-black">{title}</Text>
      <Text className="font-inter text-xs text-black">{changeText}</Text>
    </View>
  </View>
)

export default function VisualPreviewScreen() {
  const router = useRouter()
  const [selectedWeek, setSelectedWeek] = useState(4) // Initial slider value

  const handleUnlock = () => {
    console.log('Unlock Full Preview')
    // Navigate to paywall or similar
  }

  const expectedChanges = [
    {
      icon: <Ionicons name="hourglass-outline" size={16} color="black" />,
      title: 'Waist-to-Hip Ratio',
      changeText: `Current: 0.78  Week ${selectedWeek}: ${(0.78 - (selectedWeek / 8) * 0.06).toFixed(2)}  Goal: 0.72`
    }, // Example calculation
    {
      icon: <Ionicons name="analytics-outline" size={16} color="black" />,
      title: 'Glute Development',
      changeText: `Increased roundness and projection by Week ${selectedWeek > 4 ? 4 : selectedWeek}`
    }, // Placeholder text
    {
      icon: (
        <MaterialCommunityIcons
          name="arm-flex-outline"
          size={16}
          color="black"
        />
      ),
      title: 'Muscle Definition',
      changeText: `Visible toning in arms and legs by Week ${selectedWeek > 4 ? 4 : selectedWeek}`
    } // Placeholder text
  ]

  const projectedImageUrl = getInterpolatedImage(selectedWeek)

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* Custom Header */}
      <View className="flex-row items-center p-6">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </Pressable>
        <Text className="font-inter-bold text-xl text-black">
          Your Transformation
        </Text>
      </View>

      {/* Info Section */}
      <LinearGradient colors={['#f472b6', '#FED0E2']} className="w-full p-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-medium text-sm text-white">
              Premium Feature
            </Text>
            <Text className="font-inter-bold text-2xl text-white">
              Visual Preview
            </Text>
          </View>
          <View className="rounded-full bg-white/20 px-4 py-2">
            <Text className="font-inter-medium text-sm text-white">
              8-Week Journey
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 p-6">
        {/* Before/After Images */}
        <View className="mb-6 flex-row items-center justify-between">
          <View className="items-center">
            <Text className="mb-2 font-inter text-xs text-black">Current</Text>
            <View className="h-48 w-32 overflow-hidden rounded-xl bg-gray-100">
              <Image
                source={{ uri: currentShape }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
            <Text className="mt-2 font-inter text-xs text-black">Week 0</Text>
          </View>
          <Ionicons name="arrow-forward-outline" size={24} color="black" />
          <View className="items-center">
            <Text className="mb-2 font-inter text-xs text-black">
              Projected
            </Text>
            <View className="h-48 w-32 overflow-hidden rounded-xl bg-gray-100">
              <Image
                source={{ uri: projectedImageUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
            <Text className="mt-2 font-inter text-xs text-black">
              Week {selectedWeek}
            </Text>
          </View>
        </View>

        {/* Slider */}
        <View className="mb-8">
          <Text className="mb-2 font-inter text-sm text-black">
            Drag to see your progress over time
          </Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={8}
            step={1} // Snap to weeks
            value={selectedWeek}
            onValueChange={setSelectedWeek}
            minimumTrackTintColor="#FF9A9E"
            maximumTrackTintColor="#FAD0C4" // Or use gray like HTML: "#F3F4F6"
            thumbTintColor="#FF9A9E" // Default thumb color
            // renderThumbComponent={SliderThumb} // Use custom thumb component if needed
          />
          <View className="flex-row justify-between">
            <Text className="font-inter text-xs text-black">Week 0</Text>
            <Text className="font-inter text-xs text-black">Week 8</Text>
          </View>
        </View>

        {/* Expected Changes */}
        <Text className="mb-4 font-inter-medium text-black">
          Expected Changes (Week {selectedWeek})
        </Text>
        <View className="mb-6 gap-y-3">
          {expectedChanges.map((item, index) => (
            <ChangeItem key={index} {...item} />
          ))}
        </View>

        {/* Info Card */}
        <InfoCard
          icon={
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="black"
            />
          }
          text="This is an AI-generated preview based on your body type and plan. Individual results may vary."
          iconBg="bg-pink-100"
        />

        {/* Padding at bottom */}
        <View className="h-6" />
      </ScrollView>

      {/* Footer Button */}
      <View className="border-t border-gray-100 p-6">
        <StyledButton
          title="Unlock Full Preview" // Or "View Full Plan" if unlocked
          onPress={handleUnlock}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  )
}
