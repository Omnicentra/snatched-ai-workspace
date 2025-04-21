import React from 'react'
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
import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons' // Example icons
import { StyledButton } from '@/components/core'

// Reusable Component for Instructions/Benefits
const ListItem = ({
  index,
  text,
  isInstruction = true
}: {
  index: number
  text: string
  isInstruction?: boolean
}) => (
  <View className="mb-3 flex-row items-start">
    {isInstruction ? (
      <View className="mr-3 h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
        <Text className="font-inter-medium text-xs text-black">
          {index + 1}
        </Text>
      </View>
    ) : (
      <View className="mr-3 h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
        {/* Choose icon based on benefit index or pass icon prop */}
        {index === 0 && (
          <Ionicons name="water-outline" size={16} color="black" />
        )}
        {index === 1 && (
          <MaterialCommunityIcons name="stomach" size={16} color="black" />
        )}
        {index === 2 && (
          <Ionicons name="battery-charging-outline" size={16} color="black" />
        )}
      </View>
    )}
    <Text
      className={`flex-1 font-inter text-sm text-black ${!isInstruction ? 'pt-1.5' : ''}`}
    >
      {text}
    </Text>
  </View>
)

export default function SnatchHackDetailScreen() {
  const router = useRouter()
  // const { hackId } = useLocalSearchParams(); // Get hack details if needed

  const ingredients = [
    {
      name: 'Warm Water',
      icon: <Ionicons name="water-outline" size={20} color="black" />
    },
    {
      name: 'Lemon',
      icon: (
        <MaterialCommunityIcons
          name="food-apple-outline"
          size={20}
          color="black"
        />
      )
    }, // Placeholder icon
    {
      name: 'Pink Salt',
      icon: <Ionicons name="flask-outline" size={20} color="black" />
    } // Placeholder icon
  ]
  const instructions = [
    'Heat 8oz of water until warm (not boiling)',
    'Squeeze half a lemon into the water',
    'Add a small pinch of pink Himalayan salt',
    'Drink first thing in the morning on an empty stomach'
  ]
  const benefits = [
    'Hydrates your body after overnight fasting',
    'Stimulates digestion and reduces bloating',
    'Provides electrolytes for better hydration'
  ]

  const handleMarkComplete = () => {
    console.log('Snatch Hack marked complete')
    router.back()
  }

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
      <LinearGradient colors={['#f472b6', '#F6ADCE']} style={{ padding: 20 }}>
        <View className="mb-3 flex-row items-center self-start rounded-full bg-white/20 px-2 pr-4">
          <Entypo name="dot-single" size={24} color="yellow" />
          <Text className="font-inter-medium text-xs text-white">
            Easy 2 min
          </Text>
        </View>
        <Text className="mb-2 font-inter-bold text-2xl text-white">
          Morning Debloat Trick
        </Text>
        <Text className="font-inter text-sm text-white">
          Start your day with this simple hack to reduce bloating and feel
          lighter instantly.
        </Text>
      </LinearGradient>

      <ScrollView className="flex-1 p-6">
        {/* Image */}
        <View className="mb-6 overflow-hidden rounded-2xl shadow-lg">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1546241072-48010ad2862c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
            }}
            className="h-48 w-full"
            resizeMode="cover"
          />
        </View>

        {/* Ingredients */}
        <Text className="mb-4 font-inter-medium text-black">
          What You'll Need:
        </Text>
        <View className="mb-6 flex-row justify-around">
          {ingredients.map((item, index) => (
            <View key={index} className="items-center">
              <View
                className={`mb-2 flex h-16 w-16 items-center justify-center rounded-full ${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-green-100' : 'bg-pink-100'}`}
              >
                {item.icon}
              </View>
              <Text className="font-inter text-xs text-black">{item.name}</Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <Text className="mb-4 font-inter-medium text-black">Instructions:</Text>
        <View className="mb-6">
          {instructions.map((text, index) => (
            <ListItem
              key={index}
              index={index}
              text={text}
              isInstruction={true}
            />
          ))}
        </View>

        {/* Benefits */}
        <Text className="mb-4 font-inter-medium text-black">Benefits:</Text>
        <View className="mb-6">
          {benefits.map((text, index) => (
            <ListItem
              key={index}
              index={index}
              text={text}
              isInstruction={false}
            />
          ))}
        </View>
        {/* Padding at bottom */}
        <View className="h-6" />
      </ScrollView>

      {/* Footer Button */}
      <View className="border-t border-gray-100 p-6">
        <StyledButton
          title="Mark as Completed"
          onPress={handleMarkComplete}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  )
}
