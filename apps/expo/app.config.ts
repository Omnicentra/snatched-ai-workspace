import { ConfigContext, ExpoConfig } from "@expo/config";
import { withSentry } from "@sentry/react-native/expo";

function getAppConfig() {
  switch (process.env.APP_VARIANT) {
    case "development":
      return {
        name: "Snatched AI Dev",
        scheme: "snatched-ai-dev",
        androidPackage: "com.omnicentra.snatched_ai_dev",
        iosBundleIdentifier: "com.omnicentra.snatched-ai-dev",
        icon: "./assets/icon-dev.png",
        intentFilters: [
          {
            scheme: "https",
            host: "painfully-classic-egret.ngrok-free.app",
          },
        ],
        associatedDomains: ["applinks:painfully-classic-egret.ngrok-free.app"],
        apsEnvironment: "development",
      };
    case "preview":
      return {
        name: "Snatched AI Preview",
        scheme: "snatched-ai-preview",
        androidPackage: "com.omnicentra.snatched_ai_preview",
        iosBundleIdentifier: "com.omnicentra.snatched-ai-preview",
        icon: "./assets/icon-preview.png",
        intentFilters: [
          {
            scheme: "https",
            host: "snatched-ai-dev-oh2uj.ondigitalocean.app",
          },
        ],
        associatedDomains: ["applinks:snatched-ai-dev-oh2uj.ondigitalocean.app"],
        apsEnvironment: "production",
      };
    case "production":
    default:
      return {
        name: "Snatched AI",
        scheme: "snatched-ai",
        androidPackage: "com.omnicentra.snatched_ai",
        iosBundleIdentifier: "com.omnicentra.snatched-ai",
        icon: "./assets/icon.png",
        intentFilters: [
          {
            scheme: "https",
            host: "snatchedai.com",
          },
        ],
        associatedDomains: ["applinks:snatchedai.com"],
        apsEnvironment: "production",
      };
  }
}

const { name, scheme, androidPackage, iosBundleIdentifier, intentFilters, associatedDomains, icon, apsEnvironment } =
  getAppConfig();

const createConfig = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name,
  slug: "snatched-ai",
  version: "1.1.4",
  orientation: "portrait",
  icon,
  scheme,
  userInterfaceStyle: "light",
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
    appStoreUrl: "https://apps.apple.com/app/snatched-ai-slay-your-shape/id6744844397",
    associatedDomains: associatedDomains,
    entitlements: {
      "com.apple.developer.applesignin": ["Default"],
      "com.apple.developer.usernotifications.time-sensitive": true,
      "aps-environment": apsEnvironment,
    },
  },
  androidStatusBar: {
    barStyle: 'dark-content'
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
      "android.permission.BODY_SENSORS",
      "android.permission.BODY_SENSORS_BACKGROUND",
      "android.permission.POST_NOTIFICATIONS",
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
      "expo-asset",
      {
        assets: [
          "./src/assets/icons/body-parts/waist_definition.png",
          "./src/assets/icons/body-parts/arm_shape.png",
          "./src/assets/icons/body-parts/glute_shape.png",
          "./src/assets/icons/body-parts/hip_curve.png",
          "./src/assets/icons/body-parts/back_definition.png",
          "./src/assets/icons/body-parts/posture.png",
          "./src/assets/images/yoga_pose.png",
          "./src/assets/images/wreath.png",
          "./src/assets/images/logo_dark.png",
          "./src/assets/images/body_silhouette.png",
          "./src/assets/images/logo2.png",
          "./src/assets/images/silhouette_back.png",
          "./src/assets/images/body_positivity.png",
          "./src/assets/images/silhouette_front.png",
          "./src/assets/images/before_after.jpeg",
          "./src/assets/images/silhouette_side.png",
          "./src/assets/images/testimonials/image1.jpeg",
          "./src/assets/images/testimonials/image2.jpeg",
          "./src/assets/images/testimonials/image3.jpeg",         
        ],
      },
    ],
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
    ],
    [
      "expo-sensors",
      {
        motionPermission: "Allow SnatchedAI to access your device motion. This helps us analyze your body shape, track your progress over time, and provide personalized fitness recommendations.",
      }
    ],
    [
      "react-native-share",
      {
        "ios": [
          "fb",
          "instagram",
          "twitter",
          "tiktoksharesdk",
        ],
        "android": [
          "com.facebook.katana",
          "com.instagram.android",
          "com.twitter.android",
          "com.zhiliaoapp.musically",
        ]
      }
    ],
    [
      "expo-notifications",
      {
        "icon": "./assets/notification_icon.png",
        "color": "#ffffff",
        "defaultChannel": "default",
        enableBackgroundRemoteNotifications: true,
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
      cooldownWorkoutId: process.env.COOLDOWN_WORKOUT_ID,
      revenuecatProjectAppleApiKey: "appl_ihLfvNYWzXDhzMTPQoGLwVGsJKF",
      revenuecatProjectGoogleApiKey: "goog_zymKRJSOYmVtSusuckLwdQuXgIk",
      mixpanelToken: process.env.MIXPANEL_TOKEN,
      launchdarklyClientKey: process.env.LAUNCHDARKLY_CLIENT_KEY,
    },
  },
  owner: "omnicentra",
});

export default (ctx: ConfigContext) => withSentry(createConfig(ctx), {
  url: "https://sentry.io/",
  // Use SENTRY_AUTH_TOKEN env to authenticate with Sentry.
  project: "snatched-ai",
  organization: "omnicentra",
});

