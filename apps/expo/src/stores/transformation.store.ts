import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync"
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";

export interface TransformationData {
  currentScore: number;
  targetScore: number;
  currentImage: string | null;
  snatchedImage: string | null;
  bodyPartScores: {
    waistDefinition: number;
    armShape: number;
    gluteProgress: number;
    legDefinition: number;
    backShape: number;
    coreStrength: number;
  };
  nextSteps: string[];
  lastUpdated: string;
}

const initialState: TransformationData = {
  currentScore: 72,
  targetScore: 95,
  currentImage: null,
  snatchedImage: null,
  bodyPartScores: {
    waistDefinition: 65,
    armShape: 72,
    gluteProgress: 58,
    legDefinition: 70,
    backShape: 63,
    coreStrength: 68,
  },
  nextSteps: [
    "Focus on your core workouts to improve waist definition",
    "Maintain consistent glute exercises for better shape",
    "Add more resistance training for arm definition",
  ],
  lastUpdated: new Date().toISOString(),
};

export const transformationStore$ = observable<TransformationData>(initialState);

// Persist the observable to the named key of the global persist plugin
syncObservable(transformationStore$, {
    persist: {
        name: 'transformation',
        plugin: ObservablePersistMMKV
    }
})