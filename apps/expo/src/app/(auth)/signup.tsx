import { StyledButton } from "@/components/core";
import { Wreath } from "@/components/core/Wreath";
import { usePostAuth } from "@/hooks/usePostAuth";
import { appVariant } from "@/lib/utils";
import { authClient } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Text,
  View
} from "react-native";
import type { CustomerInfo } from "react-native-purchases";
export default function SignupScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();

  usePostAuth({
    session,
    onSuccess: (customerInfo: CustomerInfo) => {
      if (customerInfo.activeSubscriptions.length > 0) {
        router.push("/(onboarding)");
      } else {
        router.push("/(onboarding)/paywall");
      }
    },
  });

  

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social(
        { provider: "apple" },
        {
          onError: (ctx) => {
            Alert.alert(ctx.error.message);
          },
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Apple Sign In Failed", error.message);
      } else {
        Alert.alert("Apple Sign In Failed", "An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social(
        { provider: "google" },
        {
          onError: (ctx) => {
            Alert.alert("Google Sign In Failed", ctx.error.message);
          },
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Google Sign In Failed", error.message);
      } else {
        Alert.alert("Google Sign In Failed", "An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-pink-400 px-8 pt-20">
      <View className="flex-1 items-center justify-center">
        {/* Wreath and Title */}
        <View className="mb-6 items-center">
          <Wreath size={140} />
          <Text className="font-inter-bold mt-4 text-center text-lg uppercase text-white">
            #1 Women's Snatched Body App
          </Text>
        </View>

        {/* Main Copy */}
        <View className="mb-12 items-center">
          <Text className="font-inter-bold mb-6 text-center text-3xl text-white">
            Slay your dream body girl
          </Text>
          <Text className="font-inter text-center text-base text-white">
            90% of users lose an average 5lbs and reach their goals within 3 months of using Snatched AI
          </Text>
        </View>

        {/* Signup Buttons */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#FFFFFF" />
        ) : (
          <View className="w-full gap-y-4">
            <StyledButton
              title="Sign up with Apple"
              onPress={handleAppleSignIn}
              variant="secondary"
              icon={<Ionicons name="logo-apple" size={20} color="black" />}
              className="bg-white"
            />
            {appVariant !== 'production' && (
              <StyledButton
                title="Sign up with Google"
                onPress={handleGoogleSignIn}
                variant="secondary"
                icon={<Ionicons name="logo-google" size={20} color="#DB4437" />}
                className="bg-white"
              />
            )}
          </View>
        )}

        {/* Terms and Privacy */}
        <Text className="font-inter mt-8 text-center text-xs text-white">
          By continuing, you agree to our{" "}
          <Text
            className="font-inter-medium underline"
            onPress={() => Linking.openURL("https://snatchedai.com/terms")}
          >
            Terms of Service
          </Text>
          {" and "}
          <Text
            className="font-inter-medium underline"
            onPress={() => Linking.openURL("https://snatchedai.com/privacy")}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
}
