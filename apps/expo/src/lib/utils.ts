import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Constants from "expo-constants";

export const appVariant = String(Constants.expoConfig?.extra?.eas?.appVariant) || 'development'

export const ngrokUrl = String(Constants.expoConfig?.extra?.eas?.ngrokUrl)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
