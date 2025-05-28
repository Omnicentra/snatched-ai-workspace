import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import React from "react";
import { Platform, SafeAreaView as RNSafeAreaView } from "react-native";
import { SafeAreaView as RNSafeAreaContextView } from "react-native-safe-area-context";

interface SafeAreaViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export const SafeAreaViewWrapper: React.FC<SafeAreaViewProps> = ({
  children,
  style = {},
  className = "bg-dark",
}) => {
  const SafeAreaViewComponent =
    Platform.OS === "ios" ? RNSafeAreaView : RNSafeAreaContextView;
  return (
    <SafeAreaViewComponent className={className} style={style}>
      {children}
    </SafeAreaViewComponent>
  );
};