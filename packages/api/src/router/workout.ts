import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { GoogleGenAI, Type } from "@google/genai";
import { db } from "@omc/db/client";
import { workouts, workoutExercises, exercises as exercisesTable } from "@omc/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const exerciseSchema = z.object({
  name: z.string(),
  targetMuscles: z.string(),
  sets: z.number(),
  reps: z.number(),
  restSeconds: z.number(),
});

const workoutSchema = z.object({
  title: z.string(),
  description: z.string(),
  durationMinutes: z.number(),
  difficultyLevel: z.string(),
  caloriesBurn: z.number(),
  exercises: z.array(exerciseSchema),
});

type Exercise = z.infer<typeof exerciseSchema>;
type Workout = z.infer<typeof workoutSchema>;

export const workoutRouter = {
  getDailyWorkout: publicProcedure
    .output(workoutSchema.extend({ id: z.number() }))
    .query(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents:
          "Generate a daily workout plan as JSON. Provide title (string), description (string), durationMinutes (number), difficultyLevel (string: e.g. beginner, intermediate, advanced), caloriesBurn (number), and exercises (array). For each exercise, include: name (string), targetMuscles (string), sets (number), reps (number), restSeconds (number). Output valid JSON only.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              durationMinutes: { type: Type.NUMBER },
              difficultyLevel: { type: Type.STRING },
              caloriesBurn: { type: Type.NUMBER },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    targetMuscles: { type: Type.STRING },
                    sets: { type: Type.NUMBER },
                    reps: { type: Type.NUMBER },
                    restSeconds: { type: Type.NUMBER },
                  },
                  required: ["name", "targetMuscles", "sets", "reps", "restSeconds"],
                },
              },
            },
            required: [
              "title",
              "description",
              "durationMinutes",
              "difficultyLevel",
              "caloriesBurn",
              "exercises",
            ],
          },
        },
      });

      if (!response.text) {
        throw new Error("No response from Gemini");
      }

      const workout = JSON.parse(response.text) as Workout;

      const [insertedWorkout] = await db
        .insert(workouts)
        .values({
          title: workout.title,
          description: workout.description,
          durationMinutes: workout.durationMinutes,
          difficultyLevel: workout.difficultyLevel,
          caloriesBurn: workout.caloriesBurn,
        })
        .returning({ id: workouts.id });

      if (!insertedWorkout) {
        throw new Error("Failed to insert workout");
      }

      await Promise.all(
        workout.exercises.map(async (exercise, index) => {
          const [insertedExercise] = await db
            .insert(exercisesTable)
            .values({
              name: exercise.name,
              targetMuscles: exercise.targetMuscles,
            })
            .returning({ id: exercisesTable.id });

          if (!insertedExercise) {
            throw new Error(`Failed to insert exercise ${exercise.name}`);
          }

          await db.insert(workoutExercises).values({
            workoutId: insertedWorkout.id,
            exerciseId: insertedExercise.id,
            sets: exercise.sets,
            reps: exercise.reps,
            restSeconds: exercise.restSeconds,
            orderIndex: index + 1,
          });
        })
      );

      return {
        id: insertedWorkout.id,
        ...workout,
      };
    }),
} satisfies TRPCRouterRecord;
