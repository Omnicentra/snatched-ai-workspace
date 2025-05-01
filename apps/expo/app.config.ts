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
            host: "painfully-classic-egret.ngrok-free.app",
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
            host: "snatched-ai-dev-oh2uj.ondigitalocean.app",
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
            host: "snatchedai.com",
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
  version: "1.0.5",
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
    usesAppleSignIn: true,
    config: {
      usesNonExemptEncryption: false,
    },
    associatedDomains: [
      "applinks:painfully-classic-egret.ngrok-free.app",
      "applinks:snatched-ai-dev-oh2uj.ondigitalocean.app",
      "applinks:snatchedai.com",
    ],
    entitlements: {
      "com.apple.developer.applesignin": ["Default"],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    versionCode: 2,
    package: androidPackage,
    permissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.ACCESS_MEDIA_LOCATION",
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: intentFilters,
        category: ["BROWSABLE", "DEFAULT"],
      },
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
        photosPermission: "Allow SnatchedAI to access your photos. This helps us analyze your body shape, track your progress over time, and provide personalized fitness recommendations.",
        savePhotosPermission: "Allow SnatchedAI to save photos. This lets you save your progress photos and AI-generated visualizations to your device.",
        isAccessMediaLocationEnabled: true,
      },
    ],
    [
      "expo-camera",
      {
        cameraPermission: "Allow SnatchedAI to access your camera. This lets you take progress photos, get real-time body shape analysis, and receive instant style recommendations.",
        microphonePermission: "Allow SnatchedAI to access your microphone. This enables voice commands for hands-free operation during workout sessions.",
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
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          buildToolsVersion: "35.0.0",
        },
        ios: {
          deploymentTarget: "15.1",
        },
      },
    ]
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
      revenuecatProjectAppleApiKey: "appl_ihLfvNYWzXDhzMTPQoGLwVGsJKF",
      revenuecatProjectGoogleApiKey: "goog_zymKRJSOYmVtSusuckLwdQuXgIk"
    },
  },
  owner: "omnicentra",
});
