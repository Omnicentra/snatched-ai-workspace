/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { S3Client } from "@aws-sdk/client-s3";
import type { TRPCRouterRecord } from "@trpc/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { GoogleGenAI, Type } from "@google/genai";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import OpenAI from "openai";
import { z } from "zod";

import { db } from "@omc/db/client";
import {
  mealPlans,
  mealSchedule,
  recipeIngredients,
  recipeInstructions,
  recipes,
  user,
} from "@omc/db/schema";
import { prettyPrint, slugify } from "@omc/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ingredientSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string(),
});

const instructionSchema = z.object({
  stepNumber: z.number(),
  instruction: z.string(),
});

const mealSchema = z.object({
  category: z.string(),
  time: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  name: z.string(),
  ingredients: z.array(ingredientSchema),
  instructions: z.array(instructionSchema),
});

const recipeSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  servings: z.number(),
  prepTimeMinutes: z.number().nullable(),
  calories: z.number(),
  proteinGrams: z.number(),
  carbsGrams: z.number(),
  fatsGrams: z.number(),
  imageUrl: z.string().nullable(),
  rating: z.string().nullable(),
  reviewCount: z.number().nullable(),
  categoryId: z.number().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const _mealPlanSchema = z.object({
  meals: z.array(mealSchema),
  targetCalories: z.number(),
  targetProtein: z.number(),
  targetCarbs: z.number(),
  targetFat: z.number(),
});

type Meal = z.infer<typeof mealSchema>;

type MealPlan = z.infer<typeof _mealPlanSchema>;

const generateAndUploadImage = async (
  s3: S3Client,
  recipeName: string,
): Promise<string> => {
  const img = await openai.images.generate({
    model: "gpt-image-1",
    prompt: `${recipeName}`,
    n: 1,
    size: "1024x1024",
  });

  if (!img.data?.[0] || img.data.length === 0) {
    throw new Error("No image data returned from OpenAI");
  }

  const imageBuffer = Buffer.from(img.data[0].b64_json ?? "", "base64");
  const fileKey = `recipes/${slugify(recipeName)}.png`;

  const putCommand = new PutObjectCommand({
    Bucket: "snatched-ai-bucket",
    Key: fileKey,
    Body: imageBuffer,
    ContentType: "image/png",
  });

  await s3.send(putCommand);

  return `https://snatched-ai-bucket.s3.amazonaws.com/${fileKey}`;
};

const createNewRecipe = async (s3: S3Client, meal: Meal) => {
  const imageUrl = await generateAndUploadImage(s3, meal.name);

  // Insert recipe
  const [recipe] = await db
    .insert(recipes)
    .values({
      title: meal.name,
      description: `A ${meal.name} recipe`,
      servings: 1,
      prepTimeMinutes: 30, // Default value
      calories: meal.calories,
      proteinGrams: meal.protein,
      carbsGrams: meal.carbs,
      fatsGrams: meal.fat,
      imageUrl, // Add the image URL to the recipe
    })
    .returning();

  if (!recipe) {
    throw new Error("Failed to insert recipe");
  }

  // Insert ingredients
  await Promise.all(
    meal.ingredients.map((ingredient, index) =>
      db.insert(recipeIngredients).values({
        recipeId: recipe.id,
        ingredientName: ingredient.name,
        amount: ingredient.amount.toString(),
        unit: ingredient.unit,
        orderIndex: index + 1,
      }),
    ),
  );

  // Insert instructions
  await Promise.all(
    meal.instructions.map((instruction) =>
      db.insert(recipeInstructions).values({
        recipeId: recipe.id,
        stepNumber: instruction.stepNumber,
        instruction: instruction.instruction,
      }),
    ),
  );

  return recipe;
};

const mealLogSchema = z.object({
  id: z.number(),
  mealType: z.string(),
  scheduledTime: z.string(),
  completedAt: z.string().nullable(),
  recipe: z.object({
    id: z.number(),
    title: z.string(),
    imageUrl: z.string().nullable(),
    calories: z.number(),
    proteinGrams: z.number(),
    carbsGrams: z.number(),
    fatsGrams: z.number(),
  }),
});

// Helper function to generate meal plan using Gemini
async function generateMealPlanWithGemini(): Promise<MealPlan> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `
      Generate a daily meal plan with category breakfast, lunch, and dinner (and optionally snacks).
      For each meal, provide:
      - time
      - calories
      - protein (g)
      - carbs (g) 
      - fat (g)
      - meal name
      - meal
      - ingredients list (with amounts and units)
      - step-by-step cooking instructions

      Make it realistic and healthy.
      Also return the target calories, protein, carbs, and fat for the day.
    `,
    config: {
      temperature: 0.5,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                time: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
                name: { type: Type.STRING },
                imageUrl: { type: Type.STRING },
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                    },
                    required: ["name", "amount", "unit"],
                  },
                },
                instructions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.NUMBER },
                      instruction: { type: Type.STRING },
                    },
                    required: ["stepNumber", "instruction"],
                  },
                },
              },
              required: [
                "category",
                "time",
                "calories",
                "protein",
                "carbs",
                "fat",
                "name",
                "ingredients",
                "instructions",
              ],
            },
          },
          targetCalories: { type: Type.NUMBER },
          targetProtein: { type: Type.NUMBER },
          targetCarbs: { type: Type.NUMBER },
          targetFat: { type: Type.NUMBER },
        },
        required: [
          "meals",
          "targetCalories",
          "targetProtein",
          "targetCarbs",
          "targetFat",
        ],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(response.text) as MealPlan;
}

// Helper function to check recipe similarity using Gemini
async function findSimilarRecipe(
  mealName: string,
  existingRecipes: (typeof recipes.$inferSelect)[],
): Promise<number | null> {
  const similarityResponse = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Compare this meal title: "${mealName}" with these existing recipe titles and IDs: ${existingRecipes.map((r) => `"Title: ${r.title}" (ID: ${r.id})`).join(", ")}. 
    If the meal is very similar to any existing recipe, return the ID of that recipe. If not similar, return null.
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

// Helper function to create or update recipe
async function getOrCreateRecipe(
  s3: S3Client,
  meal: MealPlan["meals"][number],
  existingRecipes: (typeof recipes.$inferSelect)[],
): Promise<typeof recipes.$inferSelect> {
  const similarRecipeId = await findSimilarRecipe(meal.name, existingRecipes);

  if (similarRecipeId) {
    const existingRecipe = existingRecipes.find(
      (r) => r.id === similarRecipeId,
    );
    if (existingRecipe) {
      console.log("Found existing recipe:", existingRecipe);
      // Check if the recipe needs an image
      if (!existingRecipe.imageUrl) {
        const imageUrl = await generateAndUploadImage(s3, meal.name);
        const [updatedRecipe] = await db
          .update(recipes)
          .set({ imageUrl })
          .where(eq(recipes.id, existingRecipe.id))
          .returning();

        if (!updatedRecipe) {
          console.error(
            "Failed to update recipe with image, using existing recipe",
          );
          return existingRecipe;
        }
        return updatedRecipe;
      }
      return existingRecipe;
    }
  }

  // Create new recipe
  const newRecipe = await createNewRecipe(s3, meal);
  return newRecipe;
}

// Main procedure
export const nutritionRouter = {
  generateMealPlan: protectedProcedure
    .output(createSelectSchema(mealPlans))
    .mutation(async ({ ctx }) => {
      const userId = Number(ctx.session.user.id);

      if (!userId) {
        throw new Error("User not found");
      }

      // Check if user has already generated a meal plan for today
      const [existingMealPlan] = await db
        .select()
        .from(mealPlans)
        .where(
          and(
            eq(mealPlans.userId, userId),
            sql`DATE(${mealPlans.date}) = CURRENT_DATE`
          )
        )
        .execute();

      if (existingMealPlan) {
        console.log("Found existing meal plan for today");
        prettyPrint(JSON.stringify(existingMealPlan, null, 2));
        return existingMealPlan;
      }

      // Generate meal plan
      const genMealPlan = await generateMealPlanWithGemini();

      // Create meal plan entry
      const [dbMealPlan] = await db
        .insert(mealPlans)
        .values({
          userId,
          date: new Date().toISOString(),
          targetCalories: genMealPlan.targetCalories,
          targetProtein: genMealPlan.targetProtein,
          targetCarbs: genMealPlan.targetCarbs,
          targetFats: genMealPlan.targetFat,
        })
        .returning();

      if (!dbMealPlan) {
        throw new Error("Failed to insert meal plan");
      }

      // Get existing recipes for similarity check
      const existingRecipes = await db.select().from(recipes).execute();

      // Process each meal
      await Promise.all(
        genMealPlan.meals.map(async (meal) => {
          // Get or create recipe
          const recipe = await getOrCreateRecipe(ctx.s3, meal, existingRecipes);

          // Create meal schedule entry
          await db.insert(mealSchedule).values({
            mealPlanId: dbMealPlan.id,
            recipeId: recipe.id,
            mealType: meal.category.toLowerCase(),
            scheduledTime: meal.time,
            completed: false,
          });

          return {
            ...meal,
            id: recipe.id,
          };
        }),
      );

      return dbMealPlan;
    }),
  getAllRecipes: publicProcedure
    .output(z.array(recipeSchema))
    .query(async () => {
      // Fetch all recipes from the database with categoryId
      const allRecipes = await db.select().from(recipes).execute();
      // Ensure all recipes match the schema - cast explicitly if needed
      return allRecipes.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        servings: recipe.servings,
        prepTimeMinutes: recipe.prepTimeMinutes,
        calories: recipe.calories,
        proteinGrams: recipe.proteinGrams,
        carbsGrams: recipe.carbsGrams,
        fatsGrams: recipe.fatsGrams,
        imageUrl: recipe.imageUrl,
        rating: recipe.rating,
        reviewCount: recipe.reviewCount,
        categoryId: recipe.categoryId,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
      }));
    }),

  getRecipeById: publicProcedure
    .input(z.object({ id: z.number() }))
    .output(
      recipeSchema.extend({
        ingredients: z.array(
          z.object({
            id: z.number(),
            recipeId: z.number(),
            ingredientName: z.string(),
            amount: z.string(),
            unit: z.string(),
            orderIndex: z.number(),
            createdAt: z.string().nullable(),
          }),
        ),
        instructions: z.array(
          z.object({
            id: z.number(),
            recipeId: z.number(),
            stepNumber: z.number(),
            instruction: z.string(),
            createdAt: z.string().nullable(),
          }),
        ),
      }),
    )
    .query(async ({ input }) => {
      // Fetch recipe details
      const [recipe] = await db
        .select()
        .from(recipes)
        .where(eq(recipes.id, input.id))
        .execute();

      if (!recipe) {
        throw new Error(`Recipe with ID ${input.id} not found`);
      }

      // Fetch ingredients
      const ingredients = await db
        .select()
        .from(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, input.id))
        .orderBy(recipeIngredients.orderIndex)
        .execute();

      // Fetch instructions
      const instructions = await db
        .select()
        .from(recipeInstructions)
        .where(eq(recipeInstructions.recipeId, input.id))
        .orderBy(recipeInstructions.stepNumber)
        .execute();

      // Cast the combined data to ensure it matches the schema
      return {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        servings: recipe.servings,
        prepTimeMinutes: recipe.prepTimeMinutes,
        calories: recipe.calories,
        proteinGrams: recipe.proteinGrams,
        carbsGrams: recipe.carbsGrams,
        fatsGrams: recipe.fatsGrams,
        imageUrl: recipe.imageUrl,
        rating: recipe.rating,
        reviewCount: recipe.reviewCount,
        categoryId: recipe.categoryId,
        createdAt: recipe.createdAt,
        updatedAt: recipe.updatedAt,
        ingredients,
        instructions,
      };
    }),

  getTodaysMealPlan: protectedProcedure
    .output(
      z.object({
        mealPlan: z.object({
          id: z.number(),
          targetCalories: z.number(),
          targetProtein: z.number(),
          targetCarbs: z.number(),
          targetFats: z.number(),
        }),
        meals: z.array(
          z.object({
            id: z.number(),
            mealType: z.string(),
            scheduledTime: z.string(),
            completed: z.boolean().default(false),
            completedAt: z.string().nullable(),
            recipe: recipeSchema.extend({
              ingredients: z.array(
                z.object({
                  id: z.number(),
                  ingredientName: z.string(),
                  amount: z.string(),
                  unit: z.string(),
                  orderIndex: z.number(),
                }),
              ),
              instructions: z.array(
                z.object({
                  id: z.number(),
                  stepNumber: z.number(),
                  instruction: z.string(),
                }),
              ),
            }),
          }),
        ),
      }),
    )
    .query(async ({ ctx }) => {
      const [dbUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, ctx.session.user.email))
        .execute();

      if (!dbUser) {
        throw new Error("User not found");
      }

      // Get today's meal plan
      const today = new Date().toISOString().split("T")[0];
      const [todaysMealPlan] = await db
        .select()
        .from(mealPlans)
        .where(
          and(
            eq(mealPlans.userId, dbUser.id),
            sql`${mealPlans.date} = ${today}::date`,
          ),
        )
        .execute();

      if (!todaysMealPlan) {
        throw new Error("No meal plan found for today");
      }

      // Get all scheduled meals with their recipes, ingredients, and instructions
      const scheduledMeals = await db
        .select({
          id: mealSchedule.id,
          mealType: mealSchedule.mealType,
          scheduledTime: mealSchedule.scheduledTime,
          completed: mealSchedule.completed,
          completedAt: mealSchedule.completedAt,
          recipe: recipes,
        })
        .from(mealSchedule)
        .where(eq(mealSchedule.mealPlanId, todaysMealPlan.id))
        .innerJoin(recipes, eq(mealSchedule.recipeId, recipes.id))
        .orderBy(asc(mealSchedule.scheduledTime))
        .execute();

      // Get ingredients and instructions for each recipe
      const mealsWithDetails = await Promise.all(
        scheduledMeals.map(async (meal) => {
          const ingredients = await db
            .select()
            .from(recipeIngredients)
            .where(eq(recipeIngredients.recipeId, meal.recipe.id))
            .orderBy(recipeIngredients.orderIndex)
            .execute();

          const instructions = await db
            .select()
            .from(recipeInstructions)
            .where(eq(recipeInstructions.recipeId, meal.recipe.id))
            .orderBy(recipeInstructions.stepNumber)
            .execute();

          return {
            ...meal,
            completed: meal.completed ?? false,
            recipe: {
              ...meal.recipe,
              ingredients,
              instructions,
            },
          };
        }),
      );

      return {
        mealPlan: {
          id: todaysMealPlan.id,
          targetCalories: todaysMealPlan.targetCalories,
          targetProtein: todaysMealPlan.targetProtein,
          targetCarbs: todaysMealPlan.targetCarbs,
          targetFats: todaysMealPlan.targetFats,
        },
        meals: mealsWithDetails,
      };
    }),
  getUserMealSchedules: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.session.user.id);
    const dbMealPlans = await db
      .select({ id: mealPlans.id, date: mealPlans.date })
      .from(mealPlans)
      .where(eq(mealPlans.userId, userId));

    if (!dbMealPlans[0]) {
      throw new Error("No meal plans found for user");
    }
    const mealPlanIds = dbMealPlans.map((mealPlan) => mealPlan.id);

    const mealSchedules = await db
      .select()
      .from(mealSchedule)
      .where(inArray(mealSchedule.mealPlanId, mealPlanIds))
      .execute();

      // Format the meal schedules such that the key is the meal plan date and the value is the meal schedules as an array
      const formattedMealSchedules: Record<string, typeof mealSchedule.$inferSelect[]> = {};

      for (const mealSchedule of mealSchedules) {
        // Get the meal plan for the meal schedule
        const mealPlan = dbMealPlans.find((mealPlan) => mealPlan.id === mealSchedule.mealPlanId);

        // If the meal plan is found, add the meal schedule to the formatted meal schedules
        if (mealPlan) {
          const dateStr = new Date(mealPlan.date).toISOString();
          const key = dateStr.split("T")[0]!;
          formattedMealSchedules[key] ??= [];
          formattedMealSchedules[key].push(mealSchedule);
        }
      }

    return formattedMealSchedules;
  }),

  toggleMealCompletion: protectedProcedure
    .input(
      z.object({
        mealScheduleId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      // Get current meal schedule
      const [currentMeal] = await db
        .select()
        .from(mealSchedule)
        .where(eq(mealSchedule.id, input.mealScheduleId))
        .execute();

      if (!currentMeal) {
        throw new Error("Meal schedule not found");
      }

      // Toggle completion status
      const [updatedMeal] = await db
        .update(mealSchedule)
        .set({
          completed: !currentMeal.completed,
          completedAt: !currentMeal.completed ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(mealSchedule.id, input.mealScheduleId))
        .returning();

      return updatedMeal;
    }),

  getRecentlyLoggedMeals: protectedProcedure
    .output(z.array(mealLogSchema))
    .query(async ({ ctx }) => {
      const [dbUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, ctx.session.user.email))
        .execute();

      if (!dbUser) {
        throw new Error("User not found");
      }

      // Get meals from the past 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const recentMeals = await db
        .select({
          id: mealSchedule.id,
          mealType: mealSchedule.mealType,
          scheduledTime: mealSchedule.scheduledTime,
          completedAt: mealSchedule.updatedAt,
          recipe: recipes,
        })
        .from(mealSchedule)
        .innerJoin(recipes, eq(mealSchedule.recipeId, recipes.id))
        .innerJoin(mealPlans, eq(mealSchedule.mealPlanId, mealPlans.id))
        .where(
          and(
            eq(mealPlans.userId, dbUser.id),
            eq(mealSchedule.completed, true),
            sql`${mealSchedule.updatedAt} >= ${oneDayAgo.toISOString()}::timestamp`,
          ),
        )
        .orderBy(sql`${mealSchedule.updatedAt} DESC`)
        .execute();

      return recentMeals;
    }),
} satisfies TRPCRouterRecord;
