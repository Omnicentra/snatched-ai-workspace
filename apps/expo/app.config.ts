import { ConfigContext, ExpoConfig } from "@expo/config";

function getAppConfig() {
  switch (process.env.APP_VARIANT) {
    case "development":
      return {
        name: "Snatched AI Dev",
        scheme: "snatched-ai-dev",
        androidPackage: "com.omnicentra.snatched_ai_dev",
        iosBundleIdentifier: "com.omnicentra.snatched-ai-dev",
        intentFilters: [
          {
            scheme: "https",
            host: "snatched-ai-dev.ngrok.io",
          },
        ],
      };
    case "preview":
      return {
        name: "Snatched AI Preview",
        scheme: "snatched-ai-preview",
        androidPackage: "com.omnicentra.snatched_ai_preview",
        iosBundleIdentifier: "com.omnicentra.snatched-ai-preview",
        intentFilters: [
          {
            scheme: "https",
            host: "dev.snatched.ai",
          },
        ],
      };
    case "production":
    default:
      return {
        name: "Snatched AI",
        scheme: "snatched-ai",
        androidPackage: "com.omnicentra.snatched_ai",
        iosBundleIdentifier: "com.omnicentra.snatched-ai",
        intentFilters: [
          {
            scheme: "https",
            host: "snatched.ai",
          },
        ],
      };
  }
}

const { name, scheme, androidPackage, iosBundleIdentifier, intentFilters } =
  getAppConfig();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name,
  slug: "snatched-ai",
  version: "1.0.3",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  platforms: ["ios", "android"],
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: iosBundleIdentifier,
    config: {
      usesNonExemptEncryption: false,
    },
    associatedDomains: [
      "applinks:snatched-ai.ngrok.io",
      "applinks:snatched-ai-dev-oh2uj.ondigitalocean.app",
      "applinks:snatched-ai-ljnck.ondigitalocean.app",
    ],
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: androidPackage,
    permissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.ACCESS_MEDIA_LOCATION",
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-secure-store",
    [
      "expo-media-library",
      {
        photosPermission: "Allow SnatchedAI to access your photos.",
        savePhotosPermission: "Allow SnatchedAI to save photos.",
        isAccessMediaLocationEnabled: true,
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Allow SnatchedAI to access your camera",
        microphonePermission: "Allow SnatchedAI to access your microphone",
        recordAudioAndroid: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#f472b6",
        image: "./assets/splash-icon.png",
        imageWidth: 200,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  updates: {
    url: "https://u.expo.dev/8bcf08a2-4cad-4b0d-a2c0-197528f19cc7",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "8bcf08a2-4cad-4b0d-a2c0-197528f19cc7",
      appVariant: process.env.APP_VARIANT,
      ngrokUrl: process.env.NGROK_URL,
    },
  },
  owner: "omnicentra",
});
