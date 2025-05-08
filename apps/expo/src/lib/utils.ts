import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import Constants from "expo-constants";
import { twMerge } from "tailwind-merge";
import type { WorkoutWithExercises } from "../types";

export const appVariant = String(Constants.expoConfig?.extra?.eas?.appVariant) || 'development'

export const ngrokUrl = String(Constants.expoConfig?.extra?.eas?.ngrokUrl)

export const scheme = String(Constants.expoConfig?.scheme)

export const cooldownWorkoutId = String(Constants.expoConfig?.extra?.eas?.cooldownWorkoutId)

export const revenuecatProjectAppleApiKey = String(Constants.expoConfig?.extra?.eas?.revenuecatProjectAppleApiKey)
export const revenuecatProjectGoogleApiKey = String(Constants.expoConfig?.extra?.eas?.revenuecatProjectGoogleApiKey)

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

export const estimateDuration = (workoutData: WorkoutWithExercises) => {
  return workoutData.exercises.reduce((acc, exercise) => {
    return acc + exercise.sets * ((exercise.reps * 3) + exercise.restSeconds);;
  }, 0);
}

export const calculateCaloriesBurned = (totalDuration: number) => {
  const caloriesBurned = totalDuration * 0.1;
  return Math.round(caloriesBurned);
}
