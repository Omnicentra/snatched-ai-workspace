import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { GoogleGenAI, Type } from "@google/genai";
import { db } from "@omc/db/client";
import { recipes, recipeIngredients, recipeInstructions } from "@omc/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

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
  time: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  name: z.string(),
  ingredients: z.array(ingredientSchema),
  instructions: z.array(instructionSchema),
});

type Meal = z.infer<typeof mealSchema>;

// TODO: Take diet into consideration
export const nutritionRouter = {
  getDailyMeals: publicProcedure
    .output(z.array(mealSchema.extend({ id: z.number() })))
    .query(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Generate a daily meal plan with breakfast, lunch, and dinner. For each meal, provide: time, calories, protein (g), carbs (g), fat (g), meal name, ingredients list (with amounts and units), and step-by-step cooking instructions. Make it realistic and healthy.",
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
                name: { type: Type.STRING },
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      unit: { type: Type.STRING }
                    },
                    required: ['name', 'amount', 'unit']
                  }
                },
                instructions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.NUMBER },
                      instruction: { type: Type.STRING }
                    },
                    required: ['stepNumber', 'instruction']
                  }
                }
              },
              required: ['time', 'calories', 'protein', 'carbs', 'fat', 'name', 'ingredients', 'instructions']
            }
          }
        }
      });

      if (!response.text) {
        throw new Error("No response from Gemini");
      }

      const meals = JSON.parse(response.text) as Meal[];

      // Insert meals into database and return with IDs
      const mealsWithIds = await Promise.all(
        meals.map(async (meal) => {
          // Insert recipe
          const [recipe] = await db.insert(recipes).values({
            title: meal.name,
            description: `A ${meal.name} recipe`,
            servings: 1,
            prepTimeMinutes: 30, // Default value
            calories: meal.calories,
            proteinGrams: meal.protein,
            carbsGrams: meal.carbs,
            fatsGrams: meal.fat,
          }).returning({ id: recipes.id });

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
              })
            )
          );

          // Insert instructions
          await Promise.all(
            meal.instructions.map((instruction) =>
              db.insert(recipeInstructions).values({
                recipeId: recipe.id,
                stepNumber: instruction.stepNumber,
                instruction: instruction.instruction,
              })
            )
          );

          return {
            ...meal,
            id: recipe.id,
          };
        })
      );

      return mealsWithIds;
    }),
} satisfies TRPCRouterRecord;
