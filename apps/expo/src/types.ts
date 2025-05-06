// These are the actual icon names we use from Ionicons
export type IoniconName = 
  | "sparkles-outline" 
  | "water-outline" 
  | "battery-charging-outline"
  | "nutrition"
  | "happy-outline" 
  | "flash-outline" 
  | "body-outline"
  | "fitness-outline" 
  | "restaurant-outline" 
  | "moon-outline"
  | "arrow-back-outline";

// These are the actual icon names we use from MaterialCommunityIcons
export type MaterialIconName = 
  | "stomach" 
  | "scale-balance" 
  | "run" 
  | "trending-down" 
  | "food-apple-outline";

export interface SnatchHackBenefit {
  text: string;
  iconName: IoniconName | MaterialIconName;
  iconType?: 'ionicons' | 'material-community';
}

export interface SnatchHack {
  id: number;
  title: string;
  description: string;
  icon: IoniconName;
  color: string;
  bgColor: string;
  benefits?: SnatchHackBenefit[];
  instructions?: string[];
} 