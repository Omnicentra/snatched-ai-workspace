import beforeAfter from "@/assets/images/before_after.jpeg";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import { Blurred } from "../core/Blurred";

interface VisualizeGoalSectionProps {
  currentImage: string | null;
  snatchedImage: string | null;
}

export const VisualizeGoalSection = ({
  currentImage,
  snatchedImage,
}: VisualizeGoalSectionProps) => {

  const shouldUseCustomImages = currentImage && snatchedImage;

  return (
    <View className="rounded-2xl bg-white/90 p-4">
      <Text className="font-inter-bold mb-4 text-2xl text-gray-900">
        Visualize your goal
      </Text>
      <View className="rounded-xl bg-pink-50/80 p-4">
        {/* Before-After Image */}
        <View className="mb-4">
          <View className="h-[280px] w-full overflow-hidden rounded-xl">
            {shouldUseCustomImages ? (
              <View className="flex-row h-full">
                <View className="flex-1 relative">
                  <Image
                    source={{ uri: currentImage }}
                    className="h-full w-full"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 15,
                    }}
                    contentFit="cover"
                  />
                  <View className="absolute bottom-3 left-3 rounded-full bg-pink-400/40 px-3 py-1">
                    <Text className="font-inter-medium text-xs text-purple-800">
                      Before
                    </Text>
                  </View>
                </View>
                <View className="flex-1 relative">
                  <Image
                    source={{ uri: snatchedImage }}
                    className="h-full w-full"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 15,
                    }}
                    contentFit="cover"
                  />
                  <View className="absolute bottom-3 right-3 rounded-full bg-pink-400/40 px-3 py-1">
                    <Text className="font-inter-medium text-xs text-purple-800">
                      After
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <>
                <Image
                  source={beforeAfter}
                  className="h-full w-full"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 15,
                  }}
                  contentFit="cover"
                />
                <View className="absolute bottom-3 left-3 rounded-full bg-pink-400/20 px-3 py-1">
                  <Text className="font-inter-medium text-xs text-pink-600">
                    Before
                  </Text>
                </View>
                <View className="absolute bottom-3 right-3 rounded-full bg-pink-400/20 px-3 py-1">
                  <Text className="font-inter-medium text-xs text-pink-600">
                    After
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row justify-between rounded-xl bg-white/80 p-4">
          <View className="items-center">
            <Text className="font-inter-medium text-sm text-gray-600">
              Starting
            </Text>
            <Blurred intensity={50}>
              <Text className="font-inter-bold text-xl text-gray-900">32"</Text>
            </Blurred>
            <Text className="font-inter-medium text-xs text-gray-500">
              waist
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-inter-medium text-sm text-gray-600">
              Goal
            </Text>
            <Blurred intensity={50}>
              <Text className="font-inter-bold text-xl text-gray-900">26"</Text>
            </Blurred>
            <Text className="font-inter-medium text-xs text-gray-500">
              waist
            </Text>
          </View>
          <View className="items-center">
            <Text className="font-inter-medium text-sm text-gray-600">
              Timeline
            </Text>
            <Blurred intensity={50}>
              <Text className="font-inter-bold text-xl text-gray-900">12</Text>
            </Blurred>
            <Text className="font-inter-medium text-xs text-gray-500">
              weeks
            </Text>
          </View>
        </View>

        <Text className="font-inter-medium mt-3 text-center text-sm text-gray-600">
          Join thousands of women who have achieved their dream figure with our
          proven program
        </Text>
      </View>
    </View>
  );
}; 