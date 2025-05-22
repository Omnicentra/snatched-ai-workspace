import logoWhite from "@/assets/images/logo2.png";
import { BackButton } from "@/components/common/BackButton";
import { StyledButton } from "@/components/core";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Animated,
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    Alert,
} from "react-native";
import Purchases from "react-native-purchases";
import * as SecureStore from "expo-secure-store";
import * as Sentry from "@sentry/react-native";
import { authClient } from "@/utils/auth";
import { getOrCreateDeviceId } from "@/utils/device-id";
import { Analytics } from "@/lib/analytics";
import { transformationStore$ } from "@/stores/transformation.store";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { use$ } from "@legendapp/state/react";
import { logger } from "~/lib/logger";

const { width } = Dimensions.get("window");

export default function SpecialOfferScreen() {
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { data: session } = authClient.useSession();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);
  const timerOpacity = new Animated.Value(0);
  const timerScale = new Animated.Value(0.5);
  const frontImageKey = use$(onboardingStore$.onboarding.frontViewPhoto);

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Fade in and scale up main content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Timer animation with bounce
      Animated.parallel([
        Animated.timing(timerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(timerScale, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleSuccessfulPurchase = async () => {
    try {
      await SecureStore.setItemAsync("onboarding_complete", "true");
      
      if (!frontImageKey) {
        router.replace("/(onboarding)/notifications");
        return;
      }

      router.replace({
        pathname: "/(onboarding)/results",
        params: { unlocked: "true" },
      });
    } catch (error) {
      logger.error("Error handling successful purchase:", error);
      Sentry.captureException(error);
    }
  };

  const handleContinue = async () => {
    if (isPurchasing) return;

    try {
      setIsPurchasing(true);

      // Get available packages
      const offerings = await Purchases.getOfferings();
      const availablePackages = offerings.all.special?.availablePackages;

      if (!availablePackages?.length) {
        throw new Error("No packages available");
      }
      
      availablePackages.forEach((pkg) => logger.info(pkg.product.identifier));

      // Find the special offer package
      const specialOfferPackage = availablePackages.find(
        (pkg) => pkg.product.identifier === "snatched_monthly_offer_80"
      );

      if (!specialOfferPackage) {
        throw new Error("Special offer package not found");
      }

      // Make the purchase
      const { customerInfo, productIdentifier } = await Purchases.purchasePackage(
        specialOfferPackage
      );

      // Track analytics
      const deviceId = await getOrCreateDeviceId();
      const userId = session?.user.id;

      if (userId) {
        Analytics.trackSubscriptionPurchase(deviceId, userId, {
          planId: productIdentifier,
          planName: specialOfferPackage.product.identifier,
          price: specialOfferPackage.product.price,
          currency: specialOfferPackage.product.currencyCode,
          interval: "month",
        });
      }

      if (customerInfo.entitlements.active.premium) {
        await handleSuccessfulPurchase();
      }
    } catch (error) {
      logger.error("Error processing special offer purchase:");
      if (error instanceof Error) {
        logger.debug(error.message);
        if (error.message !== "Purchase was cancelled.") {
          Alert.alert(
            "Purchase Failed",
            "Unable to process your purchase. Please try again."
          );
          Sentry.captureException(error);
        }
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <LinearGradient
      colors={["#4F46E5", "#7C3AED", "#EC4899"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
          <View className="flex-row items-center justify-center">
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={logoWhite}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <View className="absolute right-0">
                <BackButton iconName="close" backButtonBgColor="bg-gray-100/70" />
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View className="flex-row items-center justify-center">
              <Text style={styles.title}>ONE TIME OFFER</Text>
            </View>
          </View>

          {/* Main Content */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Discount Badge */}
            <View className="shadow-lg shadow-white/30">
              <LinearGradient
                colors={["#F472B6", "#EC4899"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.discountBadge, styles.cardBorder]}
              >
                <Text style={styles.discountText}>80%</Text>
                <Text style={styles.discountLabel}>DISCOUNT</Text>
              </LinearGradient>
            </View>

            <Text style={styles.subtitle}>You will never see this again</Text>

            {/* Timer */}
            <View>
              <Animated.View
                className="shadow-lg shadow-white/90"
                style={[
                  styles.timerContainer,
                  {
                    opacity: timerOpacity,
                    transform: [{ scale: timerScale }],
                  },
                ]}
              >
                <Text style={styles.timerLabel}>This offer will expire in</Text>
                <Text style={styles.timer}>5:00</Text>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer} className="gap-y-8">
            {/* Price Box */}
            <View className="shadow-lg shadow-purple-500/30">
              <LinearGradient
                colors={["rgba(124, 58, 237, 0.9)", "rgba(79, 70, 229, 0.95)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.priceBox, styles.cardBorder]}
              >
                <Text style={styles.priceLabel}>LOWEST PRICE EVER</Text>
                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.planType}>Yearly</Text>
                    <Text style={styles.planDuration}>12mo • £30.29</Text>
                  </View>
                  <Text style={styles.discountedPrice}>£5.99/mo</Text>
                </View>
              </LinearGradient>
            </View>
            <View style={styles.cardGlow}>
              <LinearGradient
                colors={["#F472B6", "#EC4899"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <StyledButton
                  title={
                    isPurchasing ? "Processing..." : "CLAIM YOUR OFFER NOW"
                  }
                  onPress={handleContinue}
                  disabled={isPurchasing}
                  variant="primary"
                  style={styles.button}
                />
              </LinearGradient>
            </View>
            <Text style={styles.footerText}>
              Cancel anytime • Money back guarantee
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 40,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontFamily: "inter-bold",
    fontSize: 24,
    color: "white",
    textAlign: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  cardGlow: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  cardBorder: {
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  discountBadge: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    width: width - 80,
  },
  discountText: {
    fontFamily: "inter-bold",
    fontSize: 64,
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  discountLabel: {
    fontFamily: "inter-bold",
    fontSize: 24,
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontFamily: "inter-semibold",
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 30,
    // backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 16,
    width: width - 80,
    // borderWidth: 0,
    // borderColor: "rgba(255, 255, 255, 0.2)",
  },
  timerLabel: {
    fontFamily: "inter-medium",
    fontSize: 16,
    color: "white",
    marginBottom: 8,
  },
  timer: {
    fontFamily: "inter-bold",
    fontSize: 40,
    color: "white",
  },
  priceBox: {
    borderRadius: 24,
    padding: 16,
    width: width - 40,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  priceLabel: {
    fontFamily: "inter-bold",
    fontSize: 14,
    color: "white",
    marginBottom: 12,
    textAlign: "center",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  planType: {
    fontFamily: "inter-semibold",
    fontSize: 20,
    color: "white",
  },
  planDuration: {
    fontFamily: "inter-medium",
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  discountedPrice: {
    fontFamily: "inter-bold",
    fontSize: 24,
    color: "white",
  },
  featuresList: {
    width: "100%",
    gap: 15,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  featureText: {
    fontFamily: "inter-medium",
    fontSize: 16,
    color: "#1f2937",
  },
  footer: {
    paddingVertical: 20,
  },
  buttonGradient: {
    borderRadius: 30,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  button: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 30,
  },
  footerText: {
    fontFamily: "inter-medium",
    fontSize: 14,
    color: "white",
    textAlign: "center",
    marginTop: 10,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
