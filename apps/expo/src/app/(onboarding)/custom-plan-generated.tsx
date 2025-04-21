import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyledButton } from "@/components/core";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const currentShape =
  "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80";

// Preview images for each week
const weeklyPreviews = [
  "https://images.unsplash.com/photo-1518310383802-640c2de311b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1518310383802-640c2de311b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
];

const LockedPreviewCard = ({
  week,
  imageUrl,
}: {
  week: string;
  imageUrl: string;
}) => (
  <View className="relative mb-6 aspect-square w-[47%] overflow-hidden rounded-2xl">
    <Image
      source={{ uri: imageUrl }}
      style={{ width: "100%", height: "100%", opacity: 0.5 }}
      contentFit="cover"
      blurRadius={20}
    />
    <View className="absolute inset-0 bg-black/5" />
    <View className="absolute inset-0 items-center justify-center">
      <MaterialIcons name="lock" size={24} color="black" />
    </View>
    <Text className="font-inter-medium absolute bottom-3 left-0 right-0 text-center text-sm text-black">
      Week {week}
    </Text>
  </View>
);

export default function CustomPlanGeneratedScreen() {
  const router = useRouter();

  const handleUnlock = () => {
    router.push("/(onboarding)/fine-tune-plan");
  };

  return (
    <>
      <StatusBar translucent={true} hidden={true} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <LinearGradient
          colors={["#f472b6", "#FED0E2"]}
          style={{
            paddingTop: Constants.statusBarHeight,
            paddingHorizontal: 20,
            paddingBottom: 15,
          }}
        >
          {/* Pink Header Section */}

          <Text className="font-inter-bold mb-8 text-center text-2xl text-white">
            Suzie, we've made you a custom plan
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="items-center">
              <Text className="font-inter-medium mb-2 text-sm text-white">
                Today
              </Text>
              <Image
                source={{ uri: currentShape }}
                style={{ width: 108, height: 140, borderRadius: 12 }}
                contentFit="cover"
              />
            </View>

            <View className="">
              <Ionicons
                name="arrow-forward"
                size={32}
                color="white"
                style={{ marginHorizontal: 8 }}
              />
            </View>

            <View className="items-center">
              <Text className="font-inter-medium mb-2 text-sm text-white">
                Snatched (Jul 15)
              </Text>
              <View className="h-40 w-32 items-center justify-center overflow-hidden rounded-xl bg-black/5">
                <Image
                  source={{ uri: weeklyPreviews[3] }}
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0.3,
                  }}
                  contentFit="cover"
                  blurRadius={30}
                />
                <MaterialIcons name="lock" size={24} color="black" />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Weekly Preview Grid */}
        <View className="mt-6 flex-row flex-wrap justify-between px-6">
          {weeklyPreviews.map((imageUrl, index) => (
            <LockedPreviewCard
              key={index}
              week={(index + 1).toString()}
              imageUrl={imageUrl}
            />
          ))}
        </View>

        {/* Unlock Preview Card */}
        <Pressable
          onPress={handleUnlock}
          className="mx-4 mt-4 flex-row items-center rounded-xl bg-pink-50 p-6"
        >
          <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-pink-100">
            <MaterialIcons name="lock" size={18} color="black" />
          </View>
          <View className="flex-1">
            <Text className="font-inter-semibold text-base text-black">
              Unlock Visual Preview
            </Text>
            <Text className="text-sm text-gray-600">
              See your transformation week by week
            </Text>
          </View>
        </Pressable>

        {/* Timeline Preview (Blurred/Locked) */}
        <View className="relative mx-6 mt-6 h-20 overflow-hidden rounded-xl">
          <Image
            source={{ uri: weeklyPreviews[0] }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              height: "100%",
              opacity: 0.3,
            }}
            contentFit="cover"
            blurRadius={30}
          />
          <View className="absolute inset-0 bg-black/5" />
          <View className="absolute inset-0 items-center justify-center">
            <MaterialIcons name="lock" size={24} color="black" />
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="mb-6 mt-auto p-6">
        <StyledButton
          title="Continue"
          onPress={handleUnlock}
          variant="primary"
        />
      </View>
    </>
  );
}
