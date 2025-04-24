// app/(onboarding)/name-age.tsx
import { InfoCard, OnboardingHeader, StyledButton } from '@/components/core'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native'
import { onboardingStore$ } from '@/stores/onboarding.store'
import { nameAgeSchema } from '@omc/validators/onboarding'

export default function NameAgeScreen() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [validationError, setValidationError] = useState<string>()

  const handleStartScanning = () => {
    try {
      const result = nameAgeSchema.safeParse({ name, age });

      if (!result.success) {
        throw new Error(result.error.message);
      }

      onboardingStore$.onboarding.name.set(result.data.name);
      onboardingStore$.onboarding.age.set(result.data.age);
      router.push('/(onboarding)/prepare-scan');
    } catch (error) {
      if (error instanceof Error) {
        setValidationError(error.message);
      } else {
        setValidationError('Invalid input');
      }
    }
  }

  // Validate as user types to enable/disable continue button
  const isValid = useMemo(() => {
    console.log(nameAgeSchema.safeParse({ name, age }).success)
    return nameAgeSchema.safeParse({ name, age }).success;
  }, [name, age]);

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={16 / 20}
          title="Almost there"
          subtitle="Let's personalize your experience."
        />

        <View className="mb-6">
          <Text className="mb-2 block font-inter-medium text-sm text-black">
            Your name
          </Text>
          <TextInput
            className="w-full rounded-xl border border-gray-200 p-4 font-inter-medium text-xl text-black"
            placeholder="Enter your name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setValidationError(undefined);
            }}
            autoCapitalize="words"
          />
        </View>

        <View className="mb-8">
          <Text className="mb-2 block font-inter-medium text-sm text-black">
            Your age
          </Text>
          <TextInput
            className="w-full rounded-xl border border-gray-200 p-4 font-inter-medium text-xl text-black"
            placeholder="Enter your age"
            keyboardType="number-pad"
            value={age}
            onChangeText={(text) => {
              setAge(text);
              setValidationError(undefined);
            }}
            maxLength={3}
          />
        </View>

        {validationError && (
          <Text className="mb-4 font-inter-medium text-sm text-red-500">
            {validationError}
          </Text>
        )}

        <InfoCard
          icon={
            <Ionicons name="shield-checkmark-outline" size={20} color="black" />
          }
          text="Your information is secure and will only be used to personalize your experience."
          iconBg="bg-green-100"
        />

        <View className="mt-auto pt-8">
          <StyledButton
            title="Continue"
            onPress={handleStartScanning}
            className="flex flex-row gap-x-3 rounded-full"
            variant="primary"
            disabled={!isValid}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
