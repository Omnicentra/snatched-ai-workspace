import { z } from 'zod';


const OptionalNullableString = z.string().nullable().optional();


const EthnicityEnum = z.enum([
  "White / Caucasian",
  "Black / African American",
  "Hispanic / Latino",
  "Asian",
  "Middle Eastern / Indigenous",
  "I don't want to answer"
]);

const HeightUnitEnum = z.enum(["ft/in", "cm"]);
const WeightUnitEnum = z.enum(["lb", "kg"]);

const MedicalConditionResponseEnum = z.enum(["Yes", "No", "Prefer not to say"]);
const MenstrualCycleStatusEnum = z.enum(["Yes - Regular", "Yes - Irregular", "No", "Prefer not to say"]);

const ActivityLevelEnum = z.enum([
  "Hardly ever",
  "Once or twice a week",
  "3 to 4 times a week",
  "5+ times a week"
]);

const GoalEnum = z.enum([
  "Lose weight",
  "Tone & sculpt",
  "Grow my glutes",
  "Overall glow-up"
]);

const TimelineEnum = z.enum([
  "As soon as possible",
  "In 1-2 months",
  "In 3-6 months",
  "No rush, just want to feel better"
]);

const ChallengeEnum = z.enum([
  "Lack of motivation",
  "Busy schedule",
  "Struggle with food",
  "No clear plan"
]);

const PreviousMethodEnum = z.enum([
  "Calorie counting",
  "Gym workouts",
  "Pilates / home workouts",
  "TikTok fitness plans"
]);

const BodyConcernEnum = z.enum([
  "I want to smooth my hip dips",
  "I have a wide rib cage",
  "I have scoliosis or back sensitivity",
  "I feel like I have a straight body shape",
  "I have something else to mention"
]);


const DesiredBodyShapeEnum = z.enum([
  
  "Petite & toned",
  "Toned",
  "Glute Growth",
  "Toned Thighs",
  
  "Normal Weight Loss",
  "Postpartum Snatched",
  "Keep Fit",
  "Lose Weight", 
  
  "Athletic",
  "Hourglass",
  "Slim",
  "Muscular"
]);


const DietaryPreferenceEnum = z.enum([
  "Classic",
  "Pescatarian",
  "Vegetarian",
  "Vegan"
]);

const CravingEnum = z.enum([
  "Chocolate",
  "Salty Snacks",
  "Sweets",
  "Carbs",
  "Fast Food",
  "Ice Cream",
  "Cheese",
  "Fried Food"
]);


export const OnBoardingSchema = z.object({
  user_profile: z.object({
    personal_info: z.object({
      
      ethnicity: EthnicityEnum.optional(),
    }),
    physical_measurements: z.object({
      height: z.object({
        value: z.string().min(1, "Height value is required"), 
        unit: HeightUnitEnum,
      }),
      weight: z.object({
        value: z.number().positive("Weight must be positive"), 
        unit: WeightUnitEnum,
      }),
    }),
    health_and_cycle: z.object({
      has_medical_conditions: MedicalConditionResponseEnum,
      
      medical_conditions_details: OptionalNullableString,
      menstrual_cycle_status: MenstrualCycleStatusEnum,
      
      last_period_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").nullable().optional(),
    }),
    fitness_details: z.object({
      activity_level: ActivityLevelEnum,
      primary_goals: z.array(GoalEnum).min(1, "At least one primary goal must be selected"), 
      achievement_timeline: TimelineEnum,
      challenges: z.array(ChallengeEnum), 
      previous_methods_tried: z.array(PreviousMethodEnum), 
      body_concerns: z.array(BodyConcernEnum), 
      
      other_body_details: OptionalNullableString,
      desired_body_shape: DesiredBodyShapeEnum,
    }),
    nutrition_details: z.object({
      dietary_preference: DietaryPreferenceEnum,
      cravings: z.array(CravingEnum), 
      
      other_cravings: OptionalNullableString,
    }),
  }),
});

export type UserProfile = z.infer<typeof OnBoardingSchema>;

