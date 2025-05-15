import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as StoreReview from "expo-store-review";
import testimonial1 from "@/assets/images/testimonials/image1.jpeg";
import testimonial2 from "@/assets/images/testimonials/image2.jpeg";
import testimonial3 from "@/assets/images/testimonials/image3.jpeg";
import { StyledButton } from "@/components/core";
import { withOnboardingTracking } from "@/components/core/withOnboardingTracking";
import { Feather } from "@expo/vector-icons";

function ReviewScreen() {
  const [isDisabled, setIsDisabled] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkReview = async () => {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      }
    };

    void checkReview();
    setTimeout(() => {
      setIsDisabled(false);
    }, 2000);
  }, []);

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

  return (
    <LinearGradient colors={["#f472b6", "#FED0E2"]} style={{ flex: 1 }}>
      <SafeAreaView
        style={{ paddingTop: Constants.statusBarHeight }}
        className="flex-1"
      >
        <View className="flex-1 p-8">
          <View className="mb-6 flex-row items-center justify-center">
            <Pressable
              onPress={() => router.back()}
              hitSlop={20}
              className="absolute left-0 -translate-y-1"
            >
              <Feather name="arrow-left" size={24} color="white" />
            </Pressable>
            <Text className="font-inter-bold text-center text-2xl text-white">
              Give us a rating
            </Text>
          </View>

          {/* Star Rating */}
          <View className="mb-8 flex-row justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <View
                key={rating}
                className="p-1"
              >
                <Text className="text-4xl">
                  {rating <= 4 ? "⭐" : "⭐"}
                </Text>
              </View>
            ))}
          </View>

          <Text className="font-inter-bold mb-8 px-8 text-center text-2xl text-white">
            Snatched AI was made for people like you
          </Text>

          {/* Testimonials */}

          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            contentContainerClassName="gap-y-4"
            className="p-8"
            showsVerticalScrollIndicator={false}
          >
            {testimonials.map((testimonial, index) => (
              <View
                key={index}
                className="rounded-xl bg-white/90 p-6 shadow-lg"
                style={{
                  shadowColor: "#F6ADCE",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                }}
              >
                <View className="mb-4 flex-row items-center">
                  <View className="h-12 w-12 overflow-hidden rounded-full bg-pink-100">
                    <Image
                      source={testimonial.image}
                      style={{ width: 48, height: 48 }}
                      contentFit="cover"
                    />
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
                <Text className="font-inter-medium text-gray-700">
                  {testimonial.quote}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View className="mt-auto pt-8">
            <StyledButton
              title="Continue"
              disabled={isDisabled}
              onPress={() => router.push("/(onboarding)/paywall")}
              className="flex flex-row gap-x-3 rounded-full"
              variant="primary"
              style={{ backgroundColor: "#f472b6" }}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default withOnboardingTracking(ReviewScreen, "review");
