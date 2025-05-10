import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Purchases from "react-native-purchases";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyledButton } from "@/components/core";
import { BubbleLetter } from "@/components/core/BubbleLetter";
import { authClient } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";
import { getOrCreateDeviceId } from "@/utils/device-id";
import { api } from "@/utils/api";
import * as Device from "expo-device";
import * as Sentry from "@sentry/react-native";
export default function SignupScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();
  const { mutate: createUserDevice } = api.userDevices.create.useMutation();

  useEffect(() => {
    if (session?.user) {
      void (async () => {
        try {
          const deviceId = await getOrCreateDeviceId();
          createUserDevice({
            userId: session.user.id,
            deviceId,
            deviceName: Device.deviceName,
            deviceType: Platform.OS,
          });
          
          const info = await Purchases.logIn(session.user.email);
          Sentry.setUser({
            email: session.user.email,
            id: session.user.id,
          });
          if (info.customerInfo.activeSubscriptions.length > 0) {
            router.push("/(onboarding)/body-positivity");
          } else {
            router.push("/(onboarding)/paywall");
          }
        } catch (error) {
          console.error("Failed to associate device:", error);
        }
      })();
    }
  }, [session, router]);

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
    <LinearGradient
      colors={["#fdf2f8", "#fce7f3", "#fbcfe8"]}
      style={{ flex: 1, width: "100%", height: "100%" }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <View className="flex-1 justify-center">
          {/* Logo or App Name */}
          <View className="mb-12 items-center">
            <View className="mb-2 flex-row">
              <BubbleLetter _delay={1}>S</BubbleLetter>
              <BubbleLetter _delay={2}>n</BubbleLetter>
              <BubbleLetter _delay={3}>a</BubbleLetter>
              <BubbleLetter _delay={4}>t</BubbleLetter>
              <BubbleLetter _delay={5}>c</BubbleLetter>
              <BubbleLetter _delay={6}>h</BubbleLetter>
              <BubbleLetter _delay={7}>e</BubbleLetter>
              <BubbleLetter _delay={8}>d</BubbleLetter>
              <BubbleLetter _delay={9}> </BubbleLetter>
              <BubbleLetter _delay={10}>A</BubbleLetter>
              <BubbleLetter _delay={11}>I</BubbleLetter>
            </View>
            <Text className="font-inter mt-2 text-base text-gray-600">
              Create your account to get started
            </Text>
          </View>

          {/* Social Login Buttons */}
          {isLoading ? (
            <ActivityIndicator size="large" color="#EC4899" />
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

          {/* Login Link */}
          <View className="mt-8">
            <Pressable
              onPress={() => router.push("/(auth)/login")}
              className="flex-row items-center justify-center"
            >
              <Text className="font-inter text-sm text-gray-600">
                Already have an account?{" "}
                <Text className="font-inter-medium text-pink-500">Sign in</Text>
              </Text>
            </Pressable>
          </View>

          {/* Privacy Notice */}
          <View className="mt-8">
            <Text className="text-center text-xs text-gray-600">
              By continuing, you agree to our{" "}
              <Text
                className="font-inter-medium text-gray-900 underline"
                onPress={() => Linking.openURL("https://snatchedai.com/terms")}
              >
                Terms
              </Text>
              {" & "}
              <Text
                className="font-inter-medium text-gray-900 underline"
                onPress={() =>
                  Linking.openURL("https://snatchedai.com/privacy")
                }
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
