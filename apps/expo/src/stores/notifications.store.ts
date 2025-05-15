import { observable } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { syncObservable } from "@legendapp/state/sync";
// Define the shape of the notification state
interface NotificationState {
  times: {
    morning: {
      hour: number;
      minute: number;
    };
    lunch: {
      hour: number;
      minute: number;
    };
    dinner: {
      hour: number;
      minute: number;
    };
    // Future notification times can be added here
  };
}

// Create the default state
const defaultState: NotificationState = {
  times: {
    morning: {
      hour: 8, // Default to 8 AM
      minute: 0,
    },
    lunch: {
      hour: 13, // Default to 1 PM
      minute: 0,
    },
    dinner: {
      hour: 20, // Default to 8 PM
      minute: 0,
    },
  },
};

// Create and export the store
export const notificationsStore$ = observable<NotificationState>(defaultState);

// Helper function to set the morning notification time
export const setMorningNotificationTime = (hour: number, minute: number) => {
  notificationsStore$.times.morning.hour.set(hour);
  notificationsStore$.times.morning.minute.set(minute);
};

// Helper function to get the morning notification time
export const getMorningNotificationTime = (): { hour: number; minute: number } => {
  return {
    hour: notificationsStore$.times.morning.hour.get(),
    minute: notificationsStore$.times.morning.minute.get(),
  };
};

// Helper function to set the lunch notification time
export const setLunchNotificationTime = (hour: number, minute: number) => {
  notificationsStore$.times.lunch.hour.set(hour);
  notificationsStore$.times.lunch.minute.set(minute);
};

// Helper function to get the lunch notification time
export const getLunchNotificationTime = (): { hour: number; minute: number } => {
  return {
    hour: notificationsStore$.times.lunch.hour.get(),
    minute: notificationsStore$.times.lunch.minute.get(),
  };
};

// Helper function to set the dinner notification time
export const setDinnerNotificationTime = (hour: number, minute: number) => {
  notificationsStore$.times.dinner.hour.set(hour);
  notificationsStore$.times.dinner.minute.set(minute);
};

// Helper function to get the dinner notification time
export const getDinnerNotificationTime = (): { hour: number; minute: number } => {
  return {
    hour: notificationsStore$.times.dinner.hour.get(),
    minute: notificationsStore$.times.dinner.minute.get(),
  };
};

syncObservable(notificationsStore$, {
  persist: {
    name: "notifications-store",
    plugin: ObservablePersistMMKV,
  },
}); 