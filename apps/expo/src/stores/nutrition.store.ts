import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";

export interface NutritionData {
  loggedMeals: Record<string, {
    loggedAt: string;
    mealId: string;
    mealName: string;
  }>;
  dailyTargets: {
    protein: number;
    carbs: number;
    fats: number;
  };
  isRegenerating: boolean;
}

const initialState: NutritionData = {
  loggedMeals: {},
  dailyTargets: {
    protein: 144,
    carbs: 115,
    fats: 50,
  },
  isRegenerating: false,
};

export const nutritionStore$ = observable<NutritionData>(initialState);

export const resetNutritionStore = () => {
  nutritionStore$.set({
    loggedMeals: {},
    dailyTargets: {
      protein: 144,
      carbs: 115,
      fats: 50,
    },
    isRegenerating: false,
  });
};

// Persist the observable
syncObservable(nutritionStore$, {
  persist: {
    name: "nutrition",
    plugin: ObservablePersistMMKV,
  },
}); 