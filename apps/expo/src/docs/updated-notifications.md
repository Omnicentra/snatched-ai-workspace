# Enhanced Notifications Implementation

This document provides an overview of the enhanced notification system in the Snatched AI app.

## Architecture Overview

The notification system follows these key principles:
1. **Separation of concerns**: 
   - Schedule management via Legend State store
   - Permission management directly via Expo Notifications API
2. **User-customizable notification times**
3. **Seamless integration into the onboarding flow**
4. **Performance optimization**:
   - Only initializes notifications when necessary
   - Uses notification listeners efficiently

## Implementation Components

### 1. Notification Schedule Store (`stores/notifications.store.ts`)

The notification store provides centralized state management for notification schedules only:

```typescript
interface NotificationState {
  times: {
    morning: {
      hour: number;
      minute: number;
    };
    // Future notification times can be added here
  };
}
```

The store exports helper functions for time management:
- `setMorningNotificationTime(hour, minute)`: Updates the morning notification time
- `getMorningNotificationTime()`: Gets the current morning notification time

### 2. Notification Utility Module (`lib/notifications.ts`)

This module handles permissions, scheduling, and managing notifications:
- `checkNotificationPermissions()`: Checks if notification permissions are granted
- `requestNotificationPermissions()`: Requests notification permissions from the user
- `scheduleMorningNotification()`: Schedules a notification based on time in the store
- `initializeNotifications()`: Sets up notifications when permissions are granted

### 3. Onboarding Screens

#### Notification Permission Screen (`app/(onboarding)/notifications.tsx`)
- Displays a friendly UI for requesting notification permissions
- Uses the Expo Notifications API directly to request permissions
- Routes users to time selection or home screen based on permission

#### Notification Time Selection Screen (`app/(onboarding)/notification-time.tsx`)
- Allows users to select their preferred notification time
- Saves time preferences to the notification store
- Verifies permissions before attempting to schedule notifications

### 4. App Initialization (`app/_layout.tsx`)

The app uses a smart initialization strategy to avoid redundant operations:

- **One-time initialization per session**: Uses a ref to track whether notifications were checked in the current session
- **Checks existing notifications**: Only schedules new notifications if none are currently scheduled
- **Permission-aware**: Verifies permissions before attempting any notification operations
- **Efficient listeners**: Sets up notification listeners once with proper cleanup

## Notification Flow

1. User completes payment and unlocks results
2. User is presented with the notification permission screen
3. Permission is requested directly using the Expo Notifications API
4. If granted, they're taken to the time selection screen
5. The user selects their preferred time, which is saved in the store
6. Notifications are scheduled according to user preferences
7. On subsequent app launches:
   - The app checks if notifications are already scheduled
   - If scheduled notifications exist, it skips initialization
   - If no scheduled notifications exist, it schedules them again

## Templates

Notifications use a rotating set of templates to keep the content fresh:

```typescript
export const MORNING_NOTIFICATIONS = [
  {
    title: "Snatched O'Clock",
    body: "New day, new body. Your morning workout is live 💖🔥",
  },
  {
    title: "Morning Magic Awaits",
    body: "Your AI workout is ready. Time to sculpt that waist ✨👙",
  },
  {
    title: "Wake Up, Snatch Up",
    body: "You slept, we planned. Your routine's ready. Let's move, queen 💪🏽👑",
  },
];
```

## Benefits of This Approach

1. **Reliability**: Using the Expo Notifications API directly ensures permissions are always in sync with the device's actual state
2. **Cleaner separation of concerns**: Store only manages schedules, while permission logic is handled by the API
3. **Simplified state management**: Fewer properties to track and maintain
4. **Better integration with the platform**: Works with the device's permission system directly
5. **Performance optimization**: Avoids redundant initialization on each app launch
6. **Proper resource management**: Sets up and cleans up notification listeners correctly

## Future Enhancements

1. Support for additional notification types (afternoon, evening)
2. More personalized content based on user activity
3. A/B testing of notification content
4. Server-driven notification content 