import React from 'react'
import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Define screens within the onboarding stack */}
      <Stack.Screen name="index" />
      <Stack.Screen name="body-positivity"/>
      <Stack.Screen name="goal" />
      <Stack.Screen name="blockers" />
      <Stack.Screen name="ideal-body" />
      <Stack.Screen name="height" />
      <Stack.Screen name="weight" />
      <Stack.Screen name="ethnicity"/>
      <Stack.Screen name="transformation-intro"/>
      <Stack.Screen name="health" />
      <Stack.Screen name="frequency" />
      <Stack.Screen name="cycle" />
      <Stack.Screen name="period-date" />
      <Stack.Screen name="cravings" />
      <Stack.Screen name="name-age" />
      <Stack.Screen name="prepare-scan" />
      <Stack.Screen name="scan-front" />
      <Stack.Screen name="scan-side" />
      <Stack.Screen name="scan-back" />
      <Stack.Screen name="dietary-preferences" />
      <Stack.Screen name="desired-shape" />
      <Stack.Screen name="timeline-goal" />
      <Stack.Screen name="analyzing" />
      <Stack.Screen name="results" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="paywall" />
      <Stack.Screen name="composition-detail" />
      <Stack.Screen name="feature-welcome" />
      <Stack.Screen name="feature-testimonials" />
      <Stack.Screen name="feature-adjust" />
      <Stack.Screen name="feature-craft" />
      <Stack.Screen name="feature-motivated" />
      <Stack.Screen name="feature-proof" />
      <Stack.Screen name="feature-setbacks" />
      <Stack.Screen name="feature-conquer" />
      <Stack.Screen name="feature-get-snatched" />
      <Stack.Screen name="plan-generated" />
      <Stack.Screen name="fine-tune-plan" />

      {/* Index route is automatically included */}
      {/* Add other onboarding screens here if needed, or rely on index naming */}
    </Stack>
  )
}
