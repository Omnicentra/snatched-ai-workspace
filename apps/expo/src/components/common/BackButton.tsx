import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface BackButtonProps {
  title?: string;
  className?: string;
}

export function BackButton({ title, className = "" }: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={20}
      className={`flex-row items-center ${className}`}
    >
      <Pressable
        onPress={() => router.back()}
        hitSlop={20}
        className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white/80"
      >
        <Ionicons name="arrow-back" size={24} color="#1F2937" />
      </Pressable>
      {title && (
        <Text className="font-inter-bold text-xl text-gray-900">{title}</Text>
      )}
    </Pressable>
  );
} 