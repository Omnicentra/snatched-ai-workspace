/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GoogleGenAI, Type } from "@google/genai";
import type { TRPCRouterRecord } from "@trpc/server";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import {
  mealPlans,
  mealSchedule,
  recipeIngredients,
  recipeInstructions,
  recipes,
  user,
  userRecipes
} from "@omc/db/schema";
import { slugify } from "@omc/validators";
import {
  foodAnalysisSchema,
  recipeSchema,
  scannedMealSubmissionSchema
} from "@omc/validators/nutrition";

import { protectedProcedure, publicProcedure } from "../trpc";
import {
  generateMealPlanWithGemini,
  getOrCreateRecipe
} from "../lib/nutrition-helpers";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Main procedure
export const nutritionRouter = {
  generateMealPlan: protectedProcedure
    .output(createSelectSchema(mealPlans))
    .mutation(async ({ ctx }) => {
      const userId = Number(ctx.session.user.id);

      // Check if user has already generated a meal plan for today
      const [existingMealPlan] = await ctx.db
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
        return existingMealPlan;
      }

      // Generate meal plan
      const genMealPlan = await generateMealPlanWithGemini();

      // Create meal plan entry
      const [dbMealPlan] = await ctx.db
        .insert(mealPlans)
        .values({
          userId,
          date: new Date().toISOString(),
          targetCalories: genMealPlan.targetCalories.toFixed(2),
          targetProtein: genMealPlan.targetProtein.toFixed(2),
          targetCarbs: genMealPlan.targetCarbs.toFixed(2),
          targetFats: genMealPlan.targetFat.toFixed(2),
        })
        .returning();

      if (!dbMealPlan) {
        throw new Error("Failed to insert meal plan");
      }

      // Get existing recipes for similarity check
      const existingRecipes = await ctx.db.select().from(recipes).execute();

      // Process each meal
      await Promise.all(
        genMealPlan.meals.map(async (meal) => {
          // Get or create recipe
          const recipe = await getOrCreateRecipe(ctx.s3, meal, existingRecipes);

          // Create meal schedule entry
          await ctx.db.insert(mealSchedule).values({
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
    .query(async ({ ctx, input }) => {
      // Fetch recipe details
      const [recipe] = await ctx.db
        .select()
        .from(recipes)
        .where(eq(recipes.id, input.id))
        .execute();

      if (!recipe) {
        throw new Error(`Recipe with ID ${input.id} not found`);
      }

      // Fetch ingredients
      const ingredients = await ctx.db
        .select()
        .from(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, input.id))
        .orderBy(recipeIngredients.orderIndex)
        .execute();

      // Fetch instructions
      const instructions = await ctx.db
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
    const dbRecipes = await ctx.db
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

    return dbRecipes;
  }),

  getTodaysMealPlan: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = Number(ctx.session.user.id);

      // Get today's meal plan
      const today = new Date().toISOString().split("T")[0];
      const [todaysMealPlan] = await ctx.db
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
      const scheduledMeals = await ctx.db
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
          const ingredients = await ctx.db
            .select()
            .from(recipeIngredients)
            .where(eq(recipeIngredients.recipeId, meal.recipe.id))
            .orderBy(recipeIngredients.orderIndex)
            .execute();

          const instructions = await ctx.db
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
    const dbMealPlans = await ctx.db
      .select({ id: mealPlans.id, date: mealPlans.date })
      .from(mealPlans)
      .where(eq(mealPlans.userId, userId));

    if (!dbMealPlans[0]) {
      throw new Error("No meal plans found for user");
    }
    const mealPlanIds = dbMealPlans.map((mealPlan) => mealPlan.id);

    const mealSchedules = await ctx.db
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
    .mutation(async ({ input, ctx }) => {
      // Get current meal schedule
      const [currentMeal] = await ctx.db
        .select()
        .from(mealSchedule)
        .where(eq(mealSchedule.id, input.mealScheduleId))
        .execute();

      if (!currentMeal) {
        throw new Error("Meal schedule not found");
      }

      // Toggle completion status
      const [updatedMeal] = await ctx.db
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
    .query(async ({ ctx }) => {
      const [dbUser] = await ctx.db
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

      const recentMeals = await ctx.db
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
    .mutation(async ({ input }) => {
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
        const [todaysMealPlan] = await ctx.db
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
        const [recipe] = await ctx.db
          .insert(recipes)
          .values({
            title: input.foodName,
            description: `Scanned meal: ${input.foodName}`,
            servings: 1,
            prepTimeMinutes: 5, // Default value for scanned meals
            calories: input.calories.toFixed(2),
            proteinGrams: input.protein.toFixed(2),
            carbsGrams: input.carbs.toFixed(2),
            fatsGrams: input.fats.toFixed(2),
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
          amount: ingredient.amount.toFixed(2),
          unit: ingredient.unit,
          orderIndex: index + 1,
        }));
        ctx.logger.info("Ingredients to insert", { ingredientsToInsert });

        await ctx.db.insert(recipeIngredients).values(ingredientsToInsert);

        // 4. Add instructions to recipe
        const instructionsToInsert = instructions.map((instruction) => ({
          recipeId: recipe.id,
          stepNumber: instruction.stepNumber,
          instruction: instruction.instruction,
        }));
        ctx.logger.info("Instructions to insert", { instructionsToInsert });

        await ctx.db.insert(recipeInstructions).values(instructionsToInsert);

        // 5. Add to user recipes
        await ctx.db
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
        const [existingMeal] = await ctx.db
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
          await ctx.db
            .update(mealSchedule)
            .set({
              recipeId: recipe.id,
              completed: true,
              completedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(mealSchedule.id, existingMeal.id));
        } else {
          // Create new meal schedule
          await ctx.db.insert(mealSchedule).values({
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
      const [currentStatus] = await ctx.db
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
        const [newEntry] = await ctx.db
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
      const [updatedEntry] = await ctx.db
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
        const [todaysMealPlan] = await ctx.db
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
        const [existingMeal] = await ctx.db
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
          await ctx.db
            .update(mealSchedule)
            .set({
              recipeId: input.recipeId,
              completed: true,
              completedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(mealSchedule.id, existingMeal.id));
        } else {
          // Create new meal schedule
          await ctx.db.insert(mealSchedule).values({
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
