import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { OnboardingHeader, StyledButton } from "@/components/core";
import { authClient } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import Purchases from "react-native-purchases";
import { scheme } from "@/lib/utils";

export default function SignupScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    console.log("session", session);
    if (session?.user) {
      void Purchases.logIn(session.user.email).then(() => {
        router.push("/(onboarding)/analyzing");
      });
    }
  }, [session]);

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social(
        { 
          provider: "apple",
          callbackURL: `${scheme}:///(onboarding)/analyzing`
        },
        {
          onSuccess: (ctx) => {
            console.log("Apple sign in success:");
            console.log(JSON.stringify(ctx, null, 2));
          },
          onError: (ctx) => {
            console.error("Apple sign in error:", ctx.error);
            Alert.alert("Sign In Failed", ctx.error.message);
          },
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error("Apple sign in failed:", error.message);
        Alert.alert("Sign In Failed", error.message);
      } else {
        console.error("An unknown error occurred during sign in:", error);
        Alert.alert("Sign In Failed", "An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social(
        { 
          provider: "google",
          callbackURL: `${scheme}:///(onboarding)/analyzing`
        },
        
        {
          onSuccess: (ctx) => {
            console.log("Google sign in success:");
            console.log(JSON.stringify(ctx, null, 2));
          },
          onError: (ctx) => {
            console.error("Google sign in error:", ctx.error);
            Alert.alert("Sign In Failed", ctx.error.message);
          },
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error("Google sign in failed:", error.message);
        Alert.alert("Sign In Failed", error.message);
      } else {
        console.error("An unknown error occurred during sign in:", error);
        Alert.alert("Sign In Failed", "An unknown error occurred.");
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
