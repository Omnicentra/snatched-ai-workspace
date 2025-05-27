import React, { useState, useRef } from 'react'
import type {
  NativeSyntheticEvent,
  NativeScrollEvent} from 'react-native';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Dimensions,
  Pressable,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import {
  OnboardingHeader,
  StyledButton,
  CarouselIndicator,
  InfoCard
} from '@/components/core'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { onboardingStore$ } from '@/stores/onboarding.store'
import { desiredBodyShapeEnum } from '@omc/validators/onboarding'
import type { z } from 'zod'
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking'
import { useLocalSearchParams } from 'expo-router'

import athletic from '@/assets/images/body-shapes/athletic.png'
import hourglass from '@/assets/images/body-shapes/hourglass.png'
import slimThick from '@/assets/images/body-shapes/slim-thick.png'
import petiteToned from '@/assets/images/body-shapes/petite-toned.png'
import toned from '@/assets/images/body-shapes/toned.png'
import gluteGrowth from '@/assets/images/body-shapes/glute-growth.png'
import tonedThighs from '@/assets/images/body-shapes/toned-thighs.png'
import normalWeightLoss from '@/assets/images/body-shapes/normal-weight-loss.png'
import postpartum from '@/assets/images/body-shapes/postpartum-snatched.png'
import keepFit from '@/assets/images/body-shapes/keep-fit.png'

const { width: screenWidth } = Dimensions.get('window')
const CARD_MARGIN = 12 // Corresponds to gap-4 / 2
const PADDING_HORIZONTAL = 24 // p-6
const NUM_COLUMNS = 2
const cardWidth =
  (screenWidth - PADDING_HORIZONTAL * 2 - CARD_MARGIN * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS

// Define the type for body shape IDs using the enum values directly
type BodyShapeId = z.infer<typeof desiredBodyShapeEnum>

interface BodyShape {
  id: BodyShapeId;
  title: string;
  description: string;
  image: string;
}

const bodyShapes: BodyShape[] = [
  {
    id: "ATHLETIC",
    title: 'Athletic',
    description: 'Toned muscles, moderate curves',
    image: athletic
  },
  {
    id: "HOURGLASS",
    title: 'Hourglass',
    description: 'Balanced curves, defined waist',
    image: hourglass
  },
  {
    id: "SLIM",
    title: 'Slim',
    description: 'Lean with subtle definition',
    image: slimThick
  },
  {
    id: "PETITE_AND_TONE",
    title: 'Petite & Toned',
    description: 'Small frame with proportional toned features',
    image: petiteToned
  },
  {
    id: "TONE",
    title: 'Toned',
    description: 'Lean and defined with a healthy body fat percentage',
    image: toned
  },
  {
    id: "GLUTE_GROWTH",
    title: 'Glute Growth',
    description: 'Enhanced gluteal muscles',
    image: gluteGrowth
  },
  {
    id: "TONED_THIGHS",
    title: 'Toned Thighs',
    description: 'Lean and defined with a healthy body fat percentage',
    image: tonedThighs
  },
  {
    id: "NORMAL_WEIGHT_LOSS",
    title: 'Normal Weight Loss',
    description: 'Gradual and sustainable weight loss',
    image: normalWeightLoss
  },
  {
    id: "POSTPARTUM_SNATCHED",
    title: 'Postpartum Snatched',
    description: 'Recovering from pregnancy',
    image: postpartum
  },
  {
    id: "KEEP_FIT",
    title: 'Keep Fit',
    description: 'Maintaining a healthy lifestyle',
    image: keepFit
  }
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
        {item.title}
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

function DesiredShape() {
  const router = useRouter()
  const params = useLocalSearchParams<{ progress?: string, skipped?: string }>()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [selectedShapeId, setSelectedShapeId] = useState<BodyShapeId | null>(null)
  const flatListRef = useRef<FlatList>(null)

  const handleContinue = () => {
    try {
      if (selectedShapeId) {
        // Validate the selected shape against the enum
        const validatedShape = desiredBodyShapeEnum.parse(selectedShapeId)
        onboardingStore$.onboarding.desiredShape.set(validatedShape)
        
        // Pass along the skipped parameter if it exists
        if (params.progress === 'true') {
          router.push('/(onboarding)/analyzing?progress=true')
        } else if (params.skipped === 'true') {
          router.push('/(onboarding)/timeline-goal?skipped=true')
        } else {
          router.push('/(onboarding)/timeline-goal')
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Invalid body shape selected:', error.message)
      }
    }
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
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

export default withOnboardingTracking(DesiredShape, 'desired_shape')
