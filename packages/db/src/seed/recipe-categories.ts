import { db } from "../client";
import { recipeCategories } from "../schema";

export async function seedRecipeCategories() {
  const existingCategories = await db.select().from(recipeCategories).execute();
  
  if (existingCategories.length > 0) {
    console.log("Recipe categories already seeded, skipping...");
    return;
  }

  console.log("Seeding recipe categories...");

  const categories = [
    {
      name: "Breakfast",
      description: "Nutritious breakfast options to start your day right",
    },
    {
      name: "Lunch",
      description: "Balanced lunch meals to keep you energized throughout the day",
    },
    {
      name: "Dinner",
      description: "Healthy dinner options to complete your day",
    },
    {
      name: "Snacks",
      description: "Healthy snacks and small bites between meals",
    },
    {
      name: "Desserts",
      description: "Healthier dessert options for occasional treats",
    },
    {
      name: "Smoothies",
      description: "Nutritious and delicious smoothies and drinks",
    },
    {
      name: "High Protein",
      description: "Meals focused on high protein content for muscle building",
    },
    {
      name: "Low Carb",
      description: "Meals with low carbohydrate content",
    },
  ];

  await db.insert(recipeCategories).values(categories);
  console.log(`Inserted ${categories.length} recipe categories`);
} 