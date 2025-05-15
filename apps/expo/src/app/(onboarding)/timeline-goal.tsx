// app/(onboarding)/timeline-goal.tsx
import { OnboardingHeader, OptionCard, StyledButton } from '@/components/core'
import { onboardingStore$ } from '@/stores/onboarding.store'
import { authClient } from '@/utils/auth'
import { use$ } from '@legendapp/state/react'
import { timelineEnum } from '@omc/validators/onboarding'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { SafeAreaView, ScrollView, View } from 'react-native'
import type { z } from 'zod'
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking'

interface TimelineOption {
  id: z.infer<typeof timelineEnum>
  emoji: string
  text: string
  description: string
  iconBg: string
}

const timelineOptions: TimelineOption[] = [
  {
    id: 'As soon as possible',
    emoji: '🚀',
    text: 'As soon as possible',
    description: "We'll build a fast-tracked plan",
    iconBg: 'bg-red-100'
  },
  {
    id: 'In 1-2 months',
    emoji: '🗓️',
    text: 'In 1-2 months',
    description: "You'll be snatched by early summer",
    iconBg: 'bg-blue-100'
  },
  {
    id: 'In 3-6 months',
    emoji: '📅',
    text: 'In 3-6 months',
    description: 'Gradually and sustainably',
    iconBg: 'bg-green-100'
  },
  {
    id: 'No rush, just want to feel better',
    emoji: '🌸',
    text: 'No rush, just want to feel better',
    description: 'For chill vibes, at your pace',
    iconBg: 'bg-pink-100'
  }
]

function TimelineGoalScreen() {
  const router = useRouter()
  const selectedTimeline = use$(onboardingStore$.onboarding.goalTimeline);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    console.log(JSON.stringify(session, null, 2))
  }, [session])

  const handleContinue = () => {
    // Store selectedTimeline in the store
    if (session) {
      router.push('/(onboarding)/analyzing')
    } else {
      router.push('/(onboarding)/signup')
    }
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <OnboardingHeader
          progress={20 / 20}
          title="When do you want to achieve this?"
          subtitle="We'll create a timeline that works for your goals."
        />

        <View className="mb-5 gap-y-4">
          {timelineOptions.map((option) => (
            <OptionCard
              key={option.id}
              emoji={option.emoji}
              text={option.text}
              iconBg={option.iconBg}
              selected={selectedTimeline === option.id}
              onPress={() => onboardingStore$.onboarding.goalTimeline.set(option.id)}
            />
          ))}
        </View>

        <View className="mt-auto pt-8">
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedTimeline}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default withOnboardingTracking(TimelineGoalScreen, 'timeline_goal');
