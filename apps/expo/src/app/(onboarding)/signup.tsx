import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { OnboardingHeader, StyledButton } from "@/components/core";
import { withOnboardingTracking } from "@/components/core/withOnboardingTracking";
import { usePostAuth } from "@/hooks/usePostAuth";
import { Analytics } from "@/lib/analytics";
import { appVariant, scheme } from "@/lib/utils";
import { authClient } from "@/utils/auth";
import { Ionicons } from "@expo/vector-icons";

function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ skipped?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();

  usePostAuth({
    onTrack: (deviceId) => {
      if (session?.user) {
        void Analytics.trackUserSignIn(deviceId, {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        });
      }
    },
    onSuccess: () => {
      if (params.skipped === 'true') {
        router.push("/(onboarding)/analyzing?skipped=true");
      } else {
        router.push("/(onboarding)/analyzing");
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
          onSuccess: () => {
            console.log("Apple sign in success");
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
          callbackURL: `${scheme}://`,
        },
        {
          onSuccess: () => {
            console.log("Google sign in success");
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
          progress={17 / 19}
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
              {appVariant !== "production" && (
                <StyledButton
                  title="Continue with Google"
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
      </ScrollView>
    </SafeAreaView>
  );
}

export default withOnboardingTracking(SignupScreen, "signup");
