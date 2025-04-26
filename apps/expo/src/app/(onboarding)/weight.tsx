// app/(onboarding)/weight.tsx
import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { RulerPicker } from "react-native-ruler-picker";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { OnboardingHeader, StyledButton } from "@/components/core";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { z } from "zod";
import { weightUnitEnum } from "@omc/validators/onboarding";

type WeightUnit = z.infer<typeof weightUnitEnum>;
const options: { label: string; value: WeightUnit }[] = [
  { label: "lb", value: "lb" },
  { label: "kg", value: "kg" },
];

const RULER_HEIGHT = 120;

// Create a subset of the schema for weight validation
const weightValidationSchema = z.object({
  value: z.number().positive("Weight must be positive"),
  unit: weightUnitEnum,
});

export default function WeightScreen() {
  const router = useRouter();
  const [unit, setUnit] = useState<WeightUnit>("lb");
  const [weightInLbs, setWeightInLbs] = useState(155);
  const [weightInKg, setWeightInKg] = useState(65); // Default 135 lbs in kg

  // Convert between units when toggling
  useEffect(() => {
    if (unit === "kg") {
      // Convert from lbs to kg
      setWeightInKg(Math.round(weightInLbs / 2.20462));
    } else {
      // Convert from kg to lbs
      setWeightInLbs(Math.round(weightInKg * 2.20462));
    }
  }, [unit]);

  const handleWeightChange = (value: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const numValue = Math.round(parseFloat(value));
    if (unit === "lb") {
      setWeightInLbs(numValue);
      setWeightInKg(Math.round(numValue / 2.20462));
    } else {
      setWeightInKg(numValue);
      setWeightInLbs(Math.round(numValue * 2.20462));
    }
  };

  const handleContinue = () => {
    const weightValue = unit === "lb" ? weightInLbs : weightInKg;

    const weightData = {
      value: weightValue,
      unit,
    };

    const result = weightValidationSchema.safeParse(weightData);

    if (result.success) {
      onboardingStore$.onboarding.weight.set(weightValue);
      onboardingStore$.onboarding.weightUnit.set(unit);
      router.push("/(onboarding)/ethnicity");
    } else {
      // Handle validation error if needed
      console.error("Weight validation failed:", result.error);
    }
  };

  const getRulerConfig = () => {
    if (unit === "lb") {
      return {
        min: 80, // Minimum weight in lbs
        max: 400, // Maximum weight in lbs
        step: 1,
        initialValue: weightInLbs,
      };
    } else {
      return {
        min: 36, // Minimum weight in kg (~80 lbs)
        max: 181, // Maximum weight in kg (~400 lbs)
        step: 1,
        initialValue: weightInKg,
      };
    }
  };

  const displayWeight =
    unit === "lb" ? `${weightInLbs} lb` : `${weightInKg} kg`;

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={7 / 20}
          title="What do you weigh?"
          subtitle="This helps us create your personalized plan."
        />

        <View className="mb-8 flex-row self-start rounded-full bg-gray-100 p-1">
          {options.map((option, index) => (
            <Pressable
              key={index}
              className={`flex-1 rounded-full px-4 py-2 ${
                unit === option.value ? "bg-white" : ""
                }`}
              onPress={() => setUnit(option.value)}
              style={
                unit === option.value && {
                  shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
                }
              }
            >
              <Text
                className={`font-inter-medium text-center text-sm ${
                  unit === option.value ? "text-black" : "text-gray-600"
                  }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="my-8 items-center justify-center">
          <Text className="font-inter-bold mb-2 text-4xl">{displayWeight}</Text>
          
          <View className="w-full" style={{ height: RULER_HEIGHT }}>
            <RulerPicker
              {...getRulerConfig()}
              width={300}
              height={RULER_HEIGHT}
              onValueChange={handleWeightChange}
              indicatorColor="#f472b6"
              shortStepColor="#CCCCCC"
              longStepColor="#888888"
              valueTextStyle={{
                fontSize: 1,
                color: "transparent",
              }}
              unitTextStyle={{
                fontSize: 1,
                color: "transparent",
              }}
            />
          </View>
        </View>

        <View className="mt-auto">
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
