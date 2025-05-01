import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";

export interface NutritionData {
  loggedMeals: Record<string, {
    loggedAt: string;
    mealId: string;
  }>;
  dailyTargets: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

const initialState: NutritionData = {
  loggedMeals: {},
  dailyTargets: {
    protein: 144,
    carbs: 115,
    fats: 50,
  },
};

export const nutritionStore$ = observable<NutritionData>(initialState);

// Persist the observable
syncObservable(nutritionStore$, {
  persist: {
    name: "nutrition",
    plugin: ObservablePersistMMKV,
  },
}); 