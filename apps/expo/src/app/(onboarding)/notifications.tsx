import React, { useEffect } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyledButton } from "@/components/core";
import { withOnboardingTracking } from "@/components/core/withOnboardingTracking";
import { logger } from "@/lib/logger";
import { requestNotificationPermissions } from "@/lib/notifications";
import { Ionicons } from "@expo/vector-icons";

// Reusable Animated View for Fade-in effect
const FadeInView = ({
  children,
  delay = 0,
  duration = 1000,
  style,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: object;
  className?: string;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: duration, easing: Easing.out(Easing.ease) }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: duration, easing: Easing.out(Easing.ease) }),
    );
  }, [delay, duration, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]} className={className}>
      {children}
    </Animated.View>
  );
};

function NotificationsScreen() {
  const router = useRouter();

  const handleRequestPermission = async () => {
    try {
      // Use our helper function to request permissions
      const permissionGranted = await requestNotificationPermissions();

      if (permissionGranted) {
        logger.info("Notification permissions granted");

        // Navigate to time selection screen
        router.replace("/(onboarding)/notification-time");
      } else {
        logger.info("Notification permissions denied");
        // On iOS, guide the user to enable notifications in settings
        if (Platform.OS === "ios") {
          Alert.alert(
            "Enable Notifications",
            "To receive workout reminders, please enable notifications in your device settings.",
            [
              { text: "Not Now", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => void Notifications.requestPermissionsAsync(),
              },
            ],
          );
        }
        // Permission denied, skip to home screen
        router.push("/(tabs)/home");
      }
    } catch (error) {
      logger.error(
        "Error requesting notification permissions:",
        error instanceof Error ? error.message : String(error),
      );
      // On error, proceed to home screen
      router.push("/(tabs)/home");
    }
  };

  const handleSkip = () => {
    // Skip notification setup and go to home screen
    router.push("/(tabs)/home");
  };

  return (
    <View
      className="relative flex-1 bg-white"
      style={{ paddingTop: Constants.statusBarHeight }}
    >
      <StatusBar translucent={true} />

      {/* Background Shapes */}
      <View
        style={StyleSheet.absoluteFill}
        className="-z-10 overflow-hidden opacity-50"
      >
        <View style={styles.shape1} />
        <View style={styles.shape2} />
        <View style={styles.shape3} />
      </View>

      {/* Header */}
      <View className="mt-12 items-center">
        <FadeInView delay={300} duration={1000}>
          <Text className="font-inter-bold text-center text-3xl text-gray-900">
            Get Notified!
          </Text>
        </FadeInView>
        <FadeInView delay={600} duration={1000}>
          <Text className="font-inter-medium mt-4 px-8 text-center text-base text-gray-600">
            Turn Off Notifications Anytime In Settings
          </Text>
        </FadeInView>
      </View>

      {/* Bell Icon */}
      <FadeInView
        delay={900}
        duration={1000}
        style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
      >
        <View className="h-32 w-32 items-center justify-center rounded-full bg-gray-100">
          <View className="absolute right-2 top-0 h-6 w-6 rounded-full bg-pink-500" />
          <Ionicons name="notifications-outline" size={60} color="#333" />
        </View>
      </FadeInView>

      {/* Benefits Description */}
      <FadeInView
        delay={1200}
        duration={1000}
        style={{ marginHorizontal: 32, marginBottom: 32 }}
      >
        <View className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
          <Text className="font-inter-bold mb-2 text-center text-lg text-gray-900">
            Stay Motivated & On Track
          </Text>
          <Text className="font-inter text-center text-base text-gray-600">
            Daily reminders will help you stay consistent, reach your goals
            faster, and never miss your personalized workout routine.
          </Text>
        </View>
      </FadeInView>

      {/* Buttons */}
      <View className="mb-8 px-8">
        <FadeInView delay={1500} duration={1000} style={{ marginBottom: 12 }}>
          <StyledButton
            title="Allow"
            onPress={handleRequestPermission}
            variant="primary"
          />
        </FadeInView>
        <FadeInView delay={1700} duration={1000}>
          <Pressable onPress={handleSkip} className="items-center py-3">
            <Text className="font-inter-medium text-gray-500">Don't Allow</Text>
          </Pressable>
        </FadeInView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shape1: {
    position: "absolute",
    width: 300,
    height: 300,
    backgroundColor: "#FF9A9E",
    borderRadius: 150,
    opacity: 0.2,
    top: -100,
    left: -100,
  },
  shape2: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: "#FAD0C4",
    borderRadius: 100,
    opacity: 0.2,
    bottom: -50,
    right: -50,
  },
  shape3: {
    position: "absolute",
    width: 150,
    height: 150,
    backgroundColor: "#FFECD2",
    borderRadius: 75,
    opacity: 0.2,
    top: "50%",
    right: -50,
  },
});

export default withOnboardingTracking(NotificationsScreen, "notifications");
