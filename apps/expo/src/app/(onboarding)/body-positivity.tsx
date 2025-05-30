// app/(onboarding)/body-positivity.tsx
import afterImage from "@/assets/images/after.jpeg";
import beforeImage from "@/assets/images/before.jpeg";
import { StyledButton } from "@/components/core";
import { withOnboardingTracking } from "@/components/core/withOnboardingTracking";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming
} from "react-native-reanimated";

// Reusable Animated View for Fade-in effect
const FadeInView = ({
  children,
  delay = 0,  
  duration = 1000,
  style,
  slideFrom = "none",
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: object;
  slideFrom?: "left" | "right" | "none";
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);
  const translateX = useSharedValue(slideFrom === "left" ? -50 : slideFrom === "right" ? 50 : 0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: duration, easing: Easing.out(Easing.ease) }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: duration, easing: Easing.out(Easing.ease) }),
    );
    translateX.value = withDelay(
      delay,
      withTiming(0, { duration: duration, easing: Easing.out(Easing.ease) }),
    );
  }, [delay, duration, opacity, translateY, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
      ],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
};

// Shimmer Effect Component
const ShimmerEffect = () => (
  <LinearGradient
    colors={["transparent", "rgba(255,255,255,0.2)", "transparent"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 16,
    }}
  />
);

// Interactive Image Component
const InteractiveImage = ({
  imageUri,
  label,
  onPress,
}: {
  imageUri: string;
  label: string;
  onPress?: () => void;
}) => {
  const scale = useSharedValue(1);
  const shimmerPosition = useSharedValue(-100);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10 });
    // Trigger shimmer effect
    shimmerPosition.value = withSequence(
      withTiming(-100, { duration: 0 }),
      withTiming(400, { duration: 1000 }),
    );
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value }],
  }));

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={[animatedStyle]} className="items-center">
        <View className="overflow-hidden rounded-2xl shadow-lg">
          <Image
            source={imageUri}
            style={{ width: 150, height: 210 }}
            cachePolicy="memory-disk"
            contentFit="cover"
          />
          <Animated.View style={shimmerStyle}>
            <ShimmerEffect />
          </Animated.View>
        </View>
        <Text className="font-inter-bold mt-3 text-base text-white/90">
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

// Before and After Image Component
const TransformationImages = () => {
  const handleBeforePress = () => {
    // Could add functionality here like showing a larger view
    console.log("Before image pressed");
  };

  const handleAfterPress = () => {
    // Could add functionality here like showing a larger view
    console.log("After image pressed");
  };

  return (
    <View className="w-full items-center justify-center px-4">
      <View className="w-full max-w-[340px] flex-row items-center justify-between">
        {/* Before Image */}
        <FadeInView delay={1000} duration={1000} slideFrom="left">
          <InteractiveImage
            imageUri={beforeImage}
            label="Before"
            onPress={handleBeforePress}
          />
        </FadeInView>

        {/* Arrow */}
        <FadeInView delay={1200} duration={800}>
          <View>
            <Text className="text-3xl font-bold text-white">→</Text>
          </View>
        </FadeInView>

        {/* After Image */}
        <FadeInView delay={2000} duration={1000} slideFrom="right">
          <InteractiveImage
            imageUri={afterImage}
            label="After"
            onPress={handleAfterPress}
          />
        </FadeInView>
      </View>
    </View>
  );
};

function BodyPositivityScreen() {
  const router = useRouter();

  const handleBeginGlowUp = () => {
    router.push("/(onboarding)/goal");
  };

  return (
    <LinearGradient
      colors={["#f472b6", "#FED0E2"]}
      style={{ flex: 1, paddingBottom: 20 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View
        className="relative flex-1"
        style={{ paddingTop: Constants.statusBarHeight }}
      >
        <StatusBar translucent={true} hidden={true} />

        {/* Main Content Area */}
        <View className="flex-1 px-6">
          {/* Header Text - Split into two parts */}
          <View className="grow mb-6 mt-12 justify-center">
            {/* First part - animates with before image */}
            <FadeInView delay={300} duration={500}>
              <Text className="font-inter-bold text-center text-5xl leading-tight text-white">
                We help you go{"\n"}
              </Text>
            </FadeInView>
            <View className="flex-row items-center justify-around my-2">
              <FadeInView delay={1000} duration={1000} slideFrom="left">
                <Text className="font-inter-bold text-center text-4xl leading-tight text-white">
                  from this
                </Text>
              </FadeInView>

              {/* Second part - animates with after image */}
              <FadeInView delay={2000} duration={1000} slideFrom="right">
                <Text className="font-inter-bold text-center text-4xl leading-tight text-white">
                  to THIS!
                </Text>
              </FadeInView>
            </View>
            {/* Transformation Images */}
            <View className="items-center justify-center">
              <TransformationImages />
            </View>
          </View>

          <View className="flex-1"></View>

          {/* CTA Button */}
          <View className="mb-8">
            <FadeInView delay={2500} duration={1000}>
              <StyledButton
                title="Begin My Glow-Up Journey ✨"
                onPress={handleBeginGlowUp}
                variant="secondary"
                className="border-2 border-white bg-white"
              />
            </FadeInView>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

export default withOnboardingTracking(BodyPositivityScreen, "body_positivity");
