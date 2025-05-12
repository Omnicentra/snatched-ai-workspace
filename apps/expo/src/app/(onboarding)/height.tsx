// app/(onboarding)/height.tsx
import React, { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { RulerPicker } from "react-native-ruler-picker";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { OnboardingHeader, StyledButton } from "@/components/core";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { z } from "zod";
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking';

import { heightUnitEnum } from "@omc/validators/onboarding";

type HeightUnit = typeof heightUnitEnum._type;
const options: { label: string; value: HeightUnit }[] = [
  { label: "ft/in", value: "ft/in" },
  { label: "cm", value: "cm" },
];

const RULER_HEIGHT = 120;

// Create a subset of the schema for height validation
const heightValidationSchema = z.object({
  value: z.string().min(1),
  unit: heightUnitEnum,
});

function HeightScreen() {
  const router = useRouter();
  const { height: HEIGHT } = useWindowDimensions();
  const [unit, setUnit] = useState<HeightUnit>("ft/in");
  const [heightInFeet, setHeightInFeet] = useState(5);
  const [heightInInches, setHeightInInches] = useState(5);
  const [heightInCm, setHeightInCm] = useState(132); // Default 4'4" in cm

  // Convert between units when toggling
  useEffect(() => {
    if (unit === "cm") {
      // Convert from ft/in to cm
      const totalInches = heightInFeet * 12 + heightInInches;
      setHeightInCm(Math.round(totalInches * 2.54));
    } else {
      // Convert from cm to ft/in
      const totalInches = Math.round(heightInCm / 2.54);
      setHeightInFeet(Math.floor(totalInches / 12));
      setHeightInInches(totalInches % 12);
    }
  }, [unit]);

  const handleHeightChange = (value: string) => {
    if (unit === "ft/in") {
      // Handle feet/inches
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const totalInches = Math.round(parseFloat(value));
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      setHeightInFeet(feet);
      setHeightInInches(inches);
      // Update cm for consistency
      setHeightInCm(Math.round(totalInches * 2.54));
    } else {
      // Handle centimeters
      const cm = Math.round(parseFloat(value));
      setHeightInCm(cm);
      // Update feet/inches for consistency
      const totalInches = Math.round(cm / 2.54);
      setHeightInFeet(Math.floor(totalInches / 12));
      setHeightInInches(totalInches % 12);
    }
  };

  const handleContinue = () => {
    const heightValue =
      unit === "ft/in"
        ? `${heightInFeet}'${heightInInches}"`
        : heightInCm.toString();

    const heightData = {
      value: heightValue,
      unit,
    };

    const result = heightValidationSchema.safeParse(heightData);

    if (result.success) {
      onboardingStore$.onboarding.height.set(heightValue);
      onboardingStore$.onboarding.heightUnit.set(unit);
      router.push("/(onboarding)/weight");
    } else {
      // Handle validation error if needed
      console.error("Height validation failed:", result.error);
    }
  };

  const getRulerConfig = () => {
    if (unit === "ft/in") {
      return {
        min: 36, // 3 feet (in inches)
        max: 96, // 8 feet (in inches)
        step: 1,
        initialValue: heightInFeet * 12 + heightInInches,
      };
    } else {
      return {
        min: 91, // ~3 feet in cm
        max: 244, // ~8 feet in cm
        step: 1,
        initialValue: heightInCm,
      };
    }
  };

  const displayHeight =
    unit === "ft/in" ? `${heightInFeet}'${heightInInches}"` : `${heightInCm}cm`;

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <View style={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={6 / 20}
          title="What's your height?"
          subtitle="This helps us calculate your ideal body proportions."
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

        <View
          className="absolute left-0 right-0"
          style={{
            top: HEIGHT / 2 - RULER_HEIGHT / 2 + 20, // Adjust for text height to align center
          }}
        >
          <Text className="font-inter-bold text-center text-6xl">
            {displayHeight}
          </Text>
        </View>

        <View
          className="absolute left-[-110px]"
          style={{
            height: RULER_HEIGHT,
            width: 300,
            transform: [{ rotate: "90deg" }],
            top: HEIGHT / 2 - RULER_HEIGHT + 40,
          }}
        >
          <RulerPicker
            {...getRulerConfig()}
            width={300}
            height={RULER_HEIGHT}
            onValueChange={handleHeightChange}
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

        <View className="mt-auto">
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            variant="primary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default withOnboardingTracking(HeightScreen, 'height');
