import type { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { GoogleGenAI, Type } from "@google/genai";
import { OpenAI } from "openai";

import type { DesiredShape } from "@omc/validators/onboarding";
import type { Exercise, WeeklyPlan, Workout } from "@omc/validators/workout";
import { db } from "@omc/db/client";
import {
  exercises,
  workoutExercises,
  workouts,
} from "@omc/db/schema";
import { slugify } from "@omc/validators";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper function to generate and upload an image for a workout
export const generateAndUploadImage = async (
  s3: S3Client,
  workoutName: string,
): Promise<string> => {
  const img = await openai.images.generate({
    model: "gpt-image-1",
    prompt: `Thumbnail image for ${workoutName}. The image should be a high-quality, professional-looking thumbnail for a workout video with no text or watermarks. Prefer a female model.`,
    n: 1,
    size: "1024x1024",
  });

  if (!img.data?.[0] || img.data.length === 0) {
    throw new Error("No image data returned from OpenAI");
  }

  const imageBuffer = Buffer.from(img.data[0].b64_json ?? "", "base64");
  const fileKey = `workouts/${slugify(workoutName)}.png`;

  const putCommand = new PutObjectCommand({
    Bucket: "snatched-ai-bucket",
    Key: fileKey,
    Body: imageBuffer,
    ContentType: "image/png",
  });

  await s3.send(putCommand);

  return `https://snatched-ai-bucket.s3.amazonaws.com/${fileKey}`;
};

// Helper function to check exercise similarity using Gemini
export async function checkExerciseSimilarity(
  exercise: Exercise,
  existingExercises: (typeof exercises.$inferSelect)[],
) {
  const similarityResponse = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Compare this exercise:
    Title: "${exercise.name}"
    Target Muscles: "${exercise.targetMuscles}"

    With these existing exercises:
    ${existingExercises.map((e) => `ID: ${e.id} Title: "${e.name}" Target Muscles: "${e.targetMuscles}"`).join("\n")}

    If the exercise is very similar, return the ID of the existing exercise. If not similar, return null.
    Respond with just the ID number or null, nothing else.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.NUMBER,
            nullable: true,
          },
        },
      },
    },
  });

  try {
    const responseData = JSON.parse(similarityResponse.text ?? "{}") as {
      id?: number | null;
    };
    return responseData.id ?? null;
  } catch (error) {
    console.error("Failed to parse similarity response:", error);
    return null;
  }
}

// Helper function to check workout similarity using Gemini
export async function findSimilarWorkout(
  workout: Workout,
  existingWorkouts: (typeof workouts.$inferSelect)[],
): Promise<number | null> {
  const similarityResponse = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Compare this workout:
Title: "${workout.title}"
Description: "${workout.description}"
Difficulty: ${workout.difficultyLevel}

With these existing workouts:
${existingWorkouts
  .map(
    (w) => `
        ID: ${w.id}
        Title: "${w.title}"
        Description: "${w.description}"
        Difficulty: ${w.difficultyLevel}`,
  )
  .join("\n")}

If the workout is very similar to any existing workout (similar title, description and difficulty), return the ID of that workout. If not similar, return null.
Respond with just the ID number or null, nothing else.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.NUMBER,
            nullable: true,
          },
        },
      },
    },
  });

  try {
    const responseData = JSON.parse(similarityResponse.text ?? "{}") as {
      id?: number | null;
    };
    return responseData.id ?? null;
  } catch (error) {
    console.error("Failed to parse similarity response:", error);
    return null;
  }
}

// Helper function to create a new workout with exercises
export async function createNewWorkout(s3: S3Client, workout: Workout) {
  const imageUrl = await generateAndUploadImage(s3, workout.title);

  const [insertedWorkout] = await db
    .insert(workouts)
    .values({
      title: workout.title,
      description: workout.description,
      durationMinutes: workout.durationMinutes || 30,
      difficultyLevel: workout.difficultyLevel,
      caloriesBurn: workout.caloriesBurn,
      categoryId: workout.categoryId,
      imageUrl,
    })
    .returning();

  if (!insertedWorkout) {
    throw new Error("Failed to insert workout");
  }

  const existingExercises = await db.select().from(exercises).execute();

  // Insert exercises
  await Promise.all(
    workout.exercises.map(async (exercise, index) => {
      // Check if a similar exercise already exists
      const similarExerciseId = await checkExerciseSimilarity(
        exercise,
        existingExercises,
      );
      if (similarExerciseId) {
        await db.insert(workoutExercises).values({
          workoutId: insertedWorkout.id,
          exerciseId: similarExerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          orderIndex: index + 1,
        });
      } else {
        const [insertedExercise] = await db
          .insert(exercises)
          .values({
            name: exercise.name,
            targetMuscles: exercise.targetMuscles,
          })
          .returning();

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
      }
    }),
  );

  return insertedWorkout;
}

// Helper function to generate weekly workout plan using Gemini
export async function generateWeeklyWorkoutPlan(
  desiredShape?: DesiredShape,
): Promise<WeeklyPlan> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `
      Generate a 7-day workout plan. For each day, provide a workout with:
      - Day number (1-7)
      - Workout details:
        - title
        - description
        - duration (minutes) - at least 5 minutes
        - difficulty level (beginner/intermediate/advanced)
        - calories burn estimate
        - categoryId (1 - Full Body, 2 - Lower Body, 3 - Upper Body, 4 - Core, 5 - HIIT, 6 - Cardio)
        - exercises (3-5 per workout)
          - name
          - target muscles
          - sets
          - reps
          - rest seconds between sets

      Consider these user preferences:
      ${
        desiredShape
          ? `
      - Desired body shape: ${desiredShape}
      `
          : "- No specific preferences set"
      }

      Make it a balanced plan with:
      - Progressive intensity
      - Different muscle groups
      - Rest days
      - Variety of exercises
      
      Return as JSON only.
    `,
    config: {
      temperature: 0.7,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          workouts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dayNumber: { type: Type.NUMBER },
                workout: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    durationMinutes: { type: Type.NUMBER },
                    difficultyLevel: { type: Type.STRING },
                    caloriesBurn: { type: Type.NUMBER },
                    categoryId: {
                      type: Type.NUMBER,
                      minimum: 1,
                      maximum: 6,
                    },
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
                        required: [
                          "name",
                          "targetMuscles",
                          "sets",
                          "reps",
                          "restSeconds",
                        ],
                      },
                    },
                  },
                  required: [
                    "title",
                    "description",
                    "durationMinutes",
                    "difficultyLevel",
                    "caloriesBurn",
                    "categoryId",
                    "exercises",
                  ],
                },
              },
              required: ["dayNumber", "workout"],
            },
          },
          targetCaloriesBurn: { type: Type.NUMBER },
        },
        required: ["workouts", "targetCaloriesBurn"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(response.text) as WeeklyPlan;
}

// Helper function to create a new workout with exercises
export async function createNewWorkoutWithExercises(s3: S3Client, workout: Workout) {
  const existingWorkouts = await db.select().from(workouts).execute();
  const similarWorkoutId = await findSimilarWorkout(workout, existingWorkouts);

  if (similarWorkoutId) {
    const existingWorkout = existingWorkouts.find((w) => w.id === similarWorkoutId);
    if (existingWorkout) {
      return existingWorkout;
    }
  }

  return createNewWorkout(s3, workout);
}
