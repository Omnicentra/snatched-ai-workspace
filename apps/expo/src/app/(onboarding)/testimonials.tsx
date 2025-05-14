// app/(onboarding)/feature-testimonials.tsx
import { StyledButton } from '@/components/core'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import React from 'react'
import { Image, SafeAreaView, ScrollView, Text, View } from 'react-native'

// Replace with actual image sources
const user1 =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
const user2 =
  'https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
const user3 =
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'

const StarRating = ({ rating = 5 }: { rating?: number }) => {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

  return (
    <View className="flex-row">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Ionicons
          key={`full-${i}`}
          name="star"
          size={14}
          color="#FACC15" /* yellow-400 */
        />
      ))}
      {halfStar && (
        <Ionicons key="half" name="star-half" size={14} color="#FACC15" />
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={14}
          color="#FACC15"
        />
      ))}
    </View>
  )
}

const TestimonialCardLarge = ({
  image,
  name,
  rating,
  quote
}: {
  image: string
  name: string
  rating: number
  quote: string
}) => (
  <View className="mb-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
    <View className="mb-3 flex-row items-center">
      <Image
        source={{ uri: image }}
        className="mr-3 h-12 w-12 rounded-full bg-gray-200"
      />
      <View>
        <Text className="font-inter-medium text-black">{name}</Text>
        <StarRating rating={rating} />
      </View>
    </View>
    <Text className="font-inter text-sm text-black">{quote}</Text>
  </View>
)

export default function FeatureTestimonialsScreen() {
  const router = useRouter()
  const totalSteps = 6
  const currentStepIndex = 3 // 4th screen

  const handleContinue = () => {
    router.push('/(onboarding)/signup')
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center p-8">
          <Text className="mb-2 text-center font-inter-bold text-2xl text-black">
            What Our Users Say
          </Text>
          <Text className="mb-6 text-center font-inter text-sm text-black">
            Real stories from real women
          </Text>

          <View className="mb-8 w-full gap-y-4">
            <TestimonialCardLarge
              image={user1}
              name="Alicia J."
              rating={5}
              quote="I've tried so many fitness apps but Snatched AI is different. It actually understands my body type and the workouts are perfect for me. I'm seeing results I never thought possible!"
            />
            <TestimonialCardLarge
              image={user2}
              name="Sophia T."
              rating={5}
              quote="The daily Snatch Hacks are game changers! Small tips that make a huge difference. My waist is more defined and my confidence is through the roof. Thank you!"
            />
            <TestimonialCardLarge
              image={user3}
              name="Madison K."
              rating={4.5}
              quote="I love how the app adjusts around my cycle. No more forcing myself to do intense workouts when I have no energy. Smart, personalized, and it works!"
            />
          </View>
        </View>
      </ScrollView>
      <View className="mt-auto px-8 pb-8">
        <StyledButton
          title="Continue"
          onPress={handleContinue}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  )
}