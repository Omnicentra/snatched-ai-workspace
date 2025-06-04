import { StyledButton } from "@/components/core";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { api } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";

import { dietaryPreferenceEnum } from "@omc/validators/onboarding";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { z } from "zod";
import { nutritionStore$ } from "@/stores/nutrition.store";

type DietaryPreference = z.infer<typeof dietaryPreferenceEnum>;

interface DietDisplay {
  icon: string;
  iconBg: string;
}

const dietDisplayMap: Record<DietaryPreference, DietDisplay> = {
  Classic: {
    icon: "🍽️",
    iconBg: "bg-pink-100",
  },
  Pescatarian: {
    icon: "🐟",
    iconBg: "bg-blue-100",
  },
  Vegetarian: {
    icon: "🥬",
    iconBg: "bg-green-100",
  },
  Vegan: {
    icon: "🌱",
    iconBg: "bg-green-100",
  },
};

const DietCard = ({
  preference,
  selected,
  onPress,
}: {
  preference: DietaryPreference;
  selected: boolean;
  onPress: () => void;
}) => {
  const display = dietDisplayMap[preference];
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 flex-row items-center rounded-xl border p-4 ${
        selected ? "border-pink-400 bg-pink-50" : "border-gray-100 bg-gray-50"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View
        className={`${display.iconBg} h-10 w-10 items-center justify-center rounded-full`}
      >
        <Text className="text-xl">{display.icon}</Text>
      </View>
      <View className="ml-4 flex-1">
        <Text
          className={`ml-4 font-inter-medium text-lg ${
            selected ? "text-pink-600" : "text-black"
          }`}
        >
          {preference}
        </Text>
      </View>
      {selected && (
        <View className="ml-2">
          <View className="rounded-full bg-pink-400 p-1">
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default function EditDietaryPreferencesScreen() {
  const router = useRouter();
  const currentDiet = use$(onboardingStore$.onboarding.diet) as DietaryPreference;
  const [selectedDiet, setSelectedDiet] = useState<DietaryPreference | null>(currentDiet);
  const utils = api.useUtils();
  const { mutate: updateDietaryPreferences } = api.user.updateDietaryPreferences.useMutation({
    onMutate: () => {
      nutritionStore$.isRegenerating.set(true);
    },
    onSuccess: () => {
      void utils.nutrition.getTodaysMealPlan.invalidate().finally(() => {
        nutritionStore$.isRegenerating.set(false);
      });
    },
    onError: () => {
      Alert.alert("Error", "Failed to update dietary preferences. Please try again.");
      nutritionStore$.isRegenerating.set(false);
    },
  });

  const handleSave = () => {
    if (!selectedDiet || selectedDiet === currentDiet) {
      router.back();
      return;
    }

    Alert.alert(
      "Update Dietary Preferences",
      "Would you like to regenerate your meal plans based on your new dietary preferences?",
      [
        {
          text: "No, Just Update Diet",
          style: "default",
          onPress: () => {
            // Update local store and database without regenerating plans
            onboardingStore$.onboarding.diet.set(selectedDiet);
            updateDietaryPreferences({
              diet: selectedDiet,
              regeneratePlans: false,
            });
            router.back();
          },
        },
        {
          text: "Yes, Regenerate Meal Plans",
          style: "default",
          onPress: () => {
            // Update local store and database, triggering plan regeneration
            onboardingStore$.onboarding.diet.set(selectedDiet);
            updateDietaryPreferences({
              diet: selectedDiet,
              regeneratePlans: true,
            });
            router.back();
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  return (
    <LinearGradient
      colors={['#fdf2f8', '#fce7f3', '#fbcfe8']}
      style={{ flex: 1, paddingVertical: Constants.statusBarHeight }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="dark" />
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()} 
            hitSlop={20}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white/80"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text className="font-inter-bold text-xl text-gray-900">Edit Dietary Preferences</Text>
        </View>
      </View>
      <View className="flex-1">
        <View className="p-6">
          <ScrollView>
            <Text className="font-inter-medium mb-6 text-center text-base text-gray-600">
              Select your dietary preference to help us customize your meal plans.
            </Text>

            <View className="mt-6">
              {dietaryPreferenceEnum.options.map((preference) => (
                <DietCard
                  key={preference}
                  preference={preference}
                  selected={selectedDiet === preference}
                  onPress={() => setSelectedDiet(preference)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View className="p-6">
        <StyledButton
          title="Save Changes"
          onPress={handleSave}
          disabled={!selectedDiet}
          variant="primary"
        />
      </View>
    </LinearGradient>
  );
} 