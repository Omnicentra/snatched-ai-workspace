import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Dimensions,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Purchases from "react-native-purchases";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import testimonial1 from "@/assets/images/testimonials/image1.jpeg";
import testimonial2 from "@/assets/images/testimonials/image2.jpeg";
import testimonial3 from "@/assets/images/testimonials/image3.jpeg";
import { StyledButton } from "@/components/core";
import { PlanSelection } from "@/components/core/PlanSelection";
import { withOnboardingTracking } from "@/components/core/withOnboardingTracking";
import { VisualizeGoalSection } from "@/components/paywall";
import { Analytics } from "@/lib/analytics";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { transformationStore$ } from "@/stores/transformation.store";
import { api } from "@/utils/api";
import { authClient } from "@/utils/auth";
import { getOrCreateDeviceId } from "@/utils/device-id";
import { Feather } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";
import * as Sentry from "@sentry/react-native";

import { logger } from "~/lib/logger";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 40; // 20px padding on each side

// Add new Testimonial Component
const TestimonialCarousel = () => {
  const testimonials = [
    {
      quote:
        "I have seen incredible results in just 3 weeks! My confidence is through the roof.",
      name: "Jessica L.",
      status: "Verified Member",
      image: testimonial1,
    },
    {
      quote:
        "The personalized workout plan really helped me stay consistent. Amazing results!",
      name: "Sarah M.",
      status: "Verified Member",
      image: testimonial2,
    },
    {
      quote:
        "Best investment I've made for my fitness journey. The community is so supportive!",
      name: "Emily R.",
      status: "Verified Member",
      image: testimonial3,
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
            {/* Stars Row */}
            <View className="mb-2 flex-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <Text key={star} className="text-xl">⭐</Text>
              ))}
            </View>

            {/* Large pink quote mark */}
            {/* <Text className="font-inter-bold text-5xl text-pink-200">"</Text> */}

            <View className="mb-6">
              <Text className="font-inter-medium text-lg leading-8 text-gray-900">
                {testimonial.quote}
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="h-12 w-12 overflow-hidden rounded-full">
                <View className="h-full w-full items-center justify-center rounded-full bg-pink-100">
                  <Image
                    source={testimonial.image}
                    style={{
                      width: 48,
                      height: 48,
                    }}
                    contentFit="cover"
                  />
                </View>
              </View>
              <View className="ml-3">
                <Text className="font-inter-bold text-base text-gray-900">
                  {testimonial.name}
                </Text>
                <View className="flex-row items-center">
                  <Feather name="check-circle" size={14} color="#10B981" />

                  <Text className="font-inter-medium ml-1 text-sm text-gray-500">
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

interface Plan {
  id: string;
  name: string;
  price: string;
  popular: boolean;
  packageId: string;
}

function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    skipped?: string;
    specialOffer?: string;
    inactive?: string;
  }>();
  const isSkipped = params.skipped === "true";
  const isSpecialOffer = params.specialOffer === "true";
  const isInactive = params.inactive === "true";
  const { data: session } = authClient.useSession();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const leftAppForPromoRef = useRef(false);
  const appState = useRef(AppState.currentState);

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
        logger.error("Failed to transform image", error.message);
        Sentry.captureException(error);
      },
    });
  const currentImage = use$(transformationStore$.currentImage);
  const snatchedImage = use$(transformationStore$.snatchedImage);

  const frontImageKey = use$(onboardingStore$.onboarding.frontViewPhoto);

  // Shared function for handling successful purchase or restored purchase
  const handleSuccessfulPurchase = async () => {
    // Always reset the after transformation image
    transformationStore$.snatchedImage.set(null);

    await Promise.all([
      SecureStore.setItemAsync("onboarding_complete", "true"),
      // Only transform image if not skipped
      isSkipped
        ? null
        : imageTransformation({
            imageKeys: {
              front: frontImageKey,
            },
          }),
      // Route to different screens based on whether photos were skipped or not
      isSkipped
        ? router.replace("/(onboarding)/notifications")
        : router.replace({
            pathname: "/(onboarding)/results",
            params: { unlocked: "true" },
          }),
    ]);
  };

  const fetchPackages = async () => {
    try {
      logger.debug("Fetching packages", Platform.OS);
      const offerings = await Purchases.getOfferings();
      logger.debug("Offerings: ", offerings);
      const availablePackages = offerings.all.default?.availablePackages;

      logger.debug("All packages: ", availablePackages);

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
          logger.debug("Weekly package found", weeklyPackage.product);
          plansObj.weekly = {
            id: weeklyPackage.packageType.toLowerCase(),
            name: "Weekly",
            price: weeklyPackage.product.priceString,
            popular: false,
            packageId: weeklyPackage.product.identifier,
          };
        }

        if (lifetimePackage) {
          logger.debug("Lifetime package found", lifetimePackage.product);
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
      logger.error("Error fetching packages:", error);
      Alert.alert(
        "Error",
        "Failed to load subscription plans. Please try again.",
      );
    }
  };

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
              : "week",
        });
      }
      if (customerInfo.entitlements.active.premium) {
        await handleSuccessfulPurchase();
      }
    } catch (error) {
      logger.error("Error processing purchase:");
      if (error instanceof Error) {
        logger.debug(error.message);
        if (error.message === "Purchase was cancelled.") {
          router.push("/(onboarding)/special-offer");
        } else {
          Sentry.captureException(error);
        }
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

  // Handle app state changes for promo code redemption
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current === "active" && leftAppForPromoRef.current) {
        // User has returned to the app after potentially redeeming a promo code
        void (async () => {
          try {
            await Purchases.syncPurchases();
            if (session?.user.email) {
              await Purchases.logIn(session.user.email);
            }
            const customerInfo = await Purchases.getCustomerInfo();
            // Check if customerInfo exists and has premium entitlement
            if (customerInfo.entitlements.active.premium) {
              await handleSuccessfulPurchase();
            }
          } catch (error) {
            logger.error("Error syncing purchases:", error);
            Sentry.captureException(error);
          } finally {
            leftAppForPromoRef.current = false;
          }
        })();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [router, frontImageKey, imageTransformation, isSkipped]);

  const handlePromoCodeSubmit = async () => {
    if (promoCode.trim()) {
      const url = `https://apps.apple.com/redeem?ctx=offercodes&id=6744844397&code=${promoCode.trim()}`;
      leftAppForPromoRef.current = true; // Set flag before leaving app
      await Linking.openURL(url);
      setIsPromoModalVisible(false);
      setPromoCode("");
    }
  };

  return (
    <LinearGradient colors={["#f472b6", "#FED0E2"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.header}>
              <View className="flex-row items-center justify-center">
                <Pressable
                  onPress={() => {
                    if (isInactive) {
                      router.replace("/(modals)/subscription");
                    } else if (!isSpecialOffer) {
                      router.push("/(onboarding)/special-offer");
                    } else {
                      router.back();
                    }
                  }}
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
              <View className="flex-row items-center gap-x-4 rounded-xl bg-white/90 p-4">
                <Text className="text-2xl">💪 </Text>
                <Text className="font-inter-medium text-lg text-gray-900">
                  Personalized workout plan
                </Text>
              </View>

              <View className="flex-row items-center gap-x-4 rounded-xl bg-white/90 p-4">
                <Text className="text-2xl">🥗 </Text>
                <Text className="font-inter-medium text-lg text-gray-900">
                  Nutrition and Diet Plan
                </Text>
              </View>

              <View className="flex-row items-center gap-x-4 rounded-xl bg-white/90 p-4">
                <Text className="text-2xl">📊 </Text>
                <Text className="font-inter-medium text-lg text-gray-900">
                  Calories Tracking
                </Text>
              </View>

              <View className="flex-row items-center gap-x-4 rounded-xl bg-white/90 p-4">
                <Text className="text-2xl">😎 </Text>
                <Text className="font-inter-medium text-lg text-gray-900">
                  Secret snatched tips
                </Text>
              </View>

              <View className="flex-row items-center gap-x-4 rounded-xl bg-white/90 p-4">
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
              <Text className="text-center text-xs text-gray-100">
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

            {/* Footer Links Container */}
            <View className="mb-4 flex-row items-center justify-center gap-x-6">
              <Pressable onPress={() => setIsPromoModalVisible(true)}>
                <Text className="font-inter-medium text-center text-white">
                  Have a promo code?
                </Text>
              </Pressable>

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
                      await handleSuccessfulPurchase();
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
                <Text className="font-inter-medium text-center text-white">
                  Restore Purchases
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Promo Code Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isPromoModalVisible}
            onRequestClose={() => setIsPromoModalVisible(false)}
          >
            <View className="flex-1 justify-center bg-black/50">
              <View className="mx-4 rounded-2xl bg-white p-6">
                <Text className="font-inter-semibold mb-4 text-center text-xl text-gray-900">
                  Enter Promo Code
                </Text>
                <TextInput
                  className="font-inter-medium mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4 text-base text-gray-900"
                  placeholder="Enter your code"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View className="flex-row gap-x-3">
                  <Pressable
                    className="flex-1 rounded-lg bg-gray-200 p-4"
                    onPress={() => setIsPromoModalVisible(false)}
                  >
                    <Text className="font-inter-medium text-center text-base text-gray-700">
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    className="flex-1 rounded-lg bg-pink-500 p-4"
                    onPress={handlePromoCodeSubmit}
                  >
                    <Text className="font-inter-medium text-center text-base text-white">
                      Redeem
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
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
