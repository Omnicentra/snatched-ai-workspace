import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
// Import types for static images
import { transformationStore$ } from "@/stores/transformation.store";
import { Ionicons } from "@expo/vector-icons";
import { observer, use$ } from "@legendapp/state/react";

const TransformationPreviewScreen = observer(() => {
  const router = useRouter();
  const { lastUpdated, currentImage, snatchedImage, nextSteps, bodyRating } =
    use$(transformationStore$);
  const { currentSnatchedScore, potentialSnatchedScore } = bodyRating;

  const progress = Math.round(
    ((currentSnatchedScore ?? 0) / (potentialSnatchedScore ?? 100)) * 100,
  );

  const currentImageSource = { uri: currentImage }

  const snatchedImageSource = { uri: snatchedImage }

  const { width: WIDTH } = useWindowDimensions();

  return (
    <LinearGradient
      colors={["#e5e7eb", "#fff"]}
      style={{ flex: 1, paddingTop: Constants.statusBarHeight }}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between p-6">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-4 rounded-full bg-gray-100 p-2"
          >
            <Ionicons name="close" size={24} color="#1F2937" />
          </Pressable>
          <Text className="font-inter-bold text-2xl text-gray-900">
            Your Transformation
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6">
        {/* Progress Stats */}
        <View className="mb-6 flex-row items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <View>
            <Text className="font-inter-medium text-sm text-gray-500">
              Current Score
            </Text>
            <Text className="font-inter-bold text-2xl text-black">
              {currentSnatchedScore}
            </Text>
          </View>
          <View className="h-8 w-[1px] bg-gray-100" />
          <View>
            <Text className="font-inter-medium text-sm text-gray-500">
              Target Score
            </Text>
            <Text className="font-inter-bold text-2xl text-pink-500">
              {potentialSnatchedScore}
            </Text>
          </View>
          <View className="h-8 w-[1px] bg-gray-100" />
          <View>
            <Text className="font-inter-medium text-sm text-gray-500">
              Progress
            </Text>
            <Text className="font-inter-bold text-2xl text-black">
              {progress}%
            </Text>
          </View>
        </View>

        {/* Image Comparison */}
        <View className="flex-row gap-x-4">
          {/* Current Image */}
          <View className="flex-1">
            <View className="mb-3 flex-row items-center">
              <View className="mr-2 h-2 w-2 rounded-full bg-gray-400" />
              <Text className="font-inter-medium text-sm text-gray-500">
                Current
              </Text>
            </View>
            <View className="w-full items-center justify-center overflow-hidden rounded-3xl bg-gray-100">
              <Image
                source={currentImageSource}
                style={{ width: WIDTH / 2, height: 300 }}
                contentFit="cover"
                transition={200}
              />
            </View>
          </View>

          {/* Snatched Image */}
          <View className="flex-1">
            <View className="mb-3 flex-row items-center">
              <View className="mr-2 h-2 w-2 rounded-full bg-pink-500" />
              <Text className="font-inter-medium text-sm text-gray-500">
                Snatched Goal
              </Text>
            </View>
            <View className="w-full items-center justify-center overflow-hidden rounded-3xl bg-gray-100 relative">
              {/* Pink Glow */}
              <View
                style={{
                  position: 'absolute',
                  top: 20,
                  left: '50%',
                  transform: [{ translateX: -(WIDTH / 4) }],
                  width: WIDTH / 2,
                  height: 300,
                  borderRadius: 24,
                  backgroundColor: '#F9A8D4', // Pink-300
                  opacity: 0.35,
                  shadowColor: '#F472B6', // Pink-400
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.7,
                  shadowRadius: 40,
                  zIndex: 0,
                }}
              />
              <Image
                source={snatchedImageSource}
                style={{ width: WIDTH / 2, height: 300, zIndex: 1, borderRadius: 24 }}
                contentFit="cover"
                transition={200}
              />
              <LinearGradient
                colors={["rgba(244,114,182,0.1)", "rgba(244,114,182,0.2)"]}
                className="absolute inset-0"
                style={{ borderRadius: 24, zIndex: 2 }}
              />
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <Text className="font-inter-bold mb-2 text-base text-black">
            Next Steps
          </Text>
          <View className="gap-y-3">
            {nextSteps.map((step, index) => (
              <View key={index} className="flex-row items-start">
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#F472B6"
                  style={{ marginTop: 2 }}
                />
                <Text className="font-inter ml-3 flex-1 text-sm text-gray-600">
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Last Updated */}
        <Text className="font-inter mt-4 text-center text-xs text-gray-400">
          Last updated: {new Date(lastUpdated).toLocaleDateString()}
        </Text>
      </View>
    </LinearGradient>
  );
});

export default TransformationPreviewScreen;
