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
  version: "1.0.4",
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
    buildNumber: "2",
    usesAppleSignIn: true,
    config: {
      usesNonExemptEncryption: false,
    },
    associatedDomains: [
      "applinks:painfully-classic-egret.ngrok-free.app",
      "applinks:snatched-ai-dev-oh2uj.ondigitalocean.app",
      "applinks:snatchedai.com",
    ],
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
