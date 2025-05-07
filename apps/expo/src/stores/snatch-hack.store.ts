import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";

export interface CompletedHack {
  completedAt: string;
  hackId: number;
  date: string;
}

export interface SnatchHackState {
  completedHacks: Record<string, CompletedHack>;
}

// Create the store with initial state
export const snatchHackStore$ = observable<SnatchHackState>({
  completedHacks: {},
});

// Configure persistence
syncObservable(snatchHackStore$, {
  persist: {
    name: "snatch-hack-store",
    plugin: ObservablePersistMMKV,
  },
}); 