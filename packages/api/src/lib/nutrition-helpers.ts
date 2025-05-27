import type { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { GoogleGenAI, Type } from "@google/genai";
import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { slugify } from "@omc/validators";
import type { Meal, MealPlan } from "@omc/validators/nutrition";
import { db } from "@omc/db/client";
import { recipeIngredients, recipeInstructions, recipes } from "@omc/db/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper function to generate and upload an image for a recipe
export const generateAndUploadImage = async (
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

export const createNewRecipe = async (s3: S3Client, meal: Meal) => {
  const imageUrl = await generateAndUploadImage(s3, meal.name);

  // Insert recipe
  const [recipe] = await db
    .insert(recipes)
    .values({
      title: meal.name,
      description: `A ${meal.name} recipe`,
      servings: 1,
      prepTimeMinutes: 30, // Default value
      calories: meal.calories.toFixed(2),
      proteinGrams: meal.protein.toFixed(2),
      carbsGrams: meal.carbs.toFixed(2),
      fatsGrams: meal.fat.toFixed(2),
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
export async function generateMealPlanWithGemini(): Promise<MealPlan> {
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
export async function findSimilarRecipe(
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
export async function getOrCreateRecipe(
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