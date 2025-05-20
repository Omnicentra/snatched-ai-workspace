import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import Constants from "expo-constants";
import { twMerge } from "tailwind-merge";
import type { WorkoutWithExercises } from "../types";
import { Mixpanel } from "mixpanel-react-native";
import { Asset } from "expo-asset";
import { Image } from "expo-image";
// EXPO CONFIG
export const appVariant = String(Constants.expoConfig?.extra?.eas?.appVariant) || 'development'

export const ngrokUrl = String(Constants.expoConfig?.extra?.eas?.ngrokUrl)

export const scheme = String(Constants.expoConfig?.scheme)

export const cooldownWorkoutId = String(Constants.expoConfig?.extra?.eas?.cooldownWorkoutId)

export const revenuecatProjectAppleApiKey = String(Constants.expoConfig?.extra?.eas?.revenuecatProjectAppleApiKey)
export const revenuecatProjectGoogleApiKey = String(Constants.expoConfig?.extra?.eas?.revenuecatProjectGoogleApiKey)

const mixpanelToken = String(Constants.expoConfig?.extra?.eas?.mixpanelToken)
const trackAutomaticEvents = false;
export const mixpanel = new Mixpanel(mixpanelToken, trackAutomaticEvents);

export const launchdarklyClientKey = String(Constants.expoConfig?.extra?.eas?.launchdarklyClientKey) || 'mob-a16cc7b3-1fbb-465c-a5f4-d23c83d5858c'


// UTIL FUNCTIONS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function cacheImages(images: (string | number)[]) {
  return Promise.all(images.map(async (image) => {
    if (typeof image === 'string') {
      return await Image.prefetch(image);
    } else {
      return await Asset.fromModule(image).downloadAsync();
    }
  }));
}

export const estimateDuration = (workoutData: WorkoutWithExercises) => {
  return workoutData.exercises.reduce((acc, exercise) => {
    return acc + exercise.sets * ((exercise.reps * 3) + exercise.restSeconds);;
  }, 0);
}

export const calculateCaloriesBurned = (totalDuration: number) => {
  const caloriesBurned = totalDuration * 0.1;
  return Math.round(caloriesBurned);
}

/**
 * Calculate BMI (Body Mass Index)
 * @param weight - weight value
 * @param weightUnit - 'kg' or 'lb'
 * @param height - height value
 * @param heightUnit - 'cm', 'ft/in', or 'in'
 * @returns BMI value (number)
 */
export function calculateBMI({
  weight,
  weightUnit,
  height,
  heightUnit,
}: {
  weight: number;
  weightUnit: 'kg' | 'lb';
  height: number;
  heightUnit: 'cm' | 'ft/in' | 'in';
}): number {
  let weightKg = weight;
  let heightM = height;

  if (weightUnit === 'lb') {
    weightKg = weight * 0.453592;
  }
  if (heightUnit === 'cm') {
    heightM = height / 100;
  } else if (heightUnit === 'ft/in') {
    // height is expected in inches for ft/in
    heightM = height * 0.0254;
  } else if (heightUnit === 'in') {
    heightM = height * 0.0254;
  }

  if (heightM === 0) return 0;
  return weightKg / (heightM * heightM);
}
