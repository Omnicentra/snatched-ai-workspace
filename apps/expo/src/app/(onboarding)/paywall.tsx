import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
} from "react-native";
// 20px padding on each side
import Purchases from "react-native-purchases";
import Svg, { Path } from "react-native-svg";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import beforeAfter from "@/assets/images/before-after.jpeg";
import { StyledButton } from "@/components/core";
import { Feather, Ionicons } from "@expo/vector-icons";
import { api } from "@/utils/api";
import { use$ } from "@legendapp/state/react";
import { transformationStore$ } from "@/stores/transformation.store";
import * as Sentry from '@sentry/react-native';
import { onboardingStore$ } from "@/stores/onboarding.store";
import { Analytics } from "@/lib/analytics";
import { getOrCreateDeviceId } from "@/utils/device-id";
import { authClient } from "@/utils/auth";
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 40;

// Add a constant for uniform section height
const SECTION_HEIGHT = 400; // This will be the uniform height for all sections

// Re-usable component for the feature graph (adapted from results screen)
const _PredictionGraph = () => {
  return (
    <View className="relative h-[200px] w-full rounded-lg bg-gray-800/50 p-4">
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Background fill */}
        <Path
          d="M0 100 L0 70 Q25 50 50 45 Q75 40 100 35 L100 100 Z"
          fill="rgba(168, 85, 247, 0.2)" // Purple fill matching theme
          vectorEffect="non-scaling-stroke"
        />
        {/* Main curve */}
        <Path
          d="M0 70 Q25 50 50 45 Q75 40 100 35"
          stroke="#A855F7" // Purple stroke
          strokeWidth="2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
      {/* Example Data Point */}
      <View
        className="absolute left-[45%] top-[35%] items-center"
        style={{ transform: [{ translateX: -20 }] }} // Center the badge roughly
      >
        <View className="rounded-md bg-pink-500 px-2 py-1 shadow-md">
          <Text className="font-inter-bold text-sm text-white">2 inches</Text>
        </View>
        {/* Dot on the line */}
        <View className="mt-1 h-3 w-3 rounded-full border-2 border-pink-400 bg-gray-900" />
      </View>

      {/* X-Axis Labels (Example: Time in Weeks) */}
      <View
        className="absolute bottom-2 flex-row justify-between px-2"
        style={{ width: "100%" }}
      >
        {[0, 4, 8, 12, 16, 20].map((week) => (
          <Text key={week} className="font-inter-medium text-xs text-gray-400">
            {week}w
          </Text>
        ))}
      </View>
    </View>
  );
};

// Re-usable component for the checklist feature
const _PlanChecklist = () => {
  const items = [
    { text: "Targeted waist exercises", icon: "🏋️‍♀️" },
    { text: "Core strengthening routine", icon: "💪" },
    { text: "Nutrition guidance", icon: "🥗" },
    { text: "Progress tracking reminders", icon: "🔔" },
  ];
  return (
    <View className="rounded-lg bg-gray-800/50 p-4">
      {items.map((item, index) => (
        <View
          key={index}
          className="mb-3 flex-row items-center rounded-lg bg-gray-700/60 p-3"
        >
          <View className="mr-3 h-6 w-6 items-center justify-center rounded-md bg-purple-500">
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
          <Text className="font-inter-medium text-sm text-gray-200">
            {item.text} <Text>{item.icon}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
};

// Maximize It Component
const _MaximizeSection = () => {
  const items = [
    { text: "1 glass of milk + honey🍯🥛", completed: true },
    { text: "5m of bar hanging🦍", completed: false },
    { text: "Consume 2g of fish oil 🐟", completed: false },
    { text: "3 x (10) Cobra stretch 🐍", completed: false },
  ];

  return (
    <View
      style={{ height: SECTION_HEIGHT }}
      className="rounded-2xl bg-gray-900 p-4"
    >
      <Text className="font-inter-bold mb-4 text-2xl text-white">
        Maximize it
      </Text>
      <View className="flex-1 justify-between">
        {items.map((item, index) => (
          <View
            key={index}
            className="mb-3 flex-row items-center rounded-xl bg-gray-800/80 p-3"
            style={item.completed ? { opacity: 0.6 } : {}}
          >
            <View
              className={`mr-3 h-6 w-6 items-center justify-center rounded-lg ${item.completed ? "bg-pink-400" : "bg-gray-700"}`}
            >
              {item.completed && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text
              className={`font-inter-medium text-base ${item.completed ? "text-gray-400 line-through" : "text-gray-200"}`}
            >
              {item.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Community Section Component
const _CommunitySection = () => {
  const posts = [
    {
      title: "Waist training sleep routine",
      content:
        "Yo I heard deep sleep is key for recovery. I've been hitting 9 hrs a night + magnesium...",
      author: "Alex",
      stats: "5'11",
      time: "1 hour ago",
      reactions: { comments: 24, likes: 31, dislikes: 4 },
    },
    {
      title: "Is hanging from a bar a scam? 💭",
      content:
        "I see people saying you can gain an inch from just hanging daily but idk if that's cap...",
      author: "Nathan",
      stats: "5'10",
      time: "3 hours ago",
      reactions: { comments: 24, likes: 45, dislikes: 13 },
    },
  ];

  return (
    <View
      style={{ height: SECTION_HEIGHT }}
      className="rounded-2xl bg-gray-900 p-4"
    >
      <Text className="font-inter-bold mb-4 text-2xl text-white">
        Exclusive community
      </Text>
      <View className="flex-1 justify-between">
        {posts.map((post, index) => (
          <View key={index} className="mb-3 rounded-xl bg-gray-800/80 p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-inter-semibold text-base text-white">
                {post.title}
              </Text>
              <View className="rounded-full bg-pink-400 px-2 py-1">
                <Text className="font-inter-medium text-xs text-white">
                  {index === 0 ? "27" : "32"}
                </Text>
              </View>
            </View>
            <Text className="font-inter-medium mb-2 text-sm text-gray-400">
              {post.content}
            </Text>
            <View className="mb-2 flex-row items-center">
              <Text className="font-inter-medium text-xs text-gray-500">
                {post.author}
              </Text>
              <Text className="font-inter-medium mx-2 text-xs text-gray-600">
                •
              </Text>
              <Text className="font-inter-medium text-xs text-gray-500">
                {post.stats}
              </Text>
              <Text className="font-inter-medium mx-2 text-xs text-gray-600">
                •
              </Text>
              <Text className="font-inter-medium text-xs text-gray-500">
                {post.time}
              </Text>
            </View>
            <View className="flex-row gap-x-4">
              <View className="flex-row items-center">
                <Ionicons name="chatbubble-outline" size={14} color="#9CA3AF" />
                <Text className="font-inter-medium ml-1 text-xs text-gray-400">
                  {post.reactions.comments}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="thumbs-up-outline" size={14} color="#9CA3AF" />
                <Text className="font-inter-medium ml-1 text-xs text-gray-400">
                  {post.reactions.likes}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons
                  name="thumbs-down-outline"
                  size={14}
                  color="#9CA3AF"
                />
                <Text className="font-inter-medium ml-1 text-xs text-gray-400">
                  {post.reactions.dislikes}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Visualize Goal Section
const VisualizeGoalSection = () => {
  return (
    <View className="rounded-2xl bg-gray-900 p-4">
      <Text className="font-inter-bold mb-4 text-2xl text-white">
        Visualize your goal
      </Text>
      <View className="rounded-xl bg-gray-800/80 p-4">
        {/* Single Before-After Image */}
        <View className="mb-4">
          <View className="h-[280px] w-full overflow-hidden rounded-xl">
            <Image
              source={beforeAfter}
              className="h-full w-full"
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "cover",
              }}
              contentFit="cover"
            />
            {/* Labels */}
            <View className="absolute bottom-3 left-3 rounded-full bg-pink-400/20 px-3 py-1">
              <Text className="font-inter-medium text-xs text-pink-200">
                Before
              </Text>
            </View>
            <View className="absolute bottom-3 right-3 rounded-full bg-pink-400/20 px-3 py-1">
              <Text className="font-inter-medium text-xs text-pink-200">
                After
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between rounded-xl bg-gray-700/50 p-4">
          <View className="items-center">
            <Text className="font-inter-medium text-sm text-gray-400">
              Starting
            </Text>
            <Text className="font-inter-bold text-xl text-white">32"</Text>
            <Text className="font-inter-medium text-xs text-gray-500">
              waist
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-inter-medium text-sm text-gray-400">
              Goal
            </Text>
            <Text className="font-inter-bold text-xl text-white">26"</Text>
            <Text className="font-inter-medium text-xs text-gray-500">
              waist
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-inter-medium text-sm text-gray-400">
              Timeline
            </Text>
            <Text className="font-inter-bold text-xl text-white">12</Text>
            <Text className="font-inter-medium text-xs text-gray-500">
              weeks
            </Text>
          </View>
        </View>

        {/* Motivation Text */}
        <Text className="font-inter-medium mt-3 text-center text-sm text-gray-400">
          Join thousands of women who have achieved their dream figure with our
          proven program
        </Text>
      </View>
    </View>
  );
};

// Optimal Workout Section
const WorkoutPlanSection = () => {
  const workouts = [
    {
      day: "Day 1",
      focus: "Core & Waist",
      duration: "45 min",
      intensity: "High",
    },
    {
      day: "Day 2",
      focus: "Lower Body",
      duration: "40 min",
      intensity: "Medium",
    },
    { day: "Day 3", focus: "Recovery", duration: "30 min", intensity: "Low" },
  ];

  return (
    <View
      style={{ height: SECTION_HEIGHT }}
      className="rounded-2xl bg-gray-900 p-4"
    >
      <Text className="font-inter-bold mb-4 text-2xl text-white">
        Optimal workout plan
      </Text>
      <View className="flex-1 justify-between">
        {workouts.map((workout, index) => (
          <View key={index} className="mb-3 rounded-xl bg-gray-800/80 p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-inter-semibold text-base text-white">
                {workout.day}
              </Text>
              <View className="rounded-full bg-pink-400/20 px-3 py-1">
                <Text className="font-inter-medium text-sm text-pink-200">
                  {workout.duration}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="font-inter-medium text-sm text-gray-400">
                {workout.focus}
              </Text>
              <View
                className={`rounded-full px-2 py-1 ${
                  workout.intensity === "High"
                    ? "bg-red-500/20"
                    : workout.intensity === "Medium"
                      ? "bg-yellow-500/20"
                      : "bg-green-500/20"
                }`}
              >
                <Text
                  className={`font-inter-medium text-xs ${
                    workout.intensity === "High"
                      ? "text-red-300"
                      : workout.intensity === "Medium"
                        ? "text-yellow-300"
                        : "text-green-300"
                  }`}
                >
                  {workout.intensity}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Nutrition Plan Section
const NutritionPlanSection = () => {
  const meals = [
    {
      type: "Breakfast",
      calories: "400",
      protein: "25g",
      example: "Greek yogurt + berries",
    },
    {
      type: "Lunch",
      calories: "500",
      protein: "30g",
      example: "Grilled chicken salad",
    },
    {
      type: "Dinner",
      calories: "450",
      protein: "28g",
      example: "Salmon + quinoa",
    },
  ];

  return (
    <View
      style={{ height: SECTION_HEIGHT }}
      className="rounded-2xl bg-gray-900 p-4"
    >
      <Text className="font-inter-bold mb-4 text-2xl text-white">
        Optimal nutrition plan
      </Text>
      <View className="flex-1">
        <View className="mb-4 flex-row justify-between rounded-xl bg-pink-500/20 p-3">
          <View className="items-center">
            <Text className="font-inter-medium text-sm text-pink-200">
              Daily Calories
            </Text>
            <Text className="font-inter-bold text-lg text-pink-300">1,800</Text>
          </View>
          <View className="items-center">
            <Text className="font-inter-medium text-sm text-pink-200">
              Protein
            </Text>
            <Text className="font-inter-bold text-lg text-pink-300">90g</Text>
          </View>
          <View className="items-center">
            <Text className="font-inter-medium text-sm text-pink-200">
              Water
            </Text>
            <Text className="font-inter-bold text-lg text-pink-300">2.5L</Text>
          </View>
        </View>
        <View className="flex-1 justify-between">
          {meals.map((meal, index) => (
            <View key={index} className="mb-3 rounded-xl bg-gray-800/80 p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-inter-semibold text-base text-white">
                  {meal.type}
                </Text>
                <View className="rounded-full bg-pink-500/20 px-3 py-1">
                  <Text className="font-inter-medium text-sm text-pink-200">
                    {meal.calories} cal
                  </Text>
                </View>
              </View>
              <Text className="font-inter-medium text-sm text-gray-400">
                {meal.example}
              </Text>
              <Text className="font-inter-medium mt-1 text-xs text-pink-300">
                {meal.protein} protein
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// Daily Snatch Hacks Section
const SnatchHacksSection = () => {
  const hacks = [
    { title: "Morning ritual", tip: "Warm lemon water + ACV", icon: "🍋" },
    { title: "Posture check", tip: "Set hourly reminders", icon: "⏰" },
    { title: "Waist training", tip: "6-8 hours daily", icon: "⌛" },
    { title: "Recovery", tip: "Epsom salt bath", icon: "🛁" },
  ];

  return (
    <View
      style={{ height: SECTION_HEIGHT }}
      className="rounded-2xl bg-gray-900 p-4"
    >
      <Text className="font-inter-bold mb-4 text-2xl text-white">
        Daily snatch hacks
      </Text>
      <View className="flex-1 justify-between">
        {hacks.map((hack, index) => (
          <View
            key={index}
            className="mb-3 flex-row items-center rounded-xl bg-gray-800/80 p-4"
          >
            <Text className="mr-3 text-2xl">{hack.icon}</Text>
            <View className="flex-1">
              <Text className="font-inter-semibold text-base text-white">
                {hack.title}
              </Text>
              <Text className="font-inter-medium text-sm text-gray-400">
                {hack.tip}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Styling Tips Section
const _StylingTipsSection = () => {
  const tips = [
    { category: "Tops", tip: "High-waisted everything", icon: "👚" },
    { category: "Dresses", tip: "Wrap styles & A-line cuts", icon: "👗" },
    { category: "Accessories", tip: "Statement belts", icon: "👜" },
    { category: "Layering", tip: "Cropped jackets", icon: "🧥" },
  ];

  return (
    <View
      style={{ height: SECTION_HEIGHT }}
      className="rounded-2xl bg-gray-900 p-4"
    >
      <Text className="font-inter-bold mb-4 text-2xl text-white">
        Daily styling tips
      </Text>
      <View className="flex-1 justify-between">
        {tips.map((tip, index) => (
          <View key={index} className="mb-3 rounded-xl bg-gray-800/80 p-4">
            <View className="flex-row items-center">
              <Text className="mr-3 text-2xl">{tip.icon}</Text>
              <View className="flex-1">
                <Text className="font-inter-semibold text-base text-white">
                  {tip.category}
                </Text>
                <Text className="font-inter-medium text-sm text-gray-400">
                  {tip.tip}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Growth Guide Section (Updated)
const _GrowthGuideSection = () => {
  const modules = [
    { title: "Foundations", lessons: 3, completed: 0, icon: "📚" },
    { title: "Nutrition", lessons: 4, completed: 0, icon: "🥗" },
    { title: "Training", lessons: 5, completed: 0, icon: "💪" },
    { title: "Lifestyle", lessons: 3, completed: 0, icon: "🌟" },
  ];

  return (
    <View className="rounded-2xl bg-gray-900 p-4">
      <Text className="font-inter-bold mb-4 text-2xl text-white">
        Growth guide
      </Text>
      {modules.map((module, index) => (
        <View key={index} className="mb-3 rounded-xl bg-gray-800/80 p-4">
          <View className="mb-2 flex-row items-center">
            <Text className="mr-2 text-2xl">{module.icon}</Text>
            <View className="flex-1">
              <Text className="font-inter-semibold text-base text-white">
                {module.title}
              </Text>
              <Text className="font-inter-medium text-sm text-gray-400">
                {module.lessons} lessons
              </Text>
            </View>
            <View className="rounded-full bg-pink-500/20 px-3 py-1">
              <Text className="font-inter-medium text-xs text-pink-200">
                Locked
              </Text>
            </View>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-gray-700">
            <View className="h-full w-0 bg-pink-500" />
          </View>
        </View>
      ))}
    </View>
  );
};

interface Plan {
  id: string;
  name: string;
  price: string;
  popular: boolean;
  packageId: string;
}

// Memoize the plan selection component
const PlanSelection = memo(({ 
  plans, 
  packages, 
  selectedPackage, 
  onSelectPackage 
}: { 
  plans: Record<string, Plan>;
  packages: PurchasesPackage[];
  selectedPackage?: PurchasesPackage;
  onSelectPackage: (pkg: PurchasesPackage) => void;
}) => (
  <View style={styles.planContainer}>
    {Object.keys(plans).length > 0 ? (
      Object.values(plans).map((plan) => (
        <Pressable
          key={plan.id}
          onPress={() => {
            const pkg = packages.find(
              (pkg) => pkg.product.identifier === plan.packageId,
            );
            if (pkg) {
              onSelectPackage(pkg);
            }
          }}
          style={[
            styles.planBox,
            selectedPackage?.product.identifier === plan.packageId &&
              styles.selectedPlanBox,
            plan.id === "weekly" ? { marginRight: 8 } : { marginLeft: 8 },
          ]}
        >
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
          <View style={styles.planContent}>
            <View>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                selectedPackage?.product.identifier === plan.packageId &&
                  styles.selectedRadioOuter,
              ]}
            >
              {selectedPackage?.product.identifier === plan.packageId && (
                <View style={styles.radioInner} />
              )}
            </View>
          </View>
        </Pressable>
      ))
    ) : (
      <View style={[styles.planBox, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.planName, { color: 'rgba(255,255,255,0.5)' }]}>Loading plans...</Text>
      </View>
    )}
  </View>
));

function PaywallScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout>();
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage>();
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const { mutate: imageTransformation } = api.user.imageTransformation.useMutation({
    onSuccess: (data) => {
      transformationStore$.currentImage.set(data.currentImageUri);
      transformationStore$.snatchedImage.set(data.transformedImageUri);
    },
    onError: (error) => {
      console.error(error);
      Sentry.captureException(error);
    }
  });
  
  const frontImageKey = use$(onboardingStore$.onboarding.frontViewPhoto);

  useEffect(() => {
    void (async () => {
      try {
        const deviceId = await getOrCreateDeviceId();
        const userId = session?.user.id;
        Analytics.trackPaywallView(deviceId, userId);
        await fetchPackages();
      } catch (error) {
        console.error('Error initializing paywall:', error);
      }
    })();
  }, []);

  const fetchPackages = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      const availablePackages = offerings.all.default?.availablePackages;
      
      if (availablePackages?.length) {
        // Process packages and create plans
        const plansObj: Record<string, Plan> = {};
        
        // Find weekly package
        const weeklyPackage = availablePackages.find(
          (pkg) => 
            typeof pkg.packageType === "string" && 
            (pkg.packageType.toUpperCase() === "WEEKLY" || 
            pkg.product.identifier.toLowerCase().includes("weekly"))
        );
        
        // Find lifetime package
        const lifetimePackage = availablePackages.find(
          (pkg) => 
            typeof pkg.packageType === "string" && 
            (pkg.packageType.toUpperCase() === "LIFETIME" || 
            pkg.product.identifier.toLowerCase().includes("lifetime"))
        );
        
        if (weeklyPackage) {
          plansObj.weekly = {
            id: weeklyPackage.packageType.toLowerCase(),
            name: "Weekly",
            price: weeklyPackage.product.priceString,
            popular: false,
            packageId: weeklyPackage.product.identifier,
          };
        }
        
        if (lifetimePackage) {
          plansObj.lifetime = {
            id: "lifetime",
            name: "Lifetime",
            price: lifetimePackage.product.priceString,
            popular: true,
            packageId: lifetimePackage.product.identifier,
          };
        }
        
        // Batch state updates
        setPlans(plansObj);
        setPackages(availablePackages);
        
        // Default select lifetime package if available, otherwise the first package
        const defaultPackage = lifetimePackage ?? availablePackages[0];
        setSelectedPackage(defaultPackage);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      Alert.alert("Error", "Failed to load subscription plans. Please try again.");
    }
  };

  const scrollToNextPage = useCallback(() => {
    if (scrollViewRef.current && !isManualScrolling) {
      const nextPage = (currentPage + 1) % 4; // 4 is the total number of pages
      scrollViewRef.current.scrollTo({
        x: nextPage * (CAROUSEL_ITEM_WIDTH + 20),
        animated: true,
      });
      setCurrentPage(nextPage);
    }
  }, [currentPage, isManualScrolling]);

  // Set up auto-scrolling
  useEffect(() => {
    autoScrollTimer.current = setInterval(scrollToNextPage, 3000); // Change slide every 3 seconds

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [scrollToNextPage]);

  const onScrollBegin = () => {
    setIsManualScrolling(true);
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
  };

  const onScrollEnd = () => {
    setIsManualScrolling(false);
    // Restart auto-scroll timer
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
    autoScrollTimer.current = setInterval(scrollToNextPage, 3000);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / CAROUSEL_ITEM_WIDTH);
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const makePurchase = async () => {
    if (!selectedPackage || isPurchasing) return;
    
    try {
      setIsPurchasing(true);
      const { customerInfo, productIdentifier } = await Purchases.purchasePackage(selectedPackage);
      
      const deviceId = await getOrCreateDeviceId();
      const userId = session?.user.id;

      if (userId) {
        Analytics.trackSubscriptionPurchase(deviceId, userId, {
          planId: productIdentifier,
          planName: selectedPackage.product.identifier,
          price: selectedPackage.product.price,
          currency: selectedPackage.product.currencyCode,
          interval: selectedPackage.product.subscriptionPeriod === 'P1Y' ? 'year' : 'month'
        });
      }

      if (customerInfo.entitlements.active.pro) {
        await Promise.all([
          SecureStore.setItemAsync("onboarding_complete", "true"),
          imageTransformation({
            imageKeys: {
              front: frontImageKey
            }
          }),
          router.replace({
            pathname: "/(onboarding)/results",
            params: { unlocked: "true" }
          })
        ]);
      }
    } catch (error) {
      console.error("Error purchasing:", error);
      if (error instanceof Error) {
        Alert.alert("Purchase Failed", error.message);
        Sentry.captureException(error);
      } else {
        Alert.alert("Purchase Failed", "An error occurred while processing your purchase. Please try again.");
        Sentry.captureException(error);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSelectPackage = useCallback((pkg: PurchasesPackage) => {
    setSelectedPackage(pkg);
  }, []);

  return (
    <LinearGradient colors={["#1f1f1f", "#111"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.header}>
            <View className="flex-row items-center justify-center">
              <Pressable
                onPress={() => router.back()}
                hitSlop={20}
                className="absolute left-0 -translate-y-1"
              >
                <Feather name="arrow-left" size={24} color="white" />
              </Pressable>
              <Text style={styles.title}>Snatched AI Premium</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Unlimited access including: Daily routine, personalized prediction &
            exercises to help you maximize your potential.
          </Text>

          {/* Subscription Options */}
          <PlanSelection
            plans={plans}
            packages={packages}
            selectedPackage={selectedPackage}
            onSelectPackage={handleSelectPackage}
          />

          <Text style={styles.featuresTitle}>Here's what you'll get:</Text>

          {/* Benefits Carousel */}
          <View style={styles.carouselContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              onScrollBeginDrag={onScrollBegin}
              onScrollEndDrag={onScrollEnd}
              onMomentumScrollEnd={onScrollEnd}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={CAROUSEL_ITEM_WIDTH + 20}
              contentContainerStyle={styles.carouselContent}
            >
              <View
                style={[styles.carouselItem, { width: CAROUSEL_ITEM_WIDTH }]}
              >
                <VisualizeGoalSection />
              </View>
              <View
                style={[styles.carouselItem, { width: CAROUSEL_ITEM_WIDTH }]}
              >
                <WorkoutPlanSection />
              </View>
              <View
                style={[styles.carouselItem, { width: CAROUSEL_ITEM_WIDTH }]}
              >
                <NutritionPlanSection />
              </View>
              <View
                style={[styles.carouselItem, { width: CAROUSEL_ITEM_WIDTH }]}
              >
                <SnatchHacksSection />
              </View>
            </ScrollView>

            {/* Pagination Dots */}
            <View style={styles.paginationDots}>
              {[0, 1, 2, 3].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentPage === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.footer}>
          {/* Legal Links */}
          <View className="mb-4 items-center">
            <Text className="text-center text-xs text-gray-400">
              By continuing, you agree to our{' '}
              <Text
                className="font-inter-medium text-pink-300 underline"
                onPress={() => Linking.openURL("https://snatchedai.com/terms")}
              >
                Terms
              </Text>
              <Text>{', '}</Text>
              <Text
                className="font-inter-medium text-pink-300 underline"
                onPress={() => Linking.openURL("https://snatchedai.com/privacy")}
              >
                Privacy Policy
              </Text>
              <Text>{', and '}</Text>
              <Text
                className="font-inter-medium text-pink-300 underline"
                onPress={() => Linking.openURL("https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")}
              >
                EULA
              </Text>
            </Text>
          </View>
          <StyledButton
            title={isPurchasing ? "Processing..." : "Continue"}
            disabled={!selectedPackage || isPurchasing}
            onPress={() => {
              void makePurchase();
            }}
            variant="primary"
            style={{ backgroundColor: "#f472b6", marginBottom: 15 }}
          />
          <Pressable 
            onPress={async () => {
              try {
                setIsPurchasing(true);
                const restoredInfo = await Purchases.restorePurchases();
                if (restoredInfo.activeSubscriptions.length > 0) {
                  Alert.alert('Success', 'Your purchases have been restored!');
                  await Promise.all([
                    SecureStore.setItemAsync("onboarding_complete", "true"),
                    imageTransformation({
                      imageKeys: {
                        front: frontImageKey
                      }
                    }),
                    router.replace({
                      pathname: "/(onboarding)/results",
                      params: { unlocked: "true" }
                    })
                  ]);
                } else {
                  Alert.alert('No Purchases', 'No previous purchases found to restore');
                }
              } catch (error) {
                console.error('Error restoring purchases:', error);
                if (error instanceof Error) {
                  Alert.alert('Error', error.message);
                  Sentry.captureException(error);
                } else {
                  Alert.alert('Error', 'Failed to restore purchases');
                  Sentry.captureException(error);
                }
              } finally {
                setIsPurchasing(false);
              }
            }}
          >
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default withOnboardingTracking(PaywallScreen, 'paywall');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for footer
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    width: "100%",
  },
  title: {
    fontFamily: "inter-bold",
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: "inter-medium",
    fontSize: 15,
    color: "rgb(156 163 175)", // gray-400
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  planContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  planBox: {
    flex: 1,
    backgroundColor: "rgb(55 65 81)", // gray-700
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    paddingHorizontal: 15,
    paddingVertical: 20, // Increased vertical padding
    position: "relative", // For popular badge positioning
  },
  selectedPlanBox: {
    borderColor: "#f472b6", // Primary pink color
    backgroundColor: "rgba(244, 114, 182, 0.1)", // Slight pink background tint
  },
  popularBadge: {
    position: "absolute",
    top: -12, // Position above the box
    right: 12,
    backgroundColor: "#f472b6", // Primary pink color
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  popularText: {
    fontFamily: "inter-semibold",
    fontSize: 11,
    color: "white",
  },
  planContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5, // Space below potential popular badge
  },
  planName: {
    fontFamily: "inter-semibold",
    fontSize: 16,
    color: "white",
    marginBottom: 4,
  },
  planPrice: {
    fontFamily: "inter-medium",
    fontSize: 14,
    color: "rgb(156 163 175)", // gray-400
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgb(107 114 128)", // gray-500
    justifyContent: "center",
    alignItems: "center",
  },
  selectedRadioOuter: {
    borderColor: "#f472b6", // Primary pink color
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f472b6", // Primary pink color
  },
  featuresTitle: {
    fontFamily: "inter-semibold",
    fontSize: 16,
    color: "rgb(209 213 219)", // gray-300
    textAlign: "center",
    marginBottom: 20,
  },
  carouselContainer: {
    marginBottom: 20,
  },
  carouselContent: {
    paddingHorizontal: 0,
  },
  carouselItem: {
    marginRight: 20, // Space between items
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(107, 114, 128, 0.5)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#f472b6", // Primary pink color
    width: 24, // Make active dot wider
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20, // Adjust for bottom safe area/nav bar
    paddingTop: 15,
    backgroundColor: "transparent", // Matches LinearGradient background
  },
  restoreText: {
    fontFamily: "inter-medium",
    fontSize: 15,
    color: "#f472b6", // Primary pink color
    textAlign: "center",
  },
});
