import { z } from "zod";

/**
 * Recipe categories with their IDs
 */
export enum RECIPE_CATEGORIES {
  BREAKFAST = 1,
  LUNCH = 2,
  DINNER = 3,
  SNACKS = 4,
  DESSERTS = 5,
  SMOOTHIES = 6,
  HIGH_PROTEIN = 7,
  LOW_CARB = 8,
}

/**
 * Type definition for meal type entries
 */
export interface MealTypeEntry {
  label: string;
  value: string;
  categoryId: RECIPE_CATEGORIES;
}

/**
 * Meal types with their labels and category mappings
 */
export const MEAL_TYPES: readonly MealTypeEntry[] = [
  { label: "Breakfast", value: "breakfast", categoryId: RECIPE_CATEGORIES.BREAKFAST },
  { label: "Lunch", value: "lunch", categoryId: RECIPE_CATEGORIES.LUNCH },
  { label: "Dinner", value: "dinner", categoryId: RECIPE_CATEGORIES.DINNER },
  { label: "Snack", value: "snack", categoryId: RECIPE_CATEGORIES.SNACKS },
  { label: "Dessert", value: "dessert", categoryId: RECIPE_CATEGORIES.DESSERTS },
  { label: "Smoothie", value: "smoothie", categoryId: RECIPE_CATEGORIES.SMOOTHIES },
  { label: "High Protein", value: "high-protein", categoryId: RECIPE_CATEGORIES.HIGH_PROTEIN },
  { label: "Low Carb", value: "low-carb", categoryId: RECIPE_CATEGORIES.LOW_CARB },
] as const;

/**
 * Type for valid meal type values
 */
export type MealTypeValue = typeof MEAL_TYPES[number]['value'];

export type MealTypeLabel = typeof MEAL_TYPES[number]['label'];

/**
 * Mapping of meal types to category IDs
 */
export const MEAL_TYPE_TO_CATEGORY: Record<MealTypeValue, RECIPE_CATEGORIES> = Object.fromEntries(
  MEAL_TYPES.map(type => [type.value, type.categoryId])
) as Record<MealTypeValue, RECIPE_CATEGORIES>;

/**
 * Schema for recipe ingredients
 */
export const ingredientSchema = z.object({
  name: z.string(),
  amount: z.number(),
  unit: z.string(),
});

/**
 * Schema for recipe instructions
 */
export const instructionSchema = z.object({
  stepNumber: z.number(),
  instruction: z.string(),
});

/**
 * Schema for a meal in a meal plan
 */
export const mealSchema = z.object({
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

/**
 * Schema for recipe details
 */
export const recipeSchema = z.object({
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

/**
 * Schema for a complete meal plan
 */
export const mealPlanSchema = z.object({
  meals: z.array(mealSchema),
  targetCalories: z.number(),
  targetProtein: z.number(),
  targetCarbs: z.number(),
  targetFat: z.number(),
});

/**
 * Schema for food analysis results
 */
export const foodAnalysisSchema = z.object({
  foodName: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fats: z.number(),
  servingSize: z.string().optional(),
  assumptions: z.string().optional(),
  instructions: z.array(instructionSchema).optional(),
  ingredients: z.array(ingredientSchema).optional(),
});

/**
 * Schema for meal log entries
 */
export const mealLogSchema = z.object({
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

/**
 * Schema for submitting scanned meals
 */
export const scannedMealSubmissionSchema = z.object({
  foodName: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fats: z.number(),
  imageKey: z.string().optional(),
  imageBase64: z.string().optional(),
  mealType: z.string(),
  categoryId: z.number().optional(),
  ingredients: z.array(ingredientSchema).default([]),
  instructions: z.array(instructionSchema).default([]),
});

// Types derived from schemas
export type Ingredient = z.infer<typeof ingredientSchema>;
export type Instruction = z.infer<typeof instructionSchema>;
export type Meal = z.infer<typeof mealSchema>;
export type Recipe = z.infer<typeof recipeSchema>;
export type MealPlan = z.infer<typeof mealPlanSchema>;
export type FoodAnalysis = z.infer<typeof foodAnalysisSchema>;
export type MealLog = z.infer<typeof mealLogSchema>;
export type ScannedMealSubmission = z.infer<typeof scannedMealSubmissionSchema>; 