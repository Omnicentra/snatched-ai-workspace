import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";

export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  imageUrl: string;
}

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
  meals: Record<string, Meal>;
}

const initialState: NutritionData = {
  loggedMeals: {},
  dailyTargets: {
    protein: 144,
    carbs: 115,
    fats: 50,
  },
  meals: {
    breakfast: {
      id: "breakfast",
      name: "Oatmeal Bowl",
      time: "8:00 AM",
      calories: 350,
      protein: 15,
      carbs: 45,
      fats: 8,
      imageUrl:
        "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
    lunch: {
      id: "lunch",
      name: "Mediterranean Salad",
      time: "12:30 PM",
      calories: 450,
      protein: 35,
      carbs: 25,
      fats: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
    snack: {
      id: "snack",
      name: "Berry Protein Bowl",
      time: "3:30 PM",
      calories: 200,
      protein: 18,
      carbs: 15,
      fats: 5,
      imageUrl:
        "https://images.unsplash.com/photo-1575224526797-5730d09d781d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
    dinner: {
      id: "dinner",
      name: "Grilled Salmon",
      time: "7:00 PM",
      calories: 500,
      protein: 35,
      carbs: 30,
      fats: 25,
      imageUrl:
        "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    },
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