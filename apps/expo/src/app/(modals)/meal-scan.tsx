import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { logger } from "@/lib/logger";
import { api } from "@/utils/api";
import { uploadToS3 } from "@/utils/s3";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import type {
  FoodAnalysis,
  MealTypeEntry,
  MealTypeValue,
} from "@omc/validators/nutrition";
import { MEAL_TYPE_TO_CATEGORY, MEAL_TYPES } from "@omc/validators/nutrition";

export default function MealScanScreen() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [editableFoodName, setEditableFoodName] = useState("");
  const [editableCalories, setEditableCalories] = useState("");
  const [selectedMealType, setSelectedMealType] =
    useState<MealTypeValue>("lunch");
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);
  const utils = api.useUtils();
  // API mutations
  const { mutateAsync: validateFoodImage } =
    api.nutrition.validateFoodImage.useMutation();
  const { mutateAsync: generateUploadUrl } =
    api.nutrition.generateFoodImageUploadUrl.useMutation();
  const { mutateAsync: analyzeFoodImage } =
    api.nutrition.analyzeFoodImage.useMutation();
  const { mutateAsync: submitScannedMeal } =
    api.nutrition.submitScannedMeal.useMutation({
      onSuccess: () => {
        void utils.nutrition.getTodaysMealPlan.invalidate();
        void utils.nutrition.getRecentlyLoggedMeals.invalidate();
        router.back();
      },
    });

  // Take a picture with the camera
  const takePicture = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setCapturedImage(result.assets[0].uri);
      setAnalysis(null);
      setImageKey(null);
      setEditableFoodName("");
      setEditableCalories("");
    }
  };

  // Pick an image from the gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setCapturedImage(result.assets[0].uri);
      setAnalysis(null);
      setImageKey(null);
      setEditableFoodName("");
      setEditableCalories("");
    }
  };

  // Upload image to S3 using presigned URL
  const uploadImage = async (
    imageUri: string,
    mealName: string,
  ): Promise<string> => {
    try {
      setIsUploading(true);

      // Get the image's mime type from the URI
      const fileExtension = imageUri.split(".").pop() ?? "jpg";
      const mimeType = `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`;

      // Get presigned URL for upload
      const { presignedUrl, key } = await generateUploadUrl({
        mealName,
        fileType: mimeType,
      });
      const uploadSuccess = await uploadToS3(imageUri, presignedUrl);

      if (!uploadSuccess) {
        throw new Error("Failed to upload image to S3");
      }

      // Save image key for later submission
      setImageKey(key);
      return key;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image to S3");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle analyzing the image
  const analyzeImage = async () => {
    if (!capturedImage) return;

    try {
      setIsValidating(true);

      // Get the blob from uri
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Convert blob to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          if (typeof result === "string") {
            const base64String = result.split(",")[1];
            if (base64String) {
              resolve(base64String);
            } else {
              reject(new Error("Failed to convert image to base64"));
            }
          } else {
            reject(new Error("Failed to read image file"));
          }
        };
        reader.onerror = () => {
          reject(new Error("Error reading file"));
        };
        reader.readAsDataURL(blob);
      });

      // First, validate if it's a food image
      const validationResult = await validateFoodImage({
        imageBase64: base64,
      });

      if (!validationResult.isValidFood) {
        Alert.alert(
          "Not a Food Image",
          "The image doesn't appear to contain food. Please try again with a food photo.",
          [{ text: "OK" }],
        );
        return;
      }

      setIsValidating(false);
      setIsAnalyzing(true);

      // Analyze the food image
      const result = await analyzeFoodImage({
        imageBase64: base64,
      });

      logger.info(JSON.stringify(result, null, 2));

      // Upload image to S3 after analysis
      try {
        await uploadImage(capturedImage, result.foodName);
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        // Continue with analysis even if upload fails
      }

      // Set editable values from analysis
      setEditableFoodName(result.foodName);
      setEditableCalories(result.calories.toString());
      setAnalysis(result);
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert(
        "Analysis Failed",
        "We couldn't analyze your meal. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      setIsValidating(false);
      setIsAnalyzing(false);
    }
  };

  // Reset the captured image and analysis
  const resetCapture = () => {
    setCapturedImage(null);
    setAnalysis(null);
    setImageKey(null);
    setEditableFoodName("");
    setEditableCalories("");
  };

  // Handle logging the meal
  const logMeal = async () => {
    if (!analysis) return;

    try {
      setIsSubmitting(true);

      // Validate inputs
      const calories = parseInt(editableCalories, 10);
      if (isNaN(calories) || calories <= 0) {
        Alert.alert("Invalid Calories", "Please enter a valid calorie value.");
        return;
      }

      if (!editableFoodName.trim()) {
        Alert.alert("Invalid Food Name", "Please enter a food name.");
        return;
      }

      // Get the category ID for the selected meal type
      const categoryId = MEAL_TYPE_TO_CATEGORY[selectedMealType];
      logger.info(
        `Selected meal type: ${selectedMealType}, categoryId: ${categoryId}`,
      );

      // Submit the scanned meal
      await submitScannedMeal({
        foodName: editableFoodName,
        calories,
        categoryId,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fats: analysis.fats,
        imageKey: imageKey ?? undefined,
        mealType: selectedMealType,
        ingredients: analysis.ingredients,
        instructions: analysis.instructions,
      });

      Alert.alert("Success", "Meal successfully logged!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error logging meal:", error);
      Alert.alert(
        "Failed to Log Meal",
        "There was an error logging your meal. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#fdf2f8", "#fff"]}
      style={{ flex: 1, height: "100%", paddingTop: Constants.statusBarHeight }}
      className="flex-1 items-center justify-center p-6"
    >
      <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#333" />
        </Pressable>
        <Text className="font-inter-semibold text-lg text-gray-900">
          Scan Meal
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {!capturedImage ? (
        // Image Selection Screen
        <View className="flex-1 items-center justify-around p-6">
          <View className="mb-12 items-center">
            <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-pink-50">
              <MaterialCommunityIcons
                name="food-apple"
                size={64}
                color="#ec4899"
              />
            </View>
            <Text className="font-inter-bold mt-4 text-center text-2xl text-gray-800">
              Analyze Your Food
            </Text>
            <Text className="font-inter mt-2 text-center text-base text-gray-600">
              Take a photo of your meal to get nutritional information
            </Text>
          </View>

          <View className="w-full items-center justify-center gap-y-2">
            <Pressable
              className="mb-4 w-full max-w-sm flex-row items-center justify-center rounded-2xl bg-pink-500 py-4 shadow-lg shadow-pink-500/30"
              onPress={takePicture}
            >
              <MaterialCommunityIcons name="camera" size={24} color="white" />
              <Text className="font-inter-semibold ml-2 text-white">
                Take a Photo
              </Text>
            </Pressable>

            <Pressable
              className="w-full max-w-sm flex-row items-center justify-center rounded-2xl border-2 border-gray-200 bg-white py-4"
              onPress={pickImage}
            >
              <MaterialCommunityIcons name="image" size={24} color="#333" />
              <Text className="font-inter-semibold ml-2 text-gray-800">
                Choose from Gallery
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        // Image preview and analysis
        <ScrollView className="flex-1 bg-gray-50">
          <View className="aspect-square w-full">
            <Image
              source={{ uri: capturedImage }}
              style={{
                width: "100%",
                height: "100%",
              }}
              contentFit="cover"
            />
          </View>

          <View className="p-6">
            {!analysis ? (
              // Before analysis
              <View className="items-center">
                <Text className="font-inter-bold mb-6 text-center text-xl text-gray-800">
                  Analyze this meal?
                </Text>
                <View className="w-full flex-row justify-between">
                  <Pressable
                    className="mr-2 flex-1 items-center justify-center rounded-xl border-2 border-gray-200 bg-white py-3"
                    onPress={resetCapture}
                  >
                    <Text className="font-inter-semibold text-gray-800">
                      Try Again
                    </Text>
                  </Pressable>
                  <Pressable
                    className="ml-2 flex-1 items-center justify-center rounded-xl bg-pink-500 py-3 shadow-lg shadow-pink-500/30"
                    onPress={analyzeImage}
                    disabled={isValidating || isAnalyzing || isUploading}
                  >
                    {isValidating ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="font-inter-semibold ml-2 text-white">
                          Validating
                        </Text>
                      </View>
                    ) : isAnalyzing ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="font-inter-semibold ml-2 text-white">
                          Analyzing
                        </Text>
                      </View>
                    ) : isUploading ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="font-inter-semibold ml-2 text-white">
                          Uploading
                        </Text>
                      </View>
                    ) : (
                      <Text className="font-inter-semibold text-white">
                        Analyze
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              // After analysis - editable form
              <View className="rounded-3xl px-4 pb-4">
                <View className="mb-8">
                  <View className="mb-6 flex-row items-center justify-between">
                    <Text className="font-inter-bold text-2xl text-gray-900">
                      {editableFoodName || "Food Analysis"}
                    </Text>
                  </View>

                  {/* Macros Grid */}
                  <View className="mb-8 flex-row justify-between">
                    <View className="items-center">
                      <View className="mb-2 h-12 w-12 items-center justify-center rounded-2xl bg-violet-50">
                        <MaterialCommunityIcons
                          name="fire"
                          size={24}
                          color="#8b5cf6"
                        />
                      </View>
                      <Text className="font-inter-medium text-sm text-gray-500">
                        Calories
                      </Text>
                      <TextInput
                        className="font-inter-bold p-0 text-xl text-gray-900"
                        value={editableCalories}
                        onChangeText={setEditableCalories}
                        keyboardType="number-pad"
                        placeholder="0"
                      />
                    </View>
                    <View className="items-center">
                      <View className="mb-2 h-12 w-12 items-center justify-center rounded-2xl bg-pink-50">
                        <MaterialCommunityIcons
                          name="arm-flex-outline"
                          size={24}
                          color="#ec4899"
                        />
                      </View>
                      <Text className="font-inter-medium text-sm text-gray-500">
                        Protein
                      </Text>
                      <Text className="font-inter-bold text-xl text-gray-900">
                        {analysis.protein}g
                      </Text>
                    </View>
                    <View className="items-center">
                      <View className="mb-2 h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                        <MaterialCommunityIcons
                          name="barley"
                          size={24}
                          color="#60a5fa"
                        />
                      </View>
                      <Text className="font-inter-medium text-sm text-gray-500">
                        Carbs
                      </Text>
                      <Text className="font-inter-bold text-xl text-gray-900">
                        {analysis.carbs}g
                      </Text>
                    </View>
                    <View className="items-center">
                      <View className="mb-2 h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                        <MaterialCommunityIcons
                          name="food-drumstick-outline"
                          size={24}
                          color="#fbbf24"
                        />
                      </View>
                      <Text className="font-inter-medium text-sm text-gray-500">
                        Fats
                      </Text>
                      <Text className="font-inter-bold text-xl text-gray-900">
                        {analysis.fats}g
                      </Text>
                    </View>
                  </View>

                  {/* Food Name Input */}
                  <View className="mb-8">
                    <Text className="font-inter-medium mb-2 text-sm text-gray-500">
                      Food Name
                    </Text>
                    <TextInput
                      className="font-inter-medium rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-base text-gray-900"
                      value={editableFoodName}
                      onChangeText={setEditableFoodName}
                      placeholder="Enter food name"
                    />
                  </View>

                  {/* Meal Type Selector */}
                  <View className="mb-8">
                    <Text className="font-inter-medium mb-2 text-sm text-gray-500">
                      Meal Type
                    </Text>
                    <Pressable 
                      onPress={() => setShowMealTypeModal(true)}
                      className="flex-row items-center justify-between rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <Text className="font-inter-medium text-base capitalize text-gray-900">
                        {selectedMealType}
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={24}
                        color="#666"
                      />
                    </Pressable>
                  </View>

                  <View className="flex-row justify-between gap-x-6">
                    <Pressable
                      className="flex-1 items-center justify-center rounded-xl border-2 border-gray-200 bg-white py-4"
                      onPress={resetCapture}
                      disabled={isSubmitting}
                    >
                      <Text className="font-inter-semibold text-gray-800 text-xl">
                        Scan Again
                      </Text>
                    </Pressable>
                    <Pressable
                      className="flex-1 items-center justify-center rounded-xl bg-pink-500 py-4 shadow-lg shadow-pink-500/30"
                      onPress={logMeal}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <View className="flex-row items-center">
                          <ActivityIndicator size="small" color="white" />
                          <Text className="font-inter-semibold ml-2 text-white text-xl">
                            Logging...
                          </Text>
                        </View>
                      ) : (
                        <Text className="font-inter-semibold text-white text-xl">
                          Log Meal
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Meal Type Modal */}

      <Modal
        visible={showMealTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMealTypeModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl bg-white p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="font-inter-bold text-xl text-gray-900">
                Select Meal Type
              </Text>
              <Pressable
                className="rounded-full bg-gray-100 p-2"
                onPress={() => setShowMealTypeModal(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            {MEAL_TYPES.map((mealType: MealTypeEntry, index: number) => (
              <Pressable
                key={index}
                className={`mb-2 flex-row items-center rounded-xl px-4 py-4 ${
                  selectedMealType === mealType.value ? "bg-pink-50" : ""
                }`}
                onPress={() => {
                  setSelectedMealType(mealType.value);
                  setShowMealTypeModal(false);
                }}
              >
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={24}
                  color={
                    selectedMealType === mealType.value ? "#ec4899" : "#666"
                  }
                />
                <Text
                  className={`font-inter-semibold ml-3 ${
                    selectedMealType === mealType.value
                      ? "text-pink-500"
                      : "text-gray-800"
                  }`}
                >
                  {mealType.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}
