import { observable } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { syncObservable } from "@legendapp/state/sync";

export interface WorkoutClass {
  id: number;
  name: string;
  description: string | null;
}

export interface WorkoutPreferences {
  selectedClass: WorkoutClass | null;
}

export const workoutStore = observable<WorkoutPreferences>({
  selectedClass: null,
});

// Persist the store in AsyncStorage
syncObservable(workoutStore, {
  persist: {
    name: "workout-preferences",
    plugin: ObservablePersistMMKV,
  },
}); 