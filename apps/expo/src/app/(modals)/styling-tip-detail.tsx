import React from 'react'
import {
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons' // Example icons
import { StyledButton } from '@/components/core'

// Reusable Component for "Why it Works"
const WhyItWorksItem = ({
  icon,
  text
}: {
  icon: React.ReactNode
  text: string
}) => (
  <View className="mb-3 flex-row items-start">
    <View className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
      {icon}
    </View>
    <Text className="flex-1 pt-1.5 font-inter text-sm text-black">{text}</Text>
  </View>
)

// Reusable Outfit Card
const OutfitCard = ({
  name,
  price,
  imageUrl
}: {
  name: string
  price: string
  imageUrl: string
}) => (
  <View className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
    <View className="h-32 bg-gray-100">
      <Image
        source={{ uri: imageUrl }}
        className="h-full w-full"
        resizeMode="cover"
      />
    </View>
    <View className="p-3">
      <Text className="font-inter-medium text-xs text-black">{name}</Text>
      <Text className="font-inter text-xs text-black">{price}</Text>
    </View>
  </View>
)

// Reusable Shop Pill
const ShopPill = ({ name, url }: { name: string; url: string }) => (
  <Pressable
    className="rounded-full border border-gray-100 bg-gray-50 px-4 py-2 active:bg-gray-100"
    onPress={() =>
      Linking.openURL(url).catch((err) =>
        console.error('Failed to open URL:', err)
      )
    }
  >
    <Text className="font-inter text-xs text-black">{name}</Text>
  </Pressable>
)

export default function StylingTipDetailScreen() {
  const router = useRouter()
  // const { tipId } = useLocalSearchParams(); // Get tip details if needed

  const whyItWorksItems = [
    {
      icon: <Ionicons name="hourglass-outline" size={16} color="black" />,
      text: 'High-waisted bottoms cinch at your natural waist (the narrowest part of your torso)'
    },
    {
      icon: <Ionicons name="swap-vertical-outline" size={16} color="black" />,
      text: 'Creates the illusion of longer legs and a more defined waist-to-hip ratio'
    }, // Placeholder icon
    {
      icon: <Ionicons name="shirt-outline" size={16} color="black" />,
      text: 'Pairs perfectly with crop tops or tucked-in shirts to highlight your waistline'
    }
  ]

  const shopItems = [
    {
      name: 'High-Waisted Jeans',
      price: '$49.99',
      imageUrl:
        'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Fitted Crop Top',
      price: '$24.99',
      imageUrl:
        'https://images.unsplash.com/photo-1551048632-24e444b48a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
    }
  ]

  const shops = [
    { name: 'ASOS', url: 'https://asos.com' },
    { name: 'Zara', url: 'https://zara.com' },
    { name: 'PrettyLittleThing', url: 'https://prettylittlething.com' },
    { name: 'H&M', url: 'https://hm.com' }
  ]

  const handleShopLook = () => {
    console.log('Shop this look pressed')
    // Potentially open a curated shopping link or affiliate page
    Linking.openURL('https://example.com/shop-high-waist').catch((err) =>
      console.error('Failed to open URL:', err)
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* Custom Header */}
      <View className="flex-row items-center p-6">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </Pressable>
        <Text className="font-inter-bold text-xl text-black">Styling Tip</Text>
      </View>

      {/* Info Section */}
      <LinearGradient colors={['#f472b6', '#F6ADCE']} style={{ padding: 20 }}>
        <View className="mb-3 self-start rounded-full bg-white/20 px-4 py-2">
          <Text className="font-inter-medium text-xs text-white">
            👗 Fashion Hack
          </Text>
        </View>
        <Text className="mb-2 font-inter-bold text-2xl text-white">
          High Waist = High Impact
        </Text>
        <Text className="font-inter text-sm text-white">
          Enhance your waist-to-hip ratio with this simple styling trick that
          works for every body type.
        </Text>
      </LinearGradient>

      <ScrollView className="flex-1 p-6">
        {/* Image */}
        <View className="mb-6 overflow-hidden rounded-2xl shadow-lg">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1494578379344-d6c710782a3d?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            }}
            className="h-48 w-full"
            resizeMode="cover"
          />
        </View>

        {/* Why It Works */}
        <Text className="mb-4 font-inter-medium text-black">Why It Works:</Text>
        <View className="mb-6">
          {whyItWorksItems.map((item, index) => (
            <WhyItWorksItem key={index} {...item} />
          ))}
        </View>

        {/* Shop This Look */}
        <Text className="mb-4 font-inter-medium text-black">
          Shop This Look:
        </Text>
        <View className="mb-6 flex-row gap-4">
          <View className="flex-1">
            <OutfitCard {...shopItems[0]} />
          </View>
          <View className="flex-1">
            <OutfitCard {...shopItems[1]} />
          </View>
        </View>

        {/* Where to Shop */}
        <Text className="mb-4 font-inter-medium text-black">
          Where to Shop:
        </Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          {shops.map((shop, index) => (
            <ShopPill key={index} {...shop} />
          ))}
        </View>
        {/* Padding at bottom */}
        <View className="h-6" />
      </ScrollView>

      {/* Footer Button */}
      <View className="border-t border-gray-100 p-6">
        <StyledButton
          title="Shop This Look"
          onPress={handleShopLook}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  )
}
