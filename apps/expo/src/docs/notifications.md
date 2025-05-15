# Notifications Implementation

This document provides an overview of how notifications are implemented in the Snatched AI app.

## Setup

Notifications are configured in the `app.config.ts` file using the `expo-notifications` plugin:

```javascript
[
  "expo-notifications",
  {
    "icon": "./local/assets/notification_icon.png",
    "color": "#ffffff",
    "defaultChannel": "default",
    enableBackgroundRemoteNotifications: true,
  },
],
```

## Implementation Files

1. **Main Notifications Module**: `src/lib/notifications.ts`
   - Contains functions for initializing notifications
   - Handles permission requests
   - Manages notification scheduling
   - Contains notification templates

## Notification Types

### Morning Motivation Notifications (9 AM)

These notifications are sent at 9 AM daily to motivate users to engage with their workouts. The messages cycle through the following templates:

1. Title: "Snatched O'Clock"
   Text: "New day, new body. Your morning workout is live 💖🔥"

2. Title: "Morning Magic Awaits"
   Text: "Your AI workout is ready. Time to sculpt that waist ✨👙"

3. Title: "Wake Up, Snatch Up"
   Text: "You slept, we planned. Your routine's ready. Let's move, queen 💪🏽👑"

## How It Works

1. On app startup, we initialize the notification system in the main app layout
2. We check if the user has already granted notification permissions
3. If permissions are granted, we schedule the morning notification
4. Each day at 9 AM, a notification will appear with one of the template messages

## Technical Details

### Local Notifications

The app uses Expo's local notification system to deliver scheduled notifications, even when the app is not running. The notification setup is:

1. We request notification permissions
2. We schedule a notification for 9 AM each day
3. For each notification, we use a random template from our predefined list

### Background Notifications

Background notifications are configured so the app can receive and process push notifications even when it's not in the foreground. This is enabled through the `enableBackgroundRemoteNotifications: true` setting.

## Future Improvements

1. Add additional notification types (afternoon, evening)
2. Implement user preferences for notification timing
3. Create more personalized notifications based on user workout history
4. Add server-side push notification capability for targeted campaigns

## Troubleshooting

- If notifications are not appearing, check the device settings to ensure notifications are enabled for the app
- On iOS, make sure notifications are enabled in the device's Settings app for Snatched AI
- On Android, check the notification channel settings 