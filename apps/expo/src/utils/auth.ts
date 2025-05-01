import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import { getBaseUrl, getScheme } from "./base-url";

const baseURL = getBaseUrl();
const scheme = getScheme();

export const authClient = createAuthClient({
  plugins: [
    expoClient({
      scheme,
      storage: SecureStore,
      disableCache: false
    }),
  ],
  baseURL,
});

export const { signIn, signOut } = authClient;
