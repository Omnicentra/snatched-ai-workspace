import { observable } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { syncObservable } from "@legendapp/state/sync";
import { BodyRatingResponse } from "@omc/validators";
import { desiredBodyShapeEnum } from "@omc/validators/onboarding";
import { z } from "zod";

type desiredBodyShape = z.infer<typeof desiredBodyShapeEnum>

// Type your Store interface
interface Onboarding {
  goals: string[];
  blockers: string[];
  frequency: string;
  triedInPast: string[];
  height: number;
  heightUnit: string;
  weight: number;
  weightUnit: string;
  ethnicity: string;
  bodyDescription: string[];
  otherBodyDetails: string;
  hasHealthConditions: boolean;
  healthConditions: string;
  menstruralCycle: string;
  lastPeriodDate: string;
  cravings: string[];
  otherCravings: string;
  diet: string;
  name: string;
  age: number;
  frontViewPhoto: string;
  sideViewPhoto: string;
  backViewPhoto: string;  
  desiredShape: desiredBodyShape;
  goalTimeline: string;
}

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

interface Store {
  onboarding: Onboarding;
  bodyRating: BodyRatingResponse;
  transformedImageKey: string;
}

// Create a global observable for the store
export const onboardingStore$ = observable<Store>({ 
  onboarding: {
    goals: [],
    blockers: [],
    frequency: "",
    triedInPast: [],
    height: 0,
    heightUnit: "ft/in",
    weight: 0,
    weightUnit: "lb",
    ethnicity: "",
    frontViewPhoto: "",
    sideViewPhoto: "",
    backViewPhoto: "",
    desiredShape: "" as desiredBodyShape,
    goalTimeline: "",
    bodyDescription: [],
    otherBodyDetails: "",
    hasHealthConditions: false,
    healthConditions: "",
    menstruralCycle: "",
    lastPeriodDate: "",
    cravings: [],
    otherCravings: "",
    diet: "",
    name: "",
    age: 0,
  },
  bodyRating: bodyRatingStoreInitialState,
  transformedImageKey: "",
});

// Persist the observable to the named key of the global persist plugin
syncObservable(onboardingStore$, {
  persist: {
      name: 'onboarding',
      plugin: ObservablePersistMMKV
  }
})
