import { z } from "zod";

const optionalNullableString = z.string().nullable().optional();

export const ethnicityEnum = z.enum([
  "White / Caucasian",
  "Black / African American",
  "Hispanic / Latino",
  "Asian",
  "Middle Eastern / Indigenous",
  "I don't want to answer",
]);

export const heightUnitEnum = z.enum(["ft/in", "cm"]);
export const weightUnitEnum = z.enum(["lb", "kg"]);

export const medicalConditionResponseEnum = z.enum([
  "Yes",
  "No",
  "Prefer not to say",
]);
export const menstrualCycleStatusEnum = z.enum([
  "Yes - Regular",
  "Yes - Irregular",
  "No",
  "Prefer not to say",
]);

export const activityLevelEnum = z.enum([
  "Hardly ever",
  "Once or twice a week",
  "3 to 4 times a week",
  "5+ times a week",
]);

export const goalEnum = z.enum([
  "Lose weight",
  "Tone & sculpt",
  "Grow my glutes",
  "Overall glow-up",
]);

export const timelineEnum = z.enum([
  "As soon as possible",
  "In 1-2 months",
  "In 3-6 months",
  "No rush, just want to feel better",
]);

export const challengeEnum = z.enum([
  "Lack of motivation",
  "Busy schedule",
  "Struggle with food",
  "No clear plan",
]);

export const previousMethodEnum = z.enum([
  "Calorie counting",
  "Gym workouts",
  "Pilates / home workouts",
  "TikTok fitness plans",
]);

export const bodyConcernEnum = z.enum([
  "I want to smooth my hip dips",
  "I have a wide rib cage",
  "I have scoliosis or back sensitivity",
  "I feel like I have a straight body shape",
  "I don't have any specific body considerations",
  "I have something else to mention",
]);

export const desiredBodyShapeEnum = z.enum([
  "ATHLETIC",
  "GLUTE_GROWTH", 
  "HOURGLASS",
  "KEEP_FIT",
  "NORMAL_WEIGHT_LOSS",
  "PETITE_AND_TONE",
  "POSTPARTUM_SNATCHED",
  "SLIM",
  "TONE",
  "TONED_THIGHS",
]);

export const dietaryPreferenceEnum = z.enum([
  "Classic",
  "Pescatarian",
  "Vegetarian",
  "Vegan",
]);

export const cravingEnum = z.enum([
  "Chocolate",
  "Salty Snacks",
  "Sweets",
  "Carbs",
  "Fast Food",
  "Ice Cream",
  "Cheese",
  "Fried Food",
]);
 
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name is too long")
  .transform((val) => val.trim());

export const ageSchema = z
  .union([z.number(), z.string()])
  .transform((val) => parseInt(val.toString()))
  .pipe(
    z
      .number()
      .int("Age must be a whole number")
      .max(100, "Age must be less than 100"),
  );

export const nameAgeSchema = z.object({
  name: nameSchema,
  age: ageSchema,
});

export const physicalMeasurementsSchema = z.object({
  height: z.object({
    value: z.string().min(1, "Height value is required"),
    unit: heightUnitEnum,
  }),
  weight: z.object({
    value: z.number().positive("Weight must be positive"),
    unit: weightUnitEnum,
  }),
});

export const onboardingSchema = z.object({
  user_profile: z.object({
    personal_info: z.object({
      name: nameSchema,
      age: ageSchema,
      ethnicity: ethnicityEnum.optional(),
    }),
    physical_measurements: physicalMeasurementsSchema,
    health_and_cycle: z.object({
      has_medical_conditions: medicalConditionResponseEnum,

      medical_conditions_details: optionalNullableString,
      menstrual_cycle_status: menstrualCycleStatusEnum,

      last_period_start_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
        .nullable()
        .optional(),
    }),
    fitness_details: z.object({
      activity_level: activityLevelEnum,
      primary_goals: z
        .array(goalEnum)
        .min(1, "At least one primary goal must be selected"),
      achievement_timeline: timelineEnum,
      challenges: z.array(challengeEnum),
      previous_methods_tried: z.array(previousMethodEnum),
      body_concerns: z.array(bodyConcernEnum),

      other_body_details: optionalNullableString,
      desired_body_shape: desiredBodyShapeEnum,
    }),
    nutrition_details: z.object({
      dietary_preference: dietaryPreferenceEnum,
      cravings: z.array(cravingEnum),

      other_cravings: optionalNullableString,
    }),
  }),
});

export type UserProfile = z.infer<typeof onboardingSchema>;