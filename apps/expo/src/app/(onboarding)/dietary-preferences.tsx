import { OnboardingHeader, StyledButton } from '@/components/core'
import { withOnboardingTracking } from '@/components/core/withOnboardingTracking'
import { onboardingStore$ } from '@/stores/onboarding.store'
import { Ionicons } from '@expo/vector-icons'
import { use$ } from '@legendapp/state/react'
import { dietaryPreferenceEnum } from '@omc/validators/onboarding'
import Constants from 'expo-constants'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import React from 'react'
import { Pressable, SafeAreaView, Text, View } from 'react-native'
import { z } from 'zod'

type DietaryPreference = z.infer<typeof dietaryPreferenceEnum>;

const dietValidationSchema = z.object({
  dietary_preference: dietaryPreferenceEnum,
});

interface DietDisplay {
  value: DietaryPreference;
  icon: string;
  iconBg: string;
}

const dietDisplayMap: Record<DietaryPreference, Omit<DietDisplay, 'value'>> = {
  'Classic': {
    icon: '🍽️',
    iconBg: 'bg-pink-100'
  },
  'Pescatarian': {
    icon: '🐟',
    iconBg: 'bg-blue-100'
  },
  'Vegetarian': {
    icon: '🥬',
    iconBg: 'bg-green-100'
  },
  'Vegan': {
    icon: '🌱',
    iconBg: 'bg-green-100'
  }
}

const DietCard = ({
  preference,
  selected,
  onPress
}: {
  preference: DietaryPreference
  selected: boolean
  onPress: () => void
}) => {
  const display = dietDisplayMap[preference];
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 flex-row items-center rounded-xl border p-4 ${
        selected
          ? 'border-pink-400 bg-pink-50'
          : 'border-gray-100 bg-gray-50'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View
        className={`${display.iconBg} h-10 w-10 items-center justify-center rounded-full`}
      >
        <Text className="text-xl">{display.icon}</Text>
      </View>
      <View className="ml-4 flex-1">
        <Text
          className={`ml-4 font-inter-medium text-lg ${selected ? 'text-pink-600' : 'text-black'}`}
        >
          {preference}
        </Text>
      </View>
      {selected && (
        <View className="ml-2">
          <View className="rounded-full bg-pink-400 p-1">
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        </View>
      )}
    </Pressable>
  )
}

function DietaryPreferencesScreen() {
  const router = useRouter()
  const selectedDiet = use$(onboardingStore$.onboarding.diet) 

  const handleContinue = () => {
    if (!selectedDiet) return;

    const dietData = {
      dietary_preference: selectedDiet,
    };

    const result = dietValidationSchema.safeParse(dietData);

    if (result.success) {
      router.push('/(onboarding)/get-snatched')
    } else {
      console.error("Diet validation failed:", result.error);
    }
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-8 pt-8">
        <OnboardingHeader
          progress={12 / 19}
          title="What is your diet?"
          subtitle="We'll customize your meal plan based on your dietary preferences."
        />

        <View className="mt-6">
          {dietaryPreferenceEnum.options.map((preference) => (
            <DietCard
              key={preference}
              preference={preference}
              selected={selectedDiet === preference}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                onboardingStore$.onboarding.diet.set(preference);
              }}
            />
          ))}
        </View>
      </View>

      <View className="p-6">
        <StyledButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedDiet}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  )
}

export default withOnboardingTracking(DietaryPreferencesScreen, 'dietary_preferences');
