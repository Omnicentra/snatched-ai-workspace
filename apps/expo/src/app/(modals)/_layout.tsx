import { Stack } from "expo-router";

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="recipe-detail" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="visual-preview" />
      <Stack.Screen name="snatch-hack-detail" />
      <Stack.Screen name="personal-info" options={{ presentation: "modal" }} />
      <Stack.Screen name="workout-detail" />
      <Stack.Screen name="all-workouts" options={{ presentation: "modal" }} />
    </Stack>
  );
}
