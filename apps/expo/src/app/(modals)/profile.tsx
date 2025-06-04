import { logger } from "@/lib/logger";
import { requestNotificationPermissions } from "@/lib/notifications";
import { appVariant, mixpanel } from "@/lib/utils";
import { authClient } from "@/utils/auth";
import ChatWootWidget from "@chatwoot/react-native-widget";
import { Ionicons } from "@expo/vector-icons";
import {
  useBoolVariationDetail,
  useLDClient,
} from "@launchdarkly/react-native-client-sdk";
import * as Sentry from "@sentry/react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import type { Href} from "expo-router";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { PurchasesEntitlementInfo } from "react-native-purchases";
import Purchases from "react-native-purchases";
import { LaunchDarklyFlags } from "@/lib/launchdarkly";

const MenuItem = ({
  icon,
  label,
  onPress,
  showBorder = true,
  textColor = "text-gray-900",
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showBorder?: boolean;
  textColor?: string;
}) => (
  <Pressable
    onPress={onPress}
    className={`flex-row items-center py-4 ${showBorder ? "border-b border-gray-100" : ""}`}
  >
    <View className="mr-4 h-8 w-8 items-center justify-center rounded-full bg-gray-50">
      {icon}
    </View>
    <Text className={`font-inter-medium flex-1 text-base ${textColor}`}>
      {label}
    </Text>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </Pressable>
);

export default function ProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const { data: session } = authClient.useSession();
  const [showWidget, toggleWidget] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<PurchasesEntitlementInfo | null>(null);
  const resetOnboardingFlag = useBoolVariationDetail(
    LaunchDarklyFlags.CAN_RESET_ONBOARDING,
    false,
  );
  const ldc = useLDClient();

  // Load user data
  useEffect(() => {
    void Purchases.getCustomerInfo().then((customerInfo) => {
      if (customerInfo.entitlements.active.premium) {
        setSubscriptionStatus(customerInfo.entitlements.active.premium);
      }
    });
    if (session?.user) {
      setUserName(session.user.name);
    }
  }, [session?.user]);

  const logout = useCallback((href: Href) => {
    void authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          void Purchases.logOut();
          void mixpanel.track("log out");
          void mixpanel.reset();
          void ldc.flush();
          router.replace(href);
        },
      },
    });
  }, []);

  const handleNotifications = async () => {
    try {
      // Use our helper function to request permissions
      const permissionGranted = await requestNotificationPermissions();

      if (permissionGranted) {
        logger.info("Notification permissions granted");

        // Navigate to time selection screen
        router.replace("/(onboarding)/notification-time");
      } else {
        logger.info("Notification permissions denied");
        // On iOS, guide the user to enable notifications in settings
        if (Platform.OS === "ios") {
          Alert.alert(
            "Enable Notifications",
            "To receive workout reminders, please enable notifications in your device settings.",
            [
              { text: "Not Now", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => void Notifications.requestPermissionsAsync(),
              },
            ],
          );
        }
      }
    } catch (error) {
      logger.error("Error requesting notification permissions:", error);
    }
  };

  const menuItems = [
    {
      icon: <Ionicons name="person-outline" size={18} color="#1F2937" />,
      label: "Personal Information",
      onPress: () => router.push("/(modals)/personal-info"),
      show: true,
    },
    {
      icon: <Ionicons name="fitness-outline" size={18} color="#1F2937" />,
      label: "Fitness Goals",
      onPress: () => router.push("/(modals)/edit-desired-shape"),
      show: false,
    },
    {
      icon: <Ionicons name="card-outline" size={18} color="#1F2937" />,
      label: "Subscription",
      onPress: () => router.push("/(modals)/subscription"),
      show: true,
    },
    {
      icon: <Ionicons name="notifications-outline" size={18} color="#1F2937" />,
      label: "Notifications",
      onPress: () => handleNotifications(),
      show: true,
    },
    {
      icon: <Ionicons name="help-circle-outline" size={18} color="#1F2937" />,
      label: "Help & Support",
      onPress: () => toggleWidget(true),
      show: true,
    },
    {
      icon: (
        <Ionicons name="refresh-circle-outline" size={18} color="#DC2626" />
      ),
      label: "Reset Onboarding",
      onPress: () => {
        Alert.alert(
          "Reset Onboarding",
          "This will reset your onboarding progress. You will need to go through the initial setup process again.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Reset",
              style: "destructive",
              onPress: () => {
                void SecureStore.setItemAsync("onboarding_complete", "false");
                void logout("/(onboarding)");
              },
            },
          ],
        );
      },
      textColor: "text-red-600",
      show: resetOnboardingFlag.value === true || appVariant === "development",
    },
    {
      icon: <Ionicons name="trash-outline" size={18} color="#DC2626" />,
      label: "Delete Account",
      onPress: () => {
        Alert.alert(
          "Delete Account",
          "Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                void Linking.openURL("https://snatchedai.com/delete-account");
              },
            },
          ],
        );
      },
      textColor: "text-red-600",
      show: true,
    },
  ];

  useEffect(() => {
    Sentry.captureMessage(resetOnboardingFlag.value ? "resetOnboardingFlag is ACTIVE" : "resetOnboardingFlag is INACTIVE", {
      level: "info",
      extra: {
        resetOnboardingFlag: resetOnboardingFlag.value,
      },
    });
  }, [resetOnboardingFlag]);

  return (
    <LinearGradient
      colors={["#fdf2f8", "#fce7f3", "#fbcfe8"]}
      style={{ flex: 1, paddingTop: Constants.statusBarHeight }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {showWidget && (
        <ChatWootWidget
          websiteToken="5c1r9tnJ5Qb8eQUTSU8tbyai"
          locale="en"
          baseUrl="https://app.chatwoot.com"
          closeModal={() => toggleWidget(false)}
          isModalVisible={showWidget}
          user={{
            identifier: session?.user.id,
            name: session?.user.name,
            email: session?.user.email,
            avatar_url: session?.user.image ?? "",
          }}
          customAttributes={{
            subscribed: !!subscriptionStatus,
            plan: subscriptionStatus?.productIdentifier,
          }}
        />
      )}
      <StatusBar style="dark" />
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            hitSlop={20}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white/80"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text className="font-inter-bold text-xl text-gray-900">Profile</Text>
        </View>

        {/* User Info */}
        <View className="mt-8 items-center">
          <Pressable
            onPress={() => Alert.alert(`User ID: ${session?.user.id}`)}
            className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-pink-100"
          >
            <Text className="font-inter-bold text-3xl text-pink-500">
              {userName[0]}
            </Text>
          </Pressable>
          <Text className="font-inter-bold text-2xl text-gray-900">
            {userName}
          </Text>
          <View className="mt-2 rounded-full bg-pink-50 px-4 py-1">
            <Text className="font-inter-medium text-sm text-pink-500">
              Premium Member
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        <View className="rounded-2xl bg-white px-4 shadow-sm">
          {menuItems
            .filter((item) => item.show)
            .map((item, index) => (
              <MenuItem
                key={index}
                icon={item.icon}
                label={item.label}
                onPress={item.onPress}
                showBorder={index !== menuItems.length - 1}
                textColor={item.textColor}
              />
            ))}
        </View>

        {/* Logout Button */}
        <Pressable
          className="mt-6 w-full items-center justify-center rounded-xl border border-red-200 bg-white py-4 active:bg-red-50"
          onPress={() => logout("/(auth)/login")}
        >
          <Text className="font-inter-medium text-red-500">Log Out</Text>
        </Pressable>
      </ScrollView>

      {/* Footer Section */}
      <View className="px-6 pb-8">
        {/* Legal Links and Version */}
        <View className="items-center">
          <Text className="text-center text-xs text-gray-600">
            <Text
              className="font-inter-medium text-black underline"
              onPress={() => Linking.openURL("https://snatchedai.com/terms")}
            >
              Terms
            </Text>
            <Text>{", "}</Text>
            <Text
              className="font-inter-medium text-black underline"
              onPress={() => Linking.openURL("https://snatchedai.com/privacy")}
            >
              Privacy Policy
            </Text>
            <Text>{", and "}</Text>
            <Text
              className="font-inter-medium text-black underline"
              onPress={() =>
                Linking.openURL(
                  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
                )
              }
            >
              EULA
            </Text>
          </Text>
          <Text className="font-inter mt-2 text-center text-sm text-gray-400">
            Version {Constants.expoConfig?.version ?? "1.0.0"}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
