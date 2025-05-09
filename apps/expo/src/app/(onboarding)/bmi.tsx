import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, ScrollView, Text, View, Animated, Easing } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { OnboardingHeader, StyledButton } from "@/components/core";
import { onboardingStore$ } from "@/stores/onboarding.store";
import { calculateBMI } from "@/lib/utils";
import { use$ } from "@legendapp/state/react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const BMI_CATEGORIES = [
  { label: "Underweight", min: 0, max: 18.5, color: "#60A5FA", emoji: "🦴" },
  { label: "Normal", min: 18.5, max: 25, color: "#34D399", emoji: "💪" },
  { label: "Overweight", min: 25, max: 30, color: "#FBBF24", emoji: "🍔" },
  { label: "Obese", min: 30, max: 100, color: "#F87171", emoji: "⚠️" },
];

function getBMICategory(bmi: number) {
  return (
    BMI_CATEGORIES.find((cat) => bmi >= cat.min && bmi < cat.max) ?? BMI_CATEGORIES[BMI_CATEGORIES.length - 1]
  );
}

export default function BMIScreen() {
  const router = useRouter();
  const weight = use$(onboardingStore$.onboarding.weight)
  const weightUnit = use$(onboardingStore$.onboarding.weightUnit)
  const height = use$(onboardingStore$.onboarding.height)
  const heightUnit = use$(onboardingStore$.onboarding.heightUnit)

  // Convert height to inches if unit is ft/in (e.g., "5'7\"")
  let heightValue = 0;
  let heightUnitForBMI = heightUnit;
  if (heightUnit === "ft/in" && typeof height === "string") {
    const regex = /(\d+)'(\d+)"/;
    const match = regex.exec(height);
    if (match) {
      const feet = parseInt(match[1] ?? '0', 10);
      const inches = parseInt(match[2] ?? '0', 10);
      heightValue = feet * 12 + inches;
      heightUnitForBMI = "in";
    }
  } else if (typeof height === "string") {
    heightValue = parseFloat(height);
  } else if (typeof height === "number") {
    heightValue = height;
  }

  const bmi = calculateBMI({
    weight: Number(weight),
    weightUnit: weightUnit === "kg" ? "kg" : "lb",
    height: Number(heightValue),
    heightUnit: heightUnitForBMI === "cm" ? "cm" : heightUnitForBMI === "in" ? "in" : "ft/in",
  });
  const bmiRounded = Math.round(bmi * 10) / 10;
  const category = getBMICategory(bmiRounded);

  // Animate BMI number
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayedBMI, setDisplayedBMI] = useState(0);
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: bmiRounded,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayedBMI(Math.round(value * 10) / 10);
    });
    return () => animatedValue.removeListener(listener);
  }, [bmiRounded]);

  // For indicator position (0-1 scale)
  const minBMI = 15;
  const maxBMI = 40;
  const indicatorPos = Math.min(Math.max((bmiRounded - minBMI) / (maxBMI - minBMI), 0), 1);
  const barWidth = 300;
  const indicatorLeft = indicatorPos * barWidth - 16; // 16 = half indicator width

  const handleNext = () => {
    router.push("/(onboarding)/ethnicity");
  };

  return (
  
      <SafeAreaView style={{ paddingTop: Constants.statusBarHeight, flex: 1 }} className="bg-white">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
          <OnboardingHeader
            progress={8 / 20}
            title="Your BMI"
            subtitle="Based on your height & weight"
          />
          <View className="flex-1 items-center justify-center py-8">
            {/* Modern elevated card wrapper, matching results screen */}
            <View
              style={{
                borderRadius: 24,
                paddingBottom: 5,
                paddingHorizontal: 2,
                paddingTop: 2,
                backgroundColor: '#fdf2f8', // Tailwind bg-pink-50
                shadowColor: '#F6ADCE',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <View id="bmi-card" className="w-full max-w-[350px] rounded-3xl bg-white p-8 items-center relative z-10">
                <Text className="font-inter-bold text-7xl mb-4" style={{ color: category?.color ?? '#F87171'}}>
                  {displayedBMI.toFixed(1)}
                </Text>
                <View className="flex-row items-center mb-4">
                  <Text className="font-inter-bold text-2xl text-gray-700 mr-2">{category?.label ?? 'Obese'}</Text>
                  <Text style={{ fontSize: 28 }}>{category?.emoji ?? '⚠️'}</Text>
                </View>
                {/* BMI Bar */}
                <View className="w-full flex-row items-center mb-6 mt-2" style={{ width: barWidth }}>
                  <View className="flex-1 flex-row items-center relative h-8">
                    {/* Bar Gradient */}
                    <LinearGradient
                      colors={["#60A5FA", "#34D399", "#FBBF24", "#F87171"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '50%',
                        height: 12,
                        borderRadius: 8,
                        zIndex: 0,
                      }}
                    />
                    {/* Category Segments (overlay for separation) */}
                    {BMI_CATEGORIES.map((cat, idx) => (
                      <View
                        key={cat.label}
                        style={{
                          position: 'absolute',
                          left: (barWidth / BMI_CATEGORIES.length) * idx,
                          top: '50%',
                          width: 2,
                          height: 18,
                          backgroundColor: '#fff',
                          opacity: idx === 0 ? 0 : 0.5,
                          borderRadius: 2,
                          zIndex: 1,
                        }}
                      />
                    ))}
                    {/* Indicator */}
                    <View
                      className="absolute -top-4"
                      style={{
                        left: indicatorLeft,
                        zIndex: 2,
                      }}
                    >
                      <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#f472b6',
                        borderWidth: 2,
                        borderColor: '#fff',
                        shadowColor: '#f472b6',
                        shadowOpacity: 0.7,
                        shadowRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Text className="font-inter-bold text-xs text-white">YOU</Text>
                      </View>
                    </View>
                  </View>
                </View>
                {/* Category Pills */}
                <View className="w-full flex-row justify-between mt-1 mb-6">
                  {BMI_CATEGORIES.map((cat) => (
                    <View
                      key={cat.label}
                      style={{
                        backgroundColor: (category?.label === cat.label) ? cat.color : '#f3f4f6',
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        minWidth: 60,
                      }}
                    >
                      <Text
                        className="text-xs text-center"
                        style={{ color: (category?.label === cat.label) ? '#fff' : '#6b7280', fontWeight: 'bold' }}
                      >
                        {cat.label}
                      </Text>
                    </View>
                  ))}
                </View>
                {/* Info Card */}
                <View className="w-full flex-row items-center bg-pink-50 rounded-xl p-3 mt-2">
                  <Ionicons name="information-circle" size={20} color="#f472b6" style={{ marginRight: 8 }} />
                  <Text className="text-gray-500 text-sm flex-1">
                    BMI is a simple way to check if your weight is healthy for your height. A normal BMI (18.5-25) is generally associated with good health.
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View className="mt-auto">
            <StyledButton
              title="Continue"
              onPress={handleNext}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
  );
} 