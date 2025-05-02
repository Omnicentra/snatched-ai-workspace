import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Constants from "expo-constants";

export const appVariant = String(Constants.expoConfig?.extra?.eas?.appVariant) || 'development'

export const ngrokUrl = String(Constants.expoConfig?.extra?.eas?.ngrokUrl)

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
