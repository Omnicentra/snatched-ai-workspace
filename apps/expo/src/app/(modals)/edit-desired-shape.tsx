import athletic from "@/assets/images/body-shapes/athletic.png";
import gluteGrowth from "@/assets/images/body-shapes/glute-growth.png";
import hourglass from "@/assets/images/body-shapes/hourglass.png";
import keepFit from "@/assets/images/body-shapes/keep-fit.png";
import normalWeightLoss from "@/assets/images/body-shapes/normal-weight-loss.png";
import petiteToned from "@/assets/images/body-shapes/petite-toned.png";
import postpartum from "@/assets/images/body-shapes/postpartum-snatched.png";
import slimThick from "@/assets/images/body-shapes/slim-thick.png";
import tonedThighs from "@/assets/images/body-shapes/toned-thighs.png";
import toned from "@/assets/images/body-shapes/toned.png";
import { CarouselIndicator, InfoCard, StyledButton } from "@/components/core";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import type {
  NativeScrollEvent,
  NativeSyntheticEvent
} from "react-native";
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { z } from "zod";

import { workoutStore } from "@/stores/workout.store";
import { desiredBodyShapeEnum } from "@omc/validators/onboarding";
import { LinearGradient } from "expo-linear-gradient";

type DesiredBodyShape = z.infer<typeof desiredBodyShapeEnum>;

const { width: screenWidth } = Dimensions.get("window");
const CARD_MARGIN = 12;
const PADDING_HORIZONTAL = 24;
const NUM_COLUMNS = 2;
const cardWidth =
  (screenWidth - PADDING_HORIZONTAL * 2 - CARD_MARGIN * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

interface BodyShape {
  id: DesiredBodyShape;
  title: string;
  description: string;
  image: string;
}

const bodyShapes: BodyShape[] = [
  {
    id: "ATHLETIC",
    title: "Athletic",
    description: "Toned muscles, moderate curves",
    image: athletic,
  },
  {
    id: "HOURGLASS",
    title: "Hourglass",
    description: "Balanced curves, defined waist",
    image: hourglass,
  },
  {
    id: "SLIM",
    title: "Slim",
    description: "Lean with subtle definition",
    image: slimThick,
  },
  {
    id: "PETITE_AND_TONE",
    title: "Petite & Toned",
    description: "Small frame with proportional toned features",
    image: petiteToned,
  },
  {
    id: "TONE",
    title: "Toned",
    description: "Lean and defined with a healthy body fat percentage",
    image: toned,
  },
  {
    id: "GLUTE_GROWTH",
    title: "Glute Growth",
    description: "Enhanced gluteal muscles",
    image: gluteGrowth,
  },
  {
    id: "TONED_THIGHS",
    title: "Toned Thighs",
    description: "Lean and defined with a healthy body fat percentage",
    image: tonedThighs,
  },
  {
    id: "NORMAL_WEIGHT_LOSS",
    title: "Normal Weight Loss",
    description: "Gradual and sustainable weight loss",
    image: normalWeightLoss,
  },
  {
    id: "POSTPARTUM_SNATCHED",
    title: "Postpartum Snatched",
    description: "Recovering from pregnancy",
    image: postpartum,
  },
  {
    id: "KEEP_FIT",
    title: "Keep Fit",
    description: "Maintaining a healthy lifestyle",
    image: keepFit,
  },
];

type BodyShapePage = BodyShape[];

const shapesPerPage = 4;
const shapePages: BodyShapePage[] = [];
for (let i = 0; i < bodyShapes.length; i += shapesPerPage) {
  shapePages.push(bodyShapes.slice(i, i + shapesPerPage));
}

const BodyShapeCard = ({
  item,
  selected,
  onPress,
}: {
  item: BodyShape;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    className={`overflow-hidden rounded-xl border border-gray-100 bg-gray-50 ${selected ? "border-2 border-pink-400" : "border-gray-100"}`}
    style={{
      width: cardWidth,
      marginBottom: CARD_MARGIN,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}
    onPress={onPress}
  >
    <View className="h-36 overflow-hidden">
      <Image
        source={item.image}
        style={{ width: "100%", height: "100%" }}
        className="h-full w-full"
        contentFit="cover"
      />
    </View>
    <View className="p-3">
      <Text className="font-inter-semibold mb-1 text-sm text-black">
        {item.title}
      </Text>
      <Text className="font-inter text-xs text-black opacity-70">
        {item.description}
      </Text>
    </View>
    {selected && (
      <View className="absolute right-2.5 top-2.5 h-5 w-5 items-center justify-center rounded-full bg-pink-400">
        <Ionicons name="checkmark" size={12} color="white" />
      </View>
    )}
  </Pressable>
);

export default function EditDesiredShapeScreen() {
  const router = useRouter();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const currentShape = use$(onboardingStore$.onboarding.desiredShape);
  const [selectedShapeId, setSelectedShapeId] = useState<DesiredBodyShape | null>(currentShape);
  const flatListRef = useRef<FlatList>(null);
  const utils = api.useUtils();
  const {mutate: updateFitnessGoals} = api.user.updateFitnessGoals.useMutation({
    onMutate: () => {
      workoutStore.isRegenerating.set(true);
    },
    onSuccess: () => {
      // Refetch the current week plan when fitness goals are updated with regeneration
      void utils.workout.getCurrentWeekPlan.invalidate().finally(() => {
        workoutStore.isRegenerating.set(false);
      });
    },
    onError: () => {
      Alert.alert("Error", "Failed to update fitness goals. Please try again.");
      workoutStore.isRegenerating.set(false);
    },
  });

  const handleSave = () => {
    if (!selectedShapeId || selectedShapeId === currentShape) {
      router.back();
      return;
    }

    Alert.alert(
      "Update Fitness Goals",
      "Would you like to regenerate your body ratings, workout plans, and meal plans based on your new desired shape?",
      [
        {
          text: "No, Just Update Shape",
          style: "default",
          onPress: () => {
            // Update local store and database without regenerating plans
            onboardingStore$.onboarding.desiredShape.set(selectedShapeId);
            updateFitnessGoals({
              desiredShape: selectedShapeId,
              regeneratePlans: false,
            });
            router.back();
          },
        },
        {
          text: "Yes, Regenerate All",
          style: "default",
          onPress: () => {
            // Update local store and database, triggering plan regeneration
            onboardingStore$.onboarding.desiredShape.set(selectedShapeId);
            updateFitnessGoals({
              desiredShape: selectedShapeId,
              regeneratePlans: true,
            });
            router.back();
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentPageIndex(index);
  };

  const goToPage = (index: number) => {
    if (flatListRef.current && index >= 0 && index < shapePages.length) {
      flatListRef.current.scrollToIndex({ animated: true, index });
      setCurrentPageIndex(index);
    }
  };

  const renderPage = ({ item: pageShapes }: { item: BodyShapePage }) => (
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
  );

  return (
    <LinearGradient
      colors={['#fdf2f8', '#fce7f3', '#fbcfe8']}
      style={{ flex: 1, paddingVertical: Constants.statusBarHeight }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="dark" />
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()} 
            hitSlop={20}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white/80"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text className="font-inter-bold text-xl text-gray-900">Edit Desired Shape</Text>
        </View>
      </View>

      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          contentContainerClassName="pb-6"
        >
          <View className="relative h-[425px]">
            <Pressable
              onPress={() => goToPage(currentPageIndex - 1)}
              disabled={currentPageIndex === 0}
              className="absolute left-1 top-1/2 z-10 h-8 w-8 -translate-y-4 items-center justify-center rounded-full bg-white/80 shadow-md"
            >
              <Ionicons name="chevron-back" size={20} color="rgb(107 114 128)" />
            </Pressable>
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
            </Pressable>
            <FlatList
              ref={flatListRef}
              data={shapePages}
              renderItem={renderPage}
              keyExtractor={(_, index) => `page-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ height: 425 }}
            />
          </View>

          <View className="mt-4 items-center">
            <CarouselIndicator
              count={shapePages.length}
              activeIndex={currentPageIndex}
            />
          </View>

          <InfoCard
            icon={
              <Ionicons name="information-circle-outline" size={20} color="black" />
            }
            text="We'll update your fitness plan to help you achieve your new desired shape in a healthy way."
            className="mx-6"
          />
        </ScrollView>
      </View>

      <View className="mt-auto p-6">
        <StyledButton
          title="Save Changes"
          onPress={handleSave}
          disabled={!selectedShapeId}
          variant="primary"
        />
      </View>
    </LinearGradient>
  );
} 