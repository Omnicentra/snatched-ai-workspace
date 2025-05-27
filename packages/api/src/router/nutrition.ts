/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GoogleGenAI, Type } from "@google/genai";
import type { TRPCRouterRecord } from "@trpc/server";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { db } from "@omc/db/client";
import {
  mealPlans,
  mealSchedule,
  recipeIngredients,
  recipeInstructions,
  recipes,
  user,
  userRecipes
} from "@omc/db/schema";
import { prettyPrint, slugify } from "@omc/validators";
import type { Meal, MealPlan } from "@omc/validators/nutrition";
import {
  foodAnalysisSchema,
  mealLogSchema,
  recipeSchema,
  scannedMealSubmissionSchema
} from "@omc/validators/nutrition";

import { protectedProcedure, publicProcedure } from "../trpc";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper function to generate and upload an image for a recipe
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

      // Check if user has already generated a meal plan for today
      const [existingMealPlan] = await db
        .select()
        .from(mealPlans)
        .where(
          and(
            eq(mealPlans.userId, userId),
            sql`DATE(${mealPlans.date}) = CURRENT_DATE`,
          ),
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
  getRecipesByUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.session.user.id);
    const dbRecipes = await db
      .select({
        id: recipes.id,
        title: recipes.title,
        description: recipes.description,
        calories: recipes.calories,
        proteinGrams: recipes.proteinGrams,
        carbsGrams: recipes.carbsGrams,
        fatsGrams: recipes.fatsGrams,
        imageUrl: recipes.imageUrl,
        createdAt: recipes.createdAt,
        updatedAt: recipes.updatedAt,
        prepTimeMinutes: recipes.prepTimeMinutes,
        isFavorite: userRecipes.isFavorite,
      })
      .from(userRecipes)
      .innerJoin(recipes, eq(userRecipes.recipeId, recipes.id))
      .where(eq(userRecipes.userId, userId));

    prettyPrint(JSON.stringify(dbRecipes, null, 2));

    return dbRecipes;
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
      const userId = Number(ctx.session.user.id);

      // Get today's meal plan
      const today = new Date().toISOString().split("T")[0];
      const [todaysMealPlan] = await db
        .select()
        .from(mealPlans)
        .where(
          and(
            eq(mealPlans.userId, userId),
            sql`${mealPlans.date} = ${today}::date`,
          ),
        )
        .execute();

      if (!todaysMealPlan) {
        ctx.logger.error("No meal plan found for today", {
          router: "getTodaysMealPlan",
          userId,
          date: today,
        });
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
    const formattedMealSchedules: Record<
      string,
      (typeof mealSchedule.$inferSelect)[]
    > = {};

    for (const mealSchedule of mealSchedules) {
      // Get the meal plan for the meal schedule
      const mealPlan = dbMealPlans.find(
        (mealPlan) => mealPlan.id === mealSchedule.mealPlanId,
      );

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

      // Get meals for the current day
      // TODO: This is a temporary solution to get the meals for the current day
      const today = new Date().toISOString().split("T")[0]!;

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
            sql`${mealSchedule.updatedAt} >= ${today}::timestamp`,
          ),
        )
        .orderBy(sql`${mealSchedule.updatedAt} DESC`)
        .execute();

      return recentMeals;
    }),

  analyzeFoodImage: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string(),
      }),
    )
    .output(foodAnalysisSchema)
    .mutation(async({ input }) => {
      try {
        // Call Gemini API to analyze the food image
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Identify the food in the image and estimate its nutritional information based on typical serving sizes. Provide the following for the whole item:
                          - Food name
                          - Estimated calories (kcal)
                          - Estimated macronutrients (grams of protein, carbohydrates, and fats)
                          - ingredients list (with amounts and units)
                          - step-by-step cooking instructions

                        Be realistic, assume a normal serving size, and if uncertain, clearly state your assumption.
                        `,
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: input.imageBase64,
                  },
                },
              ],
            },
          ],
          config: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                foodName: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER },
                servingSize: { type: Type.STRING },
                assumptions: { type: Type.STRING },
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
                "foodName",
                "calories",
                "protein",
                "carbs",
                "fats",
                "servingSize",
                "assumptions",
                "instructions",
                "ingredients",
              ],
            },
          },
        });

        if (!response.text) {
          throw new Error("No response from Gemini");
        }

        return JSON.parse(response.text) as z.infer<typeof foodAnalysisSchema>;
      } catch (error) {
        console.error("Error analyzing food image:", error);
        // Fallback to a default response for demo purposes
        return {
          foodName: "Unknown Food Item",
          calories: 250,
          protein: 15,
          carbs: 30,
          fats: 10,
          servingSize: "100g",
          assumptions: "Assumed a normal serving size of 100g",
          instructions: [],
          ingredients: [],
        };
      }
    }),

  validateFoodImage: protectedProcedure
    .input(
      z.object({
        imageKey: z.string().optional(),
        imageBase64: z.string().optional(),
      }),
    )
    .output(
      z.object({
        isValidFood: z.boolean(),
        confidence: z.number(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        if (!input.imageKey && !input.imageBase64) {
          throw new Error("Either imageKey or imageBase64 must be provided");
        }

        // Use Gemini to check if the image contains food
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "Is this an image of food? Respond with only a JSON object that has three fields: isValidFood (boolean), confidence (number between 0 and 1), and message (string with reasoning). Return false for isValidFood if there is no food or if the image is inappropriate.",
                },
                input.imageKey
                  ? {
                      text: `Image URL: https://snatched-ai-bucket.s3.amazonaws.com/${input.imageKey}`,
                    }
                  : {
                      inlineData: {
                        mimeType: "image/jpeg",
                        data: input.imageBase64!,
                      },
                    },
              ],
            },
          ],
          config: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isValidFood: { type: Type.BOOLEAN },
                confidence: { type: Type.NUMBER },
                message: { type: Type.STRING },
              },
              required: ["isValidFood", "confidence", "message"],
            },
          },
        });

        if (!response.text) {
          throw new Error("No response from Gemini");
        }

        const result = JSON.parse(response.text) as {
          isValidFood: boolean;
          confidence: number;
          message: string;
        };

        return result;
      } catch (error) {
        console.error("Error validating food image:", error);
        return {
          isValidFood: false,
          confidence: 0,
          message: "Failed to validate image",
        };
      }
    }),

  generateFoodImageUploadUrl: protectedProcedure
    .input(
      z.object({
        mealName: z.string(),
        fileType: z.string(),
      }),
    )
    .output(
      z.object({
        presignedUrl: z.string(),
        key: z.string(),
        fileName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { mealName, fileType } = input;

      try {
        // Generate unique file name with UUID
        const fileExtension = fileType.split("/").pop() ?? "jpg";
        const fileName = `${uuidv4()}.${fileExtension}`;

        // Create S3 key path
        const sanitizedMealName = slugify(mealName);
        const key = `recipes/${sanitizedMealName}.${fileExtension}`;

        // Generate presigned URL for direct upload
        const putCommand = new PutObjectCommand({
          Bucket: "snatched-ai-bucket",
          Key: key,
          ContentType: fileType,
        });

        // Generate signed URL that expires in 10 minutes
        const presignedUrl = await getSignedUrl(ctx.s3, putCommand, {
          expiresIn: 600,
        });

        return {
          presignedUrl,
          key,
          fileName,
        };
      } catch (error) {
        console.error("Error generating upload URL:", error);
        throw new Error("Failed to generate upload URL for food image");
      }
    }),

  submitScannedMeal: protectedProcedure
    .input(scannedMealSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const { ingredients, instructions } = input;

      try {
        // 1. Get today's meal plan or create if it doesn't exist
        const [todaysMealPlan] = await db
          .select()
          .from(mealPlans)
          .where(
            and(
              eq(mealPlans.userId, userId),
              sql`DATE(${mealPlans.date}) = CURRENT_DATE`,
            ),
          )
          .execute();

        if (!todaysMealPlan) {
          throw new Error("No meal plan found for today");
        }

        const mealPlanId = todaysMealPlan.id;
        ctx.logger.info("Meal plan ID", { mealPlanId });

        // 2. Upsert the recipe from the scanned food data
        const [recipe] = await db
          .insert(recipes)
          .values({
            title: input.foodName,
            description: `Scanned meal: ${input.foodName}`,
            servings: 1,
            prepTimeMinutes: 5, // Default value for scanned meals
            calories: input.calories,
            proteinGrams: input.protein,
            carbsGrams: input.carbs,
            fatsGrams: input.fats,
            imageUrl: input.imageKey
              ? `https://snatched-ai-bucket.s3.amazonaws.com/${input.imageKey}`
              : null,
            categoryId: input.categoryId,
          })
          .returning();

        if (!recipe) {
          throw new Error("Failed to create recipe from scanned meal");
        }

        // 3. Add ingredients to recipe
        const ingredientsToInsert = ingredients.map((ingredient, index) => ({
          recipeId: recipe.id,
          ingredientName: ingredient.name,
          amount: ingredient.amount.toString(),
          unit: ingredient.unit,
          orderIndex: index + 1,
        }));

        await db.insert(recipeIngredients).values(ingredientsToInsert);

        // 4. Add instructions to recipe
        const instructionsToInsert = instructions.map((instruction) => ({
          recipeId: recipe.id,
          stepNumber: instruction.stepNumber,
          instruction: instruction.instruction,
        }));

        await db.insert(recipeInstructions).values(instructionsToInsert);

        // 5. Add to user recipes
        await db
          .insert(userRecipes)
          .values({
            userId,
            recipeId: recipe.id,
            isFavorite: false,
            lastCookedAt: new Date().toISOString(),
          })
          .onConflictDoUpdate({
            target: [userRecipes.userId, userRecipes.recipeId],
            set: {
              lastCookedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });

        // 6. Find existing meal schedule for the given meal type, or create a new one
        const [existingMeal] = await db
          .select()
          .from(mealSchedule)
          .where(
            and(
              eq(mealSchedule.mealPlanId, mealPlanId),
              eq(mealSchedule.mealType, input.mealType.toLowerCase()),
            ),
          )
          .execute();

        if (existingMeal) {
          // Update existing meal schedule
          await db
            .update(mealSchedule)
            .set({
              recipeId: recipe.id,
              completed: true,
              completedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(mealSchedule.id, existingMeal.id));
        } else {
          // Create new meal schedule
          await db.insert(mealSchedule).values({
            mealPlanId,
            recipeId: recipe.id,
            mealType: input.mealType.toLowerCase(),
            scheduledTime: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            completed: true,
            completedAt: sql`CURRENT_TIMESTAMP`,
          });
        }

        return {
          success: true,
          recipeId: recipe.id,
          message: "Meal successfully logged",
        };
      } catch (error) {
        console.error("Error submitting scanned meal:", error);
        throw new Error("Failed to submit scanned meal");
      }
    }),

  toggleFavoriteRecipe: protectedProcedure
    .input(
      z.object({
        recipeId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      // Get current favorite status
      const [currentStatus] = await db
        .select()
        .from(userRecipes)
        .where(
          and(
            eq(userRecipes.userId, userId),
            eq(userRecipes.recipeId, input.recipeId),
          ),
        )
        .execute();

      if (!currentStatus) {
        // If no entry exists, create one with isFavorite = true
        const [newEntry] = await db
          .insert(userRecipes)
          .values({
            userId,
            recipeId: input.recipeId,
            isFavorite: true,
            lastCookedAt: new Date().toISOString(),
          })
          .returning();

        return newEntry;
      }

      // Toggle the favorite status
      const [updatedEntry] = await db
        .update(userRecipes)
        .set({
          isFavorite: !currentStatus.isFavorite,
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(userRecipes.userId, userId),
            eq(userRecipes.recipeId, input.recipeId),
          ),
        )
        .returning();

      return updatedEntry;
    }),

  logSavedMeal: protectedProcedure
    .input(
      z.object({
        recipeId: z.number(),
        mealType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);

      try {
        // 1. Get today's meal plan
        const [todaysMealPlan] = await db
          .select()
          .from(mealPlans)
          .where(
            and(
              eq(mealPlans.userId, userId),
              sql`DATE(${mealPlans.date}) = CURRENT_DATE`,
            ),
          )
          .execute();

        if (!todaysMealPlan) {
          ctx.logger.error("No meal plan found for today", {
            router: "logSavedMeal",
            recipeId: input.recipeId,
            mealType: input.mealType,
            userId,
            date: new Date().toISOString(),
          });
          throw new Error("No meal plan found for today");
        }

        const mealPlanId = todaysMealPlan.id;

        // 2. Find existing meal schedule for the given meal type, or create a new one
        const [existingMeal] = await db
          .select()
          .from(mealSchedule)
          .where(
            and(
              eq(mealSchedule.mealPlanId, mealPlanId),
              eq(mealSchedule.mealType, input.mealType.toLowerCase()),
            ),
          )
          .execute();

        if (existingMeal) {
          // Update existing meal schedule
          await db
            .update(mealSchedule)
            .set({
              recipeId: input.recipeId,
              completed: true,
              completedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(mealSchedule.id, existingMeal.id));
        } else {
          // Create new meal schedule
          await db.insert(mealSchedule).values({
            mealPlanId,
            recipeId: input.recipeId,
            mealType: input.mealType.toLowerCase(),
            scheduledTime: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            completed: true,
            completedAt: sql`CURRENT_TIMESTAMP`,
          });
        }

        return {
          success: true,
          message: "Meal successfully logged",
        };
      } catch (error) {
        console.error("Error logging saved meal:", error);
        throw new Error("Failed to log saved meal");
      }
    }),

} satisfies TRPCRouterRecord;
