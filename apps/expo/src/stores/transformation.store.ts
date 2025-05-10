import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync"
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import type { BodyRatingResponse } from "@omc/validators";

// Initial state matching the BodyRatingResponse type
const bodyRatingStoreInitialState: BodyRatingResponse = {
  currentSnatchedScore: null,
  potentialSnatchedScore: null,
  potentialWaistReductionInches: null,
  waistDefinition: null,
  hipCurve: null,
  gluteShape: null,
  posture: null,
  armShape: null,
  backDefinition: null,
  issue1: null,
  issue2: null,
  issue3: null,
}

export interface TransformationData {
  currentImage: string | null;
  snatchedImage: string | null;
  nextSteps: string[];
  lastUpdated: string;
  bodyRating: BodyRatingResponse;
  nextImageTransformationTime: string | null;
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
  nextImageTransformationTime: null,
};

export const transformationStore$ = observable<TransformationData>(initialState);

// Persist the observable to the named key of the global persist plugin
syncObservable(transformationStore$, {
    persist: {
        name: 'transformation',
        plugin: ObservablePersistMMKV
    }
})

// Helper to set the next image transformation time to 3 minutes from now
export function setNextImageTransformationTime() {
  const nextTime = new Date(Date.now() + 3 * 60 * 1000).toISOString();
  transformationStore$.nextImageTransformationTime.set(nextTime);
}