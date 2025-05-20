import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyledButton } from "@/components/core";
import { Wreath } from "@/components/core/Wreath";
import { appVariant, scheme } from "@/lib/utils";
import { authClient } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { usePostAuth } from "@/hooks/usePostAuth";
import type { CustomerInfo } from "react-native-purchases";

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();

  usePostAuth({
    session,
    onSuccess: (customerInfo: CustomerInfo) => {
      if (customerInfo.activeSubscriptions.length > 0) {
        router.push("/(tabs)/home");
      } else {
        router.push("/(onboarding)/paywall");
      }
    },
  });

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social(
        {
          provider: "apple",
          callbackURL: `${scheme}://`,
        },
        {
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
          callbackURL: `${scheme}://`,
        },
        {
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
    <LinearGradient
      colors={["#f472b6", "#ec4899"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, width: "100%", height: "100%" }}
    >
      <View className="flex-1 px-8 pt-12">
        <View className="flex-1 items-center justify-center">
          {/* Wreath and Title */}
          <View className="mb-12 items-center w-full">
            <Wreath />
            <Text className="font-inter-bold uppercase text-white">
              #1 Snatched Body App For Baddies
            </Text>
          </View>

          {/* Main Copy */}
          <View className="mb-12 items-center">
            <Text className="font-inter-bold mb-6 text-center text-3xl text-white">
              Slay your dream body girl
            </Text>
            <Text className="font-inter text-center text-base text-white">
              90% of our girlies drop 5lbs+ and hit their goals in just 3 months with Snatched AI.{'\n'}
              <Text className="font-inter-semibold">Like, literally life-changing.</Text>
            </Text>
          </View>

          {/* Login Buttons */}
          {isLoading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <View className="w-full gap-y-4">
              <StyledButton
                title="Login with Apple"
                onPress={handleAppleSignIn}
                variant="secondary"
                icon={<Ionicons name="logo-apple" size={20} color="black" />}
                className="bg-white"
              />
              {appVariant !== "production" && (
                <StyledButton
                  title="Login with Google"
                  onPress={handleGoogleSignIn}
                  variant="secondary"
                  icon={
                    <Ionicons name="logo-google" size={20} color="#DB4437" />
                  }
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
    </LinearGradient>
  );
}
