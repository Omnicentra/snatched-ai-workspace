import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Purchases from "react-native-purchases";
import Svg, { Path } from "react-native-svg";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
// 20px padding on each side
import { StyledButton } from "@/components/core";
import { PlanSelection } from "@/components/core/PlanSelection";
import { withOnboardingTracking } from "@/components/core/withOnboardingTracking";
import {
  NutritionPlanSection,
  SnatchHacksSection,
  VisualizeGoalSection,
  WorkoutPlanSection,
} from "@/components/paywall";
import { Analytics } from "@/lib/analytics";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { transformationStore$ } from "@/stores/transformation.store";
import { api } from "@/utils/api";
import { authClient } from "@/utils/auth";
import { getOrCreateDeviceId } from "@/utils/device-id";
import { Feather, Ionicons } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";
import * as Sentry from "@sentry/react-native";

import { logger } from "~/lib/logger";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 40; // 20px padding on each side
const SECTION_HEIGHT = 400;

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

// Add new Testimonial Component
const TestimonialCarousel = () => {
  const testimonials = [
    {
      quote:
        "I have seen incredible results in just 3 weeks! My confidence is through the roof.",
      name: "Jessica L.",
      status: "Verified Member",
      image: null,
    },
    {
      quote:
        "The personalized workout plan really helped me stay consistent. Amazing results!",
      name: "Sarah M.",
      status: "Verified Member",
      image: null,
    },
    {
      quote:
        "Best investment I've made for my fitness journey. The community is so supportive!",
      name: "Emily R.",
      status: "Verified Member",
      image: null,
    },
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const onTestimonialScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / CAROUSEL_ITEM_WIDTH);
    if (page !== currentTestimonial) {
      setCurrentTestimonial(page);
    }
  };

  return (
    <View className="mb-8">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onTestimonialScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CAROUSEL_ITEM_WIDTH + 20}
        contentContainerStyle={styles.carouselContent}
      >
        {testimonials.map((testimonial, index) => (
          <View
            key={index}
            style={[
              styles.carouselItem,
              {
                shadowColor: "#F6ADCE",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 3,
                transform: [{ scale: 1 }],
                width: CAROUSEL_ITEM_WIDTH,
              },
            ]}
            className="rounded-2xl bg-white/90 p-6 shadow-lg shadow-purple-500/30"
          >
            {/* Large pink quote mark */}
            <Text className="font-inter-bold text-5xl text-pink-200">
              "
            </Text>

            <View className="mb-6">
              <Text className="font-inter-medium text-lg leading-8 text-gray-900">
                {testimonial.quote}
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="h-12 w-12 overflow-hidden rounded-full">
                <View className="h-full w-full items-center justify-center rounded-full bg-pink-100">
                  <Text className="font-inter-medium text-lg text-pink-500">
                    {testimonial.name[0]}
                  </Text>
                </View>
              </View>
              <View className="ml-3">
                <Text className="font-inter-bold text-base text-gray-900">
                  {testimonial.name}
                </Text>
                <View className="flex-row items-center">
                  <Feather name="check-circle" size={14} color="#10B981" />

                  <Text className="ml-1 font-inter-medium text-sm text-gray-500">
                    {testimonial.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationDots}>
        {testimonials.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentTestimonial === index && styles.activeDot,
            ]}
          />
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
  const { mutate: imageTransformation } =
    api.user.imageTransformation.useMutation({
      onSuccess: (data) => {
        transformationStore$.currentImage.set(data.currentImageUri);
        transformationStore$.snatchedImage.set(data.transformedImageUri);
      },
      onError: (error) => {
        logger.error("Failed to transform image", error);
        Sentry.captureException(error);
      },
    });
  const currentImage = use$(transformationStore$.currentImage);
  const snatchedImage = use$(transformationStore$.snatchedImage);

  const frontImageKey = use$(onboardingStore$.onboarding.frontViewPhoto);

  useEffect(() => {
    void (async () => {
      try {
        const deviceId = await getOrCreateDeviceId();
        const userId = session?.user.id;
        Analytics.trackPaywallView(deviceId, userId);
        await fetchPackages();
      } catch (error) {
        logger.error("Error initializing paywall:", error);
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
              pkg.product.identifier.toLowerCase().includes("weekly")),
        );

        // Find lifetime package
        const lifetimePackage = availablePackages.find(
          (pkg) =>
            typeof pkg.packageType === "string" &&
            (pkg.packageType.toUpperCase() === "LIFETIME" ||
              pkg.product.identifier.toLowerCase().includes("lifetime")),
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
      Alert.alert(
        "Error",
        "Failed to load subscription plans. Please try again.",
      );
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
      const { customerInfo, productIdentifier } =
        await Purchases.purchasePackage(selectedPackage);

      const deviceId = await getOrCreateDeviceId();
      const userId = session?.user.id;

      if (userId) {
        Analytics.trackSubscriptionPurchase(deviceId, userId, {
          planId: productIdentifier,
          planName: selectedPackage.product.identifier,
          price: selectedPackage.product.price,
          currency: selectedPackage.product.currencyCode,
          interval:
            selectedPackage.product.subscriptionPeriod === "P1Y"
              ? "year"
              : "month",
        });
      }

      if (customerInfo.entitlements.active.pro) {
        await Promise.all([
          SecureStore.setItemAsync("onboarding_complete", "true"),
          imageTransformation({
            imageKeys: {
              front: frontImageKey,
            },
          }),
          router.replace({
            pathname: "/(onboarding)/results",
            params: { unlocked: "true" },
          }),
        ]);
      }
    } catch (error) {
      logger.error("Error processing purchase:", error);
      if (error instanceof Error) {
        Alert.alert("Purchase Failed", error.message);
        Sentry.captureException(error);
      } else {
        Alert.alert(
          "Purchase Failed",
          "An error occurred while processing your purchase. Please try again.",
        );
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
    <LinearGradient colors={["#f472b6", "#FED0E2"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
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
              Unlimited access including: Daily routine, personalized prediction
              & exercises to help you maximize your potential.
            </Text>

            {/* Subscription Options */}
            <PlanSelection
              plans={plans}
              packages={packages}
              selectedPackage={selectedPackage}
              onSelectPackage={handleSelectPackage}
            />

            <Text style={styles.featuresTitle}>Success Stories:</Text>

            {/* Add Testimonial Carousel here */}
            <TestimonialCarousel />

            <Text style={styles.featuresTitle}>Here's what you'll get:</Text>

            {/* Single Visualize Goal Section */}
            <View style={{ marginBottom: 20 }}>
              <VisualizeGoalSection 
                currentImage={currentImage} 
                snatchedImage={snatchedImage} 
              />
            </View>

            {/* Features List */}
            <View className="gap-y-4 px-1">
              <View className="flex-row items-center space-x-4 rounded-xl bg-white/90 p-4">
                <Text className="text-2xl">💪 </Text>
                <Text className="font-inter-medium text-lg text-gray-900">
                  Personalized workout plan
                </Text>
              </View>

              <View className="flex-row items-center space-x-4 rounded-xl bg-white/90 p-4">
                <Text className="text-2xl">🥗 </Text>
                <Text className="font-inter-medium text-lg text-gray-900">
                  Nutrition and Diet Plan
                </Text>
              </View>

              <View className="flex-row items-center space-x-4 rounded-xl bg-white/90 p-4">
                <Text className="text-2xl">📊 </Text>
                <Text className="font-inter-medium text-lg text-gray-900">
                  Calories Tracking
                </Text>
              </View>

              <View className="flex-row items-center space-x-4 rounded-xl bg-white/90 p-4">
                <Text className="text-2xl">😎 </Text>
                <Text className="font-inter-medium text-lg text-gray-900">
                  Secret snatched tips
                </Text>
              </View>

              <View className="flex-row items-center space-x-4 rounded-xl bg-white/90 p-4">
                <Text className="text-2xl">📈 </Text>
                <Text className="font-inter-medium text-lg text-gray-900">
                  Body analysis
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Legal Links */}
            <View className="mb-4 items-center">
              <Text className="text-center text-xs text-gray-400">
                By continuing, you agree to our{" "}
                <Text
                  className="font-inter-medium text-primary underline"
                  onPress={() =>
                    Linking.openURL("https://snatchedai.com/terms")
                  }
                >
                  Terms
                </Text>
                <Text>{", "}</Text>
                <Text
                  className="font-inter-medium text-primary underline"
                  onPress={() =>
                    Linking.openURL("https://snatchedai.com/privacy")
                  }
                >
                  Privacy Policy
                </Text>
                <Text>{", and "}</Text>
                <Text
                  className="font-inter-medium text-primary underline"
                  onPress={() =>
                    Linking.openURL(
                      "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
                    )
                  }
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
              style={{ backgroundColor: "#f472b6", marginBottom: 20 }}
            />
            <Pressable
              onPress={async () => {
                try {
                  setIsPurchasing(true);
                  const restoredInfo = await Purchases.restorePurchases();
                  if (restoredInfo.activeSubscriptions.length > 0) {
                    Alert.alert(
                      "Success",
                      "Your purchases have been restored!",
                    );
                    await Promise.all([
                      SecureStore.setItemAsync("onboarding_complete", "true"),
                      imageTransformation({
                        imageKeys: {
                          front: frontImageKey,
                        },
                      }),
                      router.replace({
                        pathname: "/(onboarding)/results",
                        params: { unlocked: "true" },
                      }),
                    ]);
                  } else {
                    Alert.alert(
                      "No Purchases",
                      "No previous purchases found to restore",
                    );
                  }
                } catch (error) {
                  console.error("Error restoring purchases:", error);
                  if (error instanceof Error) {
                    Alert.alert("Error", error.message);
                    Sentry.captureException(error);
                  } else {
                    Alert.alert("Error", "Failed to restore purchases");
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
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default withOnboardingTracking(PaywallScreen, "paywall");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "transparent",
  },
  mainContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20, // Reduced padding to not overlap with footer
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
    color: "white", // Updated for better contrast on pink background
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
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent white
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
    paddingHorizontal: 15,
    paddingVertical: 20,
    position: "relative",
  },
  selectedPlanBox: {
    borderColor: "white",
    backgroundColor: "rgba(255, 255, 255, 0.95)", // Slightly more opaque when selected
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 12,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  popularText: {
    fontFamily: "inter-semibold",
    fontSize: 11,
    color: "#f472b6", // Pink text on white badge
  },
  planContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  planName: {
    fontFamily: "inter-semibold",
    fontSize: 16,
    color: "#1f1f1f", // Dark text for contrast on white background
    marginBottom: 4,
  },
  planPrice: {
    fontFamily: "inter-medium",
    fontSize: 14,
    color: "#4b5563", // Gray-600 for secondary text
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f472b6",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  selectedRadioOuter: {
    borderColor: "#f472b6",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f472b6",
  },
  featuresTitle: {
    fontFamily: "inter-semibold",
    fontSize: 20,
    color: "white",
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
    marginRight: 20,
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
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "white",
    width: 24,
  },
  footer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 15 : 20,
    paddingTop: 15,
    backgroundColor: "rgba(255, 255, 255, 0)",
    backdropFilter: "blur(8px)",
  },
  restoreText: {
    fontFamily: "inter-medium",
    fontSize: 15,
    color: "white",
    textAlign: "center",
  },
});
