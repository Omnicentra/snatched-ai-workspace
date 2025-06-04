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
  isRegenerating: boolean;
}

export const workoutStore = observable<WorkoutPreferences>({
  selectedClass: null,
  isRegenerating: false,
});

export const resetWorkoutStore = () => {
  workoutStore.set({
    selectedClass: null,
    isRegenerating: false,
  });
};

// Persist the store in AsyncStorage
syncObservable(workoutStore, {
  persist: {
    name: "workout-preferences",
    plugin: ObservablePersistMMKV,
  },
}); 