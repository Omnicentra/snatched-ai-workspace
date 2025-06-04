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
      id: 1,
      name: "Breakfast",
      description: "Nutritious breakfast options to start your day right",
    },
    {
      id: 2,
      name: "Lunch",
      description: "Balanced lunch meals to keep you energized throughout the day",
    },
    {
      id: 3,
      name: "Dinner",
      description: "Healthy dinner options to complete your day",
    },
    {
      id: 4,
      name: "Snack",
      description: "Healthy snacks and small bites between meals",
    },
    {
      id: 5,
      name: "Dessert",
      description: "Healthier dessert options for occasional treats",
    },
    {
      id: 6,
      name: "Smoothie",
      description: "Nutritious and delicious smoothies and drinks",
    },
    {
      id: 7,
      name: "High Protein",
      description: "Meals focused on high protein content for muscle building",
    },
    {
      id: 8,
      name: "Low Carb",
      description: "Meals with low carbohydrate content",
    },
  ];

  await db.insert(recipeCategories).values(categories);
  console.log(`Inserted ${categories.length} recipe categories`);
} 