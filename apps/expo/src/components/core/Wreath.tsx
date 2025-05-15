import { Text, View } from "react-native";
import { Image } from "expo-image";
import wreath from "@/assets/images/wreath.png";

interface WreathProps {
  number?: string;
  size?: number;
}

export function Wreath({
  number = "1",
  size = 250,
}: WreathProps) {
  return (
    <View className="relative items-center justify-center">
      <Image
        source={wreath}
        className="h-full w-full"
        style={{ width: size, height: size }}
      />
      <View className="absolute inset-0 items-center justify-center flex-row">
        <Text className="text-white" style={{ fontSize: size * 0.1 }}>#</Text>
        <Text className="font-inter-bold text-white" style={{ fontSize: size * 0.35 }}>
          {number}
        </Text>
      </View>
    </View>
  );
}
