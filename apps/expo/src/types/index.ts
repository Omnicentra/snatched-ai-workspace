import { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

export interface SnatchHack {
  id: number;
  title: string;
  description: string;
  icon: IconName;
  color: string;
  bgColor: string;
} 