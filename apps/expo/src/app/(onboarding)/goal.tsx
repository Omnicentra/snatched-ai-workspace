import React from 'react'
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native'
// No 'styled' import
import { OnboardingHeader, StyledButton } from '@/components/core'
import { store$ } from '@/stores/onboarding.store'
import { Ionicons } from '@expo/vector-icons'; // Assuming you need checkmark
import { use$ } from '@legendapp/state/react'
import Constants from 'expo-constants'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
// Reusable Goal Card Component (put in components/GoalCard.tsx)
// Use standard components with className
const GoalCard = ({
  emoji,
  text,
  selected,
  onPress,
  iconBg = 'bg-pink-100'
}: {
  emoji: string
  text: string
  selected: boolean
  onPress: () => void
  bgColor?: string
  iconBg?: string
}) => {
  return (
    <Pressable
      className={`flex-row items-center rounded-2xl border p-5 ${selected ? 'border-pink-400 bg-pink-50' : 'border-gray-100 bg-gray-50'
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
      onPress={onPress}
    >
      <View
        className={`mr-4 h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
      >
        <Text className="text-xl">{emoji}</Text>
      </View>
      <Text
        className={`flex-1 font-inter-medium ${selected ? 'text-pink-600' : 'text-black'}`}
      >
        {text}
      </Text>
      {/* Added flex-1 for text wrapping */}
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

export default function GoalScreen() {
  const router = useRouter()
  const selectedGoals = use$(store$.onboarding.goals)
  // const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const goals = [
    {
      id: 'lose_weight',
      emoji: '⚖️',
      text: 'Lose weight',
      iconBg: 'bg-pink-100'
    },
    {
      id: 'tone_sculpt',
      emoji: '💪',
      text: 'Tone & sculpt',
      iconBg: 'bg-blue-100'
    },
    {
      id: 'grow_glutes',
      emoji: '🍑',
      text: 'Grow my glutes',
      iconBg: 'bg-purple-100'
    },
    {
      id: 'glow_up',
      emoji: '✨',
      text: 'Overall glow-up',
      iconBg: 'bg-yellow-100'
    }
  ]

  const toggleGoal = (id: string) => {
    store$.onboarding.goals.set((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    )
  }

  const handleContinue = () => {
    if (selectedGoals.length) {
      router.push('/(onboarding)/blockers')
    }
  }

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      {/* Use ScrollView directly */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={1 / 20} // Adjust total steps
          title="What's your goal?"
          subtitle="We'll customize your plan based on what you want to achieve."
        />

        <View className="flex-1">
          <View className="gap-y-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                emoji={goal.emoji}
                text={goal.text}
                iconBg={goal.iconBg}
                selected={selectedGoals.includes(goal.id)}
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                  toggleGoal(goal.id)
                }}
              />
            ))}
          </View>
        </View>

        <View className="mt-auto flex-row gap-x-3 pt-8">
          <StyledButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedGoals.length}
            variant="primary" // Black button
            style={{ flex: 1 }} // Take remaining space
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
