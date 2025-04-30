import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, Text, View, ActivityIndicator } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { OnboardingHeader, StyledButton } from "@/components/core";
import { authClient } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";

export default function SignupScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();
  

  useEffect(() => {
    console.log(JSON.stringify(session, null, 2));
  }, [session]);

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.signIn.social(
        { provider: "apple" },
        {
          onRequest: (_ctx) => {
            // Handled by isLoading state
          },
          onSuccess: (_ctx) => {
            router.push("/(onboarding)/analyzing");
            setIsLoading(false);
          },
          onError: (ctx) => {
            Alert.alert(ctx.error.message);
            setIsLoading(false);
          },
        },
      );
      console.log("Apple Sign In Result:", JSON.stringify(result, null, 2));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Apple sign in failed:", error.message);
        Alert.alert("Apple Sign In Failed", error.message);
      } else {
        console.error("An unknown error occurred during Apple sign in:", error);
        Alert.alert("Apple Sign In Failed", "An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.signIn.social(
        { provider: "google" },
        {
          onRequest: (_ctx) => {
            // Handled by isLoading state
          },
          onSuccess: (_ctx) => {
            router.push("/(onboarding)/analyzing");
            setIsLoading(false);
          },
          onError: (ctx) => {
            Alert.alert("Google Sign In Failed", ctx.error.message);
            setIsLoading(false);
          },
        },
      );
      console.log("Google Sign In Result:", JSON.stringify(result, null, 2));
      // The success case is handled by the onSuccess callback now
    } catch (error) {
      if (error instanceof Error) {
        console.error("Google sign in failed:", error.message);
        Alert.alert("Google Sign In Failed", error.message);
      } else {
        console.error("An unknown error occurred during Google sign in:", error);
        Alert.alert("Google Sign In Failed", "An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
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
          {isLoading ? (
            <ActivityIndicator size="large" color="#DB4437" />
          ) : (
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
          )}

          {/* Privacy Notice */}
          <View className="mt-8">
            <Text className="text-center text-xs text-gray-600">
              By continuing, you agree to our{" "}
              <Text
                className="font-inter-medium text-black underline"
                onPress={() => {
                  /* Add terms link */
                }}
              >
                Terms
              </Text>
              {" & "}
              <Text
                className="font-inter-medium text-black underline"
                onPress={() => {
                  /* Add privacy policy link */
                }}
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
