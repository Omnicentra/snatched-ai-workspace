# App Update Checking Feature

This feature allows the app to check for updates from the App Store/Google Play Store and prompt users to update when a newer version is available.

## Components

### 1. `useAppUpdateCheck` Hook (`src/hooks/useAppUpdateCheck.ts`)

A custom React hook that handles version checking logic:

**Features:**
- Checks for app updates from the App Store (iOS) or Google Play Store (Android)
- Caches the last check time to avoid excessive API calls (24-hour interval)
- Allows users to dismiss update prompts for specific versions
- Provides methods to open the app store and force-check for updates

**Usage:**
```typescript
const {
  updateInfo,      // Current update status and version info
  isChecking,      // Loading state
  error,           // Error message if check fails
  checkForUpdate,  // Function to manually check for updates
  openStore,       // Function to open app store
  dismissUpdate,   // Function to dismiss current update
  resetDismissedUpdate // Function to reset dismissed updates
} = useAppUpdateCheck();
```

### 2. `AppUpdatePrompt` Component (`src/components/AppUpdatePrompt.tsx`)

A modal component that displays when an update is available:

**Features:**
- Beautiful modal design with blur background
- Shows current and new version numbers
- "Update Now" button to open the app store
- "Maybe Later" button to dismiss the prompt
- Automatically hidden if user previously dismissed the same version

**Usage:**
Simply add to your root layout:
```tsx
<AppUpdatePrompt />
```

### 3. `VersionInfo` Component (`src/components/VersionInfo.tsx`)

A settings/profile screen component to display version information:

**Features:**
- Shows current app version
- Displays update banner when new version available
- Manual "Check for updates" button
- Loading indicator during version check

**Usage:**
```tsx
<VersionInfo />
```

## Implementation Details

### Version Checking
- **iOS**: Uses iTunes Lookup API with app ID `6744844397`
- **Android**: Uses Google Play Store API with package name

### Storage Keys
- `@app_last_update_check`: Stores timestamp of last update check
- `@app_update_dismissed_version`: Stores dismissed version number

### Update Check Interval
- Automatic checks occur once every 24 hours
- Manual checks can be triggered anytime via the VersionInfo component

## Current Versions
- **App Version**: 1.2.0 (from app.config.ts)
- **Latest App Store Version**: 1.8 (as of last check)

## Testing

A test script is available at `test-version-check.js` to verify App Store API connectivity:

```bash
node test-version-check.js
```

## Future Enhancements

1. **Force Update**: Add ability to mark certain versions as mandatory updates
2. **Release Notes**: Display release notes from the app store in the update prompt
3. **Analytics**: Track update prompt impressions and actions
4. **A/B Testing**: Test different update prompt designs and messaging
5. **Staged Rollouts**: Support percentage-based update prompts