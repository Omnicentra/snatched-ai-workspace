import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Dimensions,
  Pressable,
  ScrollView // Fallback if FlatList carousel is tricky
} from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import {
  OnboardingHeader,
  StyledButton,
  CarouselIndicator,
  InfoCard
} from '@/components/core' // Assuming ProgressBar is separate
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'

import athletic from '@/assets/images/body-shapes/athletic.png'
import hourglass from '@/assets/images/body-shapes/hourglass.png'
import slimThick from '@/assets/images/body-shapes/slim-thick.png'
import petiteToned from '@/assets/images/body-shapes/petite-toned.png'
import muscular from '@/assets/images/body-shapes/build-muscle.png'
import loseWeight from '@/assets/images/body-shapes/lose-weight.png'
import keepFit from '@/assets/images/body-shapes/keep-fit.png'
import normalWeightLoss from '@/assets/images/body-shapes/normal-weight-loss.png'
import postpartum from '@/assets/images/body-shapes/postpartum-snatched.png'
import toned from '@/assets/images/body-shapes/toned.png'
import gluteGrowth from '@/assets/images/body-shapes/glute-growth.png'
import tonedThighs from '@/assets/images/body-shapes/toned-thighs.png'

const { width: screenWidth } = Dimensions.get('window')
const CARD_MARGIN = 12 // Corresponds to gap-4 / 2
const PADDING_HORIZONTAL = 24 // p-6
const NUM_COLUMNS = 2
const cardWidth =
  (screenWidth - PADDING_HORIZONTAL * 2 - CARD_MARGIN * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS

// Add interface for body shape
interface BodyShape {
  id: string
  name: string
  description: string
  image: string
}

const bodyShapes: BodyShape[] = [
  {
    id: 'athletic',
    name: 'Athletic',
    description: 'Toned muscles, moderate curves',
    image: athletic
  },
  {
    id: 'hourglass',
    name: 'Hourglass',
    description: 'Balanced curves, defined waist',
    image: hourglass
  },
  {
    id: 'slim',
    name: 'Slim',
    description: 'Lean with subtle definition',
    image: slimThick
  },
  // {
  //   id: 'muscular',
  //   name: 'Muscular',
  //   description: 'Well-defined muscles with strength',
  //   image: muscular
  // },
  {
    id: 'petite',
    name: 'Petite & toned',
    description: 'Small frame with proportional toned features',
    image: petiteToned
  },
  {
    id: 'toned',
    name: 'Toned',
    description: 'Lean and defined with a healthy body fat percentage',
    image: toned
  },
  {
    id: 'gluteGrowth',
    name: 'Glute Growth',
    description: 'Enhanced gluteal muscles',
    image: gluteGrowth
  },
  {
    id: 'tonedThighs',
    name: 'Toned Thighs',
    description: 'Lean and defined with a healthy body fat percentage',
    image: tonedThighs
  },
  {
    id: 'normalWeightLoss',
    name: 'Normal Weight Loss',
    description: 'Gradual and sustainable weight loss',
    image: normalWeightLoss
  },
  {
    id: 'postpartum',
    name: 'Postpartum Snatched',
    description: 'Recovering from pregnancy',
    image: postpartum
  },
  {
    id: 'keepFit',
    name: 'Keep Fit',
    description: 'Maintaining a healthy lifestyle',
    image: keepFit
  },
  // {
  //   id: 'loseWeight',
  //   name: 'Lose Weight',
  //   description: 'Achieving a lower body fat percentage',
  //   image: loseWeight
  // }
]

// Group shapes into pages for the carousel (4 per page)
const shapesPerPage = 4
const shapePages: BodyShape[][] = []
for (let i = 0; i < bodyShapes.length; i += shapesPerPage) {
  shapePages.push(bodyShapes.slice(i, i + shapesPerPage))
}

const BodyShapeCard = ({
  item,
  selected,
  onPress
}: {
  item: BodyShape
  selected: boolean
  onPress: () => void
}) => (
  <Pressable
    className={`overflow-hidden rounded-xl border border-gray-100 bg-gray-50 ${selected ? 'border-2 border-pink-400' : 'border-gray-100'}`}
    style={{
      width: cardWidth,
      marginBottom: CARD_MARGIN,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    }} // Apply width and margin for grid layout
    onPress={onPress}
  >
    <View className="h-36 overflow-hidden">
      <Image
        source={item.image}
        style={{ width: '100%', height: '100%' }}
        className="h-full w-full"
        contentFit="cover"
      />
    </View>
    <View className="p-3">
      <Text className="mb-1 font-inter-semibold text-sm text-black">
        {item.name}
      </Text>
      <Text className="font-inter text-xs text-black opacity-70">
        {item.description}
      </Text>
    </View>
    {selected && (
      // Checkmark indicator like in HTML (absolute positioned)
      <View className="absolute right-2.5 top-2.5 h-5 w-5 items-center justify-center rounded-full bg-pink-400">
        <Ionicons name="checkmark" size={12} color="white" />
      </View>
    )}
  </Pressable>
)

export default function DesiredShapeScreen() {
  const router = useRouter()
  const [selectedShapeId, setSelectedShapeId] = useState<string>('hourglass') // Default selection
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const handleContinue = () => {
    // Store selectedShapeId
    router.push('/(onboarding)/timeline-goal')
  }

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(contentOffsetX / screenWidth)
    setCurrentPageIndex(index)
  }

  const goToPage = (index: number) => {
    if (flatListRef.current && index >= 0 && index < shapePages.length) {
      flatListRef.current.scrollToIndex({ animated: true, index })
      setCurrentPageIndex(index) // Update index immediately
    }
  }

  const renderPage = ({ item: pageShapes }: { item: typeof bodyShapes }) => (
    <View
      style={{ width: screenWidth, paddingHorizontal: PADDING_HORIZONTAL }}
      className="flex-row flex-wrap justify-between"
    >
      {pageShapes.map((shape) => (
        <BodyShapeCard
          key={shape.id}
          item={shape}
          selected={selectedShapeId === shape.id}
          onPress={() => setSelectedShapeId(shape.id)}
        />
      ))}
    </View>
  )

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        contentContainerClassName=""
      >
        <View className="p-6 pb-0">
          <OnboardingHeader
            progress={19 / 20}
            title="What's your desired body shape?"
            subtitle="Select the body type you'd like to achieve."
            className="mb-0"
          />
        </View>

        {/* Carousel using FlatList */}
        <View className="relative h-[425px]">
          {' '}
          {/* Adjusted height for 2x2 grid */}
          {/* Left Arrow */}
          <Pressable
            onPress={() => goToPage(currentPageIndex - 1)}
            disabled={currentPageIndex === 0}
            className="absolute left-1 top-1/2 z-10 h-8 w-8 -translate-y-4 items-center justify-center rounded-full bg-white/80 shadow-md"
          >
            <Ionicons name="chevron-back" size={20} color="rgb(107 114 128)" />
            {/* gray-500 */}
          </Pressable>
          {/* Right Arrow */}
          <Pressable
            onPress={() => goToPage(currentPageIndex + 1)}
            disabled={currentPageIndex === shapePages.length - 1}
            className="absolute right-1 top-1/2 z-10 h-8 w-8 -translate-y-4 items-center justify-center rounded-full bg-white/80 shadow-md"
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgb(107 114 128)"
            />
            {/* gray-500 */}
          </Pressable>
          <FlatList
            ref={flatListRef}
            data={shapePages}
            renderItem={renderPage}
            keyExtractor={(_, index) => `page-${index}`}
            horizontal
            pagingEnabled // Snaps to full pages
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16} // Adjust for performance vs accuracy
            style={{ height: 425 }} // Adjusted height for 2x2 grid
          />
        </View>

        {/* Carousel Dots */}
        <View className="mt-4 items-center">
          <CarouselIndicator
            count={shapePages.length}
            activeIndex={currentPageIndex}
          />
        </View>

        <InfoCard
          icon={
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="black"
            />
          }
          text="We'll create a plan that works for your body type to help you achieve your desired shape in a healthy way."
          className="mx-6"
        />
      </ScrollView>
      {/* Bottom Buttons */}
      <View className="mt-auto p-6">
        <StyledButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedShapeId}
          variant="primary" // Black button
        />
      </View>
    </SafeAreaView>
  )
}
