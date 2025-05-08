import React from 'react'
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { StyledButton } from '@/components/core'
import { snatchHackStore$ } from '@/stores/snatch-hack.store'
import { use$ } from '@legendapp/state/react'
import { SNATCH_HACKS } from '@/constants/snatch-hacks'
import type { SnatchHackBenefit } from '@/types'

// Reusable Component for Instructions/Benefits
const ListItem = ({
  index,
  text,
  isInstruction = true,
  icon
}: {
  index: number
  text: string
  isInstruction?: boolean
  icon?: SnatchHackBenefit
}) => (
  <View className="mb-3 flex-row items-start">
    {isInstruction ? (
      <View className="mr-3 h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
        <Text className="font-inter-medium text-xs text-black">
          {index + 1}
        </Text>
      </View>
    ) : icon ? (
      <View className="mr-3 h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
        {icon.iconType === 'material-community' ? (
          <MaterialCommunityIcons name={icon.iconName} size={16} color="black" />
        ) : (
          <Ionicons name={icon.iconName} size={16} color="black" />
        )}
      </View>
    ) : null}
    <Text
      className={`flex-1 font-inter text-sm text-black ${!isInstruction ? 'pt-1.5' : ''}`}
    >
      {text}
    </Text>
  </View>
)

export default function SnatchHackDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const hackId = Number(params.id)
  const hack = SNATCH_HACKS.find(h => h.id === hackId)
  
  // Get today's date as string (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0] ?? '';
  
  // Get completion status from store
  const snatchHackStore = use$(snatchHackStore$);
  const completedHacks = snatchHackStore.completedHacks;
  const todaysHack = completedHacks[today]
  const isCompleted = todaysHack?.hackId === hackId

  const handleMarkComplete = () => {
    if (!hack) return;

    if (isCompleted) {
      // Remove completion status
      const updatedHacks = { ...completedHacks }
      if (today in updatedHacks) {
        delete updatedHacks[today]
      }
      snatchHackStore$.completedHacks.set(updatedHacks)
    } else {
      // Add completion status
      snatchHackStore$.completedHacks.set({
        ...completedHacks,
        [today]: {
          completedAt: new Date().toISOString(),
          hackId: hack.id,
          date: today
        }
      })
    }
    router.back()
  }

  if (!hack) return null;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* Custom Header */}
      <View className="flex-row items-center p-6">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </Pressable>
        <Text className="font-inter-bold text-xl text-black">Snatch Hack</Text>
      </View>

      {/* Info Section */}
      <LinearGradient colors={[hack.color, '#F6ADCE']} style={{ padding: 20 }}>
        <View className="mb-3 flex-row items-center self-start rounded-full bg-white/20 px-2 pr-4">
          <Entypo name="dot-single" size={24} color="yellow" />
          <Text className="font-inter-medium text-xs text-white">
            Easy 2 min
          </Text>
        </View>
        <Text className="mb-2 font-inter-bold text-2xl text-white">
          {hack.title}
        </Text>
        <Text className="font-inter text-sm text-white">
          {hack.description}
        </Text>
      </LinearGradient>

      <ScrollView className="flex-1 p-6">
        {/* Image */}
        <View className="mb-6 overflow-hidden rounded-2xl shadow-lg">
          <Image
            source={{
              uri: (() => {
                switch (hack.id) {
                  case 1: // Posture Check
                    return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                  case 2: // Water Intake
                    return 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                  case 3: // Mindful Eating
                    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                  case 4: // Active Breaks
                    return 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                  case 5: // Sleep Prep
                    return 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                  default:
                    return 'https://images.unsplash.com/photo-1546241072-48010ad2862c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                }
              })()
            }}
            className="h-48 w-full"
            resizeMode="cover"
          />
        </View>

        {/* Instructions */}
        {hack.instructions && hack.instructions.length > 0 && (
          <>
            <Text className="mb-4 font-inter-medium text-black">Instructions:</Text>
            <View className="mb-6">
              {hack.instructions.map((instruction, index) => (
                <ListItem
                  key={index}
                  index={index}
                  text={instruction}
                  isInstruction={true}
                />
              ))}
            </View>
          </>
        )}

        {/* Benefits */}
        {hack.benefits && hack.benefits.length > 0 && (
          <>
            <Text className="mb-4 font-inter-medium text-black">Benefits:</Text>
            <View className="mb-6">
              {hack.benefits.map((benefit, index) => (
                <ListItem
                  key={index}
                  index={index}
                  text={benefit.text}
                  isInstruction={false}
                  icon={benefit}
                />
              ))}
            </View>
          </>
        )}

        {/* Padding at bottom */}
        <View className="h-6" />
      </ScrollView>

      {/* Footer Button */}
      <View className="border-t border-gray-100 p-6">
        <StyledButton
          title={isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
          onPress={handleMarkComplete}
          variant={isCompleted ? "secondary" : "primary"}
        />
      </View>
    </SafeAreaView>
  )
}
