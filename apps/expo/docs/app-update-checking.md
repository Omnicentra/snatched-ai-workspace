# App Update Checking Feature

This feature allows the app to check for updates using Expo's OTA (Over-The-Air) update system and download updates in the background for a seamless user experience.

## Components

### 1. `storage.ts` Utility (`src/lib/storage.ts`)

A utility module that provides a shared MMKV instance for high-performance storage:

**Features:**
- Uses MMKV for fast, synchronous storage operations
- Encrypted storage with a unique key
- Shared instance across the app
- Type-safe storage keys

### 2. `background-updates.ts` Utility (`src/utils/background-updates.ts`)

A utility module that handles background update checking using `expo-background-fetch` and `expo-updates`:

**Features:**
- Runs background update checks using Expo's background fetch capability
- Downloads updates automatically when available (minimum 30-minute intervals)
- Uses MMKV for fast, synchronous storage of update status
- Provides functions for manual update checking and applying updates

**Key Functions:**
- `registerBackgroundUpdateTask()`: Registers the background task for checking updates
- `checkForUpdateManually()`: Manually checks for and downloads updates
- `applyUpdate()`: Applies downloaded updates by reloading the app
- `dismissUpdate()` / `isUpdateDismissed()`: Handles update dismissal logic

### 3. `useAppUpdateCheck` Hook (`src/hooks/useAppUpdateCheck.ts`)

A custom React hook that provides a React interface to the update system:

**Features:**
- Monitors update status from background tasks and MMKV storage
- Provides loading states and error handling
- Allows manual update checks and immediate update application
- Handles update dismissal for specific versions

**Usage:**
```typescript
const {
  updateInfo,      // Current update status and version info
  isChecking,      // Loading state
  error,           // Error message if check fails
  checkForUpdate,  // Function to manually check for updates
  applyUpdate,     // Function to apply downloaded updates
  dismissUpdate,   // Function to dismiss current update
  resetDismissedUpdate // Function to reset dismissed updates
} = useAppUpdateCheck();
```

**Update Info Object:**
```typescript
{
  isUpdateAvailable: boolean;     // Whether an update is available
  currentVersion: string;         // Current app version
  hasDownloadedUpdate: boolean;   // Whether update is downloaded and ready
  isUpdateDismissed: boolean;     // Whether user dismissed this update
  manifestId?: string;           // Unique identifier for the update
}
```

### 4. `AppUpdatePrompt` Component (`src/components/AppUpdatePrompt.tsx`)

A modal component that displays when an update is available:

**Features:**
- Beautiful modal design with blur background
- Shows different states (downloading vs ready to install)
- "Restart App" button when update is ready
- "Download & Install" button when update is still downloading
- "Maybe Later" button to dismiss the prompt
- Automatically hidden if user previously dismissed the same version

**Usage:**
```tsx
<AppUpdatePrompt />
```

### 5. `VersionInfo` Component (`src/components/VersionInfo.tsx`)

A settings/profile screen component to display version information:

**Features:**
- Shows current app version
- Displays update banner with appropriate messaging
- Manual "Check for updates" button
- Loading indicator during version check
- Different messaging for ready vs downloading states

**Usage:**
```tsx
<VersionInfo />
```

## Implementation Details

### Storage System
- Uses **MMKV**: High-performance key-value storage system
- **Synchronous Operations**: No async/await needed for storage operations
- **Encryption**: Data is encrypted at rest
- **Type Safety**: Strongly typed storage keys

### Background Update System
- Uses **Expo Updates**: OTA update system for React Native apps built with Expo
- Uses **Expo Background Fetch**: Runs update checks in the background
- **Minimum Interval**: 30 minutes (Expo's minimum for background tasks)
- **Update Strategy**: Download updates automatically, but require user action to apply

### Storage Keys
- `LAST_UPDATE_CHECK`: Timestamp of last update check
- `UPDATE_AVAILABLE`: Boolean flag for update availability
- `UPDATE_DISMISSED`: Stores dismissed update's manifest ID
- `LATEST_MANIFEST`: Stores the latest update manifest

### Update Flow
1. **Background Check**: App periodically checks for updates in background
2. **Download**: If available, update is downloaded automatically
3. **User Prompt**: User is notified and can choose to apply update
4. **Apply**: App restarts with new version when user confirms

## Key Advantages

1. **Performance**: MMKV provides much faster storage operations than AsyncStorage
2. **Instant Updates**: No app store approval process required
3. **Selective Rollout**: Can target specific user segments
4. **Rollback Capability**: Can revert updates if issues arise
5. **Smaller Download Size**: Only changed code, not entire app binary
6. **Background Downloads**: Updates ready when user wants them
7. **Synchronous Storage**: No async/await needed for storage operations

## Limitations

- **JavaScript/React Native Only**: Cannot update native code changes
- **Expo Managed Workflow**: Requires Expo build service
- **Network Dependent**: Requires internet connection for updates
- **iOS Restrictions**: Apple guidelines limit certain types of dynamic updates

## Testing

To test the update system:

1. **Development**: Use `expo publish` to push updates to development channel
2. **Staging**: Create preview builds with staging update channel
3. **Production**: Use EAS Update for production releases

## Current Versions
- **App Version**: 1.2.0 (from app.config.ts)
- **Update System**: Expo Updates v0.27.4
- **Storage System**: MMKV v3.2.0

## Future Enhancements

1. **Staged Rollouts**: Gradual rollout to percentage of users
2. **Update Size Optimization**: Minimize update bundle sizes
3. **Update Analytics**: Track update success/failure rates
4. **Smart Timing**: Apply updates during low-usage periods
5. **Rollback Detection**: Automatic rollback on crash loops
6. **Storage Migration**: Tool to migrate data from AsyncStorage to MMKV