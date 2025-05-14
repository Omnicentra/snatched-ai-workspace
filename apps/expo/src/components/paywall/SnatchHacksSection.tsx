import { View, Text } from "react-native";

const hacks = [
  { title: "Morning ritual", tip: "Warm lemon water + ACV", icon: "🍋" },
  { title: "Posture check", tip: "Set hourly reminders", icon: "⏰" },
  { title: "Waist training", tip: "6-8 hours daily", icon: "⌛" },
  { title: "Recovery", tip: "Epsom salt bath", icon: "🛁" },
];

export const SnatchHacksSection = () => {
  return (
    <View className="rounded-2xl bg-white/90 p-4">
      <Text className="font-inter-bold mb-4 text-2xl text-gray-900">
        Daily snatch hacks
      </Text>
      <View className="flex-1 justify-between">
        {hacks.map((hack, index) => (
          <View
            key={index}
            className="mb-3 flex-row items-center rounded-xl bg-pink-50/80 p-4"
          >
            <Text className="mr-3 text-2xl">{hack.icon}</Text>
            <View className="flex-1">
              <Text className="font-inter-semibold text-base text-gray-900">
                {hack.title}
              </Text>
              <Text className="font-inter-medium text-sm text-gray-600">
                {hack.tip}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}; 