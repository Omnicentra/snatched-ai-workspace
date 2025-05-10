import React from "react";
import { Platform, Pressable, SafeAreaView, Text, View } from "react-native";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { BubbleLetter } from "@/components/core/BubbleLetter";
import { appVariant, cn } from "@/lib/utils";
import { authClient } from "@/utils/auth";

import brandLogo from "../../assets/images/logo2.png";

export default function SplashScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleGetStarted = () => {
    void Haptics.selectionAsync().then(() => {
      router.push("/(onboarding)/body-positivity");
    });
  };

  const handleLogin = () => {
    void Haptics.selectionAsync().then(() => {
      return session?.user
        ? router.replace("/(tabs)/home")
        : router.replace("/(auth)/login");
    });
  };

  const handleSkip = () => {
    void Haptics.selectionAsync().then(() => {
      router.push("/(onboarding)/results?unlocked=true");
    });
  };

  console.log("appVariant", appVariant);

  return (
    <LinearGradient
      colors={["#f472b6", "#FED0E2"]}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView
        style={{ paddingTop: Constants.statusBarHeight }}
        className="h-full items-center justify-center"
      >
        <View className="w-full items-center justify-center gap-y-10 p-8">
          <View className={cn("h-32 w-32 items-center justify-center rounded-full bg-transparent", Platform.OS === 'ios' ? 'shadow-lg' : '')}>
            <Image
              source={brandLogo}
              className="h-full w-full"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </View>

          <View className="w-full items-center">
            <View className="mb-2 flex-row">
              <BubbleLetter _delay={1}>S</BubbleLetter>
              <BubbleLetter _delay={2}>n</BubbleLetter>
              <BubbleLetter _delay={3}>a</BubbleLetter>
              <BubbleLetter _delay={4}>t</BubbleLetter>
              <BubbleLetter _delay={5}>c</BubbleLetter>
              <BubbleLetter _delay={6}>h</BubbleLetter>
              <BubbleLetter _delay={7}>e</BubbleLetter>
              <BubbleLetter _delay={8}>d</BubbleLetter>
              <BubbleLetter _delay={9}> </BubbleLetter>
              <BubbleLetter _delay={10}>A</BubbleLetter>
              <BubbleLetter _delay={11}>I</BubbleLetter>
            </View>
            <Text className="font-inter text-lg text-white">
              Your body, snatched.
            </Text>
          </View>

          <Pressable
            className="rounded-full bg-white px-16 py-4 shadow-lg active:scale-95"
            onPress={handleGetStarted}
          >
            <Text className="font-inter-semibold text-center text-base text-black">
              Get Started
            </Text>
          </Pressable>

          {appVariant !== "production" && (
            <Pressable
              className="rounded-full bg-black px-16 py-4 shadow-lg active:scale-95"
              onPress={handleSkip}
            >
              <Text className="font-inter-semibold text-center text-base text-white">
                Skip
              </Text>
            </Pressable>
          )}
          {appVariant !== "production" && (
            <Pressable
              className="rounded-full bg-black px-16 py-4 shadow-lg active:scale-95"
              onPress={handleLogin}
            >
              <Text className="font-inter-semibold text-center text-base text-white">
                Login
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
