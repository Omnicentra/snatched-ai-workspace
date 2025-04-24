import { observable } from "@legendapp/state";

// Type your Store interface
interface Onboarding {
  goals: string[];
  blockers: string[];
  frequency: string;
  triedInPast: string[];
  height: number;
  weight: number;
  ethnicity: string;
  bodyDescription: string[];
  hasHealthConditions: boolean;
  healthConditions: string;
  menstruralCycle: string;
  lastPeriodDate: string;
  cravings: string[];
  diet: string;
  name: string;
  age: number;
  frontViewPhoto: string;
  sideViewPhoto: string;
  backViewPhoto: string;  
  desiredShape: string;
  goalTimeline: string;
}

interface Store {
  onboarding: Onboarding;
}

// Create a global observable for the Todos
let nextId = 0;
export const store$ = observable<Store>({ 
  onboarding: {
    goals: [],
    blockers: [],
    frequency: "",
    triedInPast: [],
    height: 0,
    weight: 0,
    ethnicity: "",
    frontViewPhoto: "",
    sideViewPhoto: "",
    backViewPhoto: "",
    desiredShape: "",
    goalTimeline: "",
    bodyDescription: [],
    hasHealthConditions: false,
    healthConditions: "",
    menstruralCycle: "",
    lastPeriodDate: "",
    cravings: [],
    diet: "",
    name: "",
    age: 0,
  },
});
