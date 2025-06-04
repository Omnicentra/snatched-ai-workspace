import { Stack } from "expo-router";
import React from "react";

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen
        name="edit-desired-shape"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="edit-dietary-preferences"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="workout-detail"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="recipe-detail"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="meal-plan"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="meal-scan"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="saved-foods"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="all-workouts"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="workout-start"
      />
      <Stack.Screen
        name="workout-complete"
      />
    </Stack>
  );
}
