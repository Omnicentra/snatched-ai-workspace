import React from 'react'
import { View, SafeAreaView, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import { OnboardingHeader, OptionCard, StyledButton } from '@/components/core'
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5
} from '@expo/vector-icons'
import { previousMethodEnum } from '@omc/validators/onboarding'
import { onboardingStore$ } from '@/stores/onboarding.store'
import { use$ } from '@legendapp/state/react'
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking'

type PreviousMethod = typeof previousMethodEnum.options[number]

// Map of previous methods to their display properties
type MethodMapType = Record<PreviousMethod, {
  icon: JSX.Element
  description: string
  iconBg: string
}>

const methodMap: MethodMapType = {
  'Calorie counting': {
    icon: <Ionicons name="time-outline" size={24} color="black" />,
    description: 'Tracking macros, calories, or using apps like MyFitnessPal.',
    iconBg: 'bg-red-100'
  },
  'Gym workouts': {
    icon: <MaterialCommunityIcons name="dumbbell" size={24} color="black" />,
    description: 'Weight training, machines, classes, in a gym setting.',
    iconBg: 'bg-blue-100'
  },
  'Pilates / home workouts': {
    icon: <MaterialCommunityIcons name="yoga" size={24} color="black" />,
    description: 'YouTube videos, IG routines, bodyweight exercises at home.',
    iconBg: 'bg-green-100'
  },
  'TikTok fitness plans': {
    icon: <FontAwesome5 name="tiktok" size={24} color="black" />,
    description: 'Chloe Ting, Hot Girl Walks, Booty Day trends, etc.',
    iconBg: 'bg-purple-100'
  }
}

function AvoidSetbacksScreen() {
  const router = useRouter()
  const selectedMethods = use$(onboardingStore$.onboarding.triedInPast)

  const toggleMethod = (id: PreviousMethod) => {
    if (previousMethodEnum.safeParse(id).success) {
      onboardingStore$.onboarding.triedInPast.set((prev: string[]) =>
        prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
      )
    }
  }

  const handleContinue = () => {
    // Validate all selected methods
    const validMethods = selectedMethods.every(method => previousMethodEnum.safeParse(method).success)
    if (selectedMethods.length && validMethods) {
      router.push('/(onboarding)/ideal-body')
    }
  }

  const methods = previousMethodEnum.options.map(method => ({
    id: method,
    ...methodMap[method],
    text: method
  }))

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <OnboardingHeader
          progress={4 / 20}
          title="What have you tried before?"
          subtitle="We'll use this to tailor your plan to what works for you and skip what doesn't."
        />

        <View className="flex-1 gap-y-4">
          {methods.map((method) => (
            <OptionCard
              key={method.id}
              icon={method.icon}
              text={method.text}
              iconBg={method.iconBg}
              selected={selectedMethods.includes(method.id)}
              onPress={() => toggleMethod(method.id)}
            />
          ))}
        </View>

        <View className="py-6">
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            disabled={selectedMethods.length === 0}
            variant="primary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default withOnboardingTracking(AvoidSetbacksScreen, 'avoid_setbacks')
