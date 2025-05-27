import { z } from "zod";

export const exerciseSchema = z.object({
  name: z.string(),
  targetMuscles: z.string(),
  sets: z.number(),
  reps: z.number(),
  restSeconds: z.number(),
});

export const workoutSchema = z.object({
  title: z.string(),
  description: z.string(),
  durationMinutes: z.number(),
  difficultyLevel: z.string(),
  caloriesBurn: z.number(),
  categoryId: z.number(),
  exercises: z.array(exerciseSchema),
});

export const weeklyPlanSchema = z.object({
  workouts: z.array(
    z.object({
      dayNumber: z.number(),
      workout: workoutSchema,
    }),
  ),
  targetCaloriesBurn: z.number(),
});

export type WeeklyPlan = z.infer<typeof weeklyPlanSchema>;
export type Workout = z.infer<typeof workoutSchema>;
export type Exercise = z.infer<typeof exerciseSchema>; 