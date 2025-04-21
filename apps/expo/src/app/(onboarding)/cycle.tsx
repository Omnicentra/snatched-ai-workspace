// app/(onboarding)/cycle.tsx
import React, { useState } from 'react'
import { View, Text, SafeAreaView, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'
import {
  OnboardingHeader,
  OptionCard,
  InfoCard,
  StyledButton
} from '@/components/core'
import { Ionicons } from '@expo/vector-icons'

const cycleOptions = [
  { id: 'yes_regular', text: 'Yes - Regular' },
  { id: 'yes_irregular', text: 'Yes - Irregular' },
  { id: 'no', text: 'No' },
  { id: 'prefer_not_to_say', text: 'Prefer not to say' }
]

// Reusing RadioIcon from health.tsx or define locally
const RadioIcon = ({ selected }: { selected: boolean }) => (
  <View
    className={`h-6 w-6 rounded-full border-2 ${selected ? 'border-black' : 'border-gray-400'} mr-4 items-center justify-center`}
  >
    {selected && <View className="h-3 w-3 rounded-full bg-black" />}
  </View>
)

export default function CycleScreen() {
  const router = useRouter()
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null)

  const handleContinue = () => {
    // Store selectedCycle
    if (selectedCycle === 'yes_regular' || selectedCycle === 'yes_irregular') {
      router.push('/(onboarding)/period-date')
    } else {
      // Skip period date and cravings if 'no' or 'prefer not to say'
      router.push('/(onboarding)/dietary-preferences') // Adjust skip logic as needed
    }
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <View style={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={12 / 20}
          title="Do you get a menstrual cycle?"
          subtitle="This helps us optimize your plan around your hormonal cycles."
          className='mb-0'
        />

        <View className="mb-8 flex-1 gap-y-4">
          {cycleOptions.map((option) => (
            <OptionCard
              key={option.id}
              // icon={<RadioIcon selected={selectedCycle === option.id} />}
              text={option.text}
              selected={selectedCycle === option.id}
              onPress={() => setSelectedCycle(option.id)}
            />
          ))}
        </View>

        {/* <InfoCard
          icon={<Ionicons name="calendar-outline" size={20} color="black" />}
          text="Your hormonal cycle affects energy levels, cravings, and recovery. We'll adjust your plan accordingly."
        /> */}
      </View>

      <View className="mt-auto p-8">
        <StyledButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedCycle}
          variant="primary"
        />
      </View>

    </SafeAreaView>
  )
}
