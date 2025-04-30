import { OnboardingHeader, StyledButton } from '@/components/core';
import { authClient } from '@/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();

  const handleAppleSignIn = async () => {
    try {
      const result = await authClient.signIn.social({ provider: 'apple' });
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      if (error instanceof Error) {
        console.error('Apple sign in failed:', error.message);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await authClient.signIn.social({ provider: 'google', callbackURL: '/(onboarding)/analyzing' });
      if (result.data?.url) {
        router.push('/(onboarding)/analyzing');
      } else {
        Alert.alert('Google sign in failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Google sign in failed:', error.message);
      }
    }
  };

  return (
    <SafeAreaView
      style={{ paddingTop: Constants.statusBarHeight }}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <OnboardingHeader
          progress={18 / 20}
          title="Join Snatched AI"
          subtitle="Create your account to save your progress and get personalized recommendations."
        />

        <View className="flex-1 justify-center">
          {/* Social Login Buttons */}
          <View className="gap-y-4">
            <StyledButton
              title="Continue with Apple"
              onPress={handleAppleSignIn}
              variant="secondary"
              icon={<Ionicons name="logo-apple" size={20} color="black" />}
              className="bg-white"
            />
            <StyledButton
              title="Continue with Google"
              onPress={handleGoogleSignIn}
              variant="secondary"
              icon={<Ionicons name="logo-google" size={20} color="#DB4437" />}
              className="bg-white"
            />
          </View>

          {/* Privacy Notice */}
          <View className="mt-8">
            <Text className="text-center text-xs text-gray-600">
              By continuing, you agree to our{' '}
              <Text
                className="font-inter-medium text-black underline"
                onPress={() => {/* Add terms link */}}
              >
                Terms
              </Text>
              {' & '}
              <Text
                className="font-inter-medium text-black underline"
                onPress={() => {/* Add privacy policy link */}}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>

        {/* Skip Option */}
        {/* <View className="mt-auto">
          <Pressable
            onPress={() => router.push('/(onboarding)/analyzing')}
            className="flex-row items-center justify-center"
          >
            <Text className="font-inter text-sm text-gray-600">
              Not ready to sign up?{' '}
              <Text className="font-inter-medium text-pink-400">Skip for now</Text>
            </Text>
          </Pressable>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
} 