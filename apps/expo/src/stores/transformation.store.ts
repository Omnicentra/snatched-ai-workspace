import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync"
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import type { BodyRatingResponse } from "@omc/validators";

// Initial state matching the BodyRatingResponse type
const bodyRatingStoreInitialState: BodyRatingResponse = {
  currentSnatchedScore: null,
  potentialSnatchedScore: null,
  potentialWaistReductionInches: null,
  glowUpOdds: null,
  transformationComplete: null,
  waistDefinition: null,
  hipCurve: null,
  gluteShape: null,
  posture: null,
  armShape: null,
  backDefinition: null,
}

export interface TransformationData {
  currentImage: string | null;
  snatchedImage: string | null;
  nextSteps: string[];
  lastUpdated: string;
  bodyRating: BodyRatingResponse;
}

const initialState: TransformationData = {
  currentImage: null,
  snatchedImage: null,
  nextSteps: [
    "Focus on your core workouts to improve waist definition",
    "Maintain consistent glute exercises for better shape",
    "Add more resistance training for arm definition",
  ],
  lastUpdated: new Date().toISOString(),
  bodyRating: bodyRatingStoreInitialState,
};

export const transformationStore$ = observable<TransformationData>(initialState);

// Persist the observable to the named key of the global persist plugin
syncObservable(transformationStore$, {
    persist: {
        name: 'transformation',
        plugin: ObservablePersistMMKV
    }
})