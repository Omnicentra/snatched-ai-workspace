import { db } from "../client";
import { recipes, recipeCategories, recipeIngredients, recipeInstructions } from "../schema";
import { eq } from "drizzle-orm";
export async function seedMoreRecipes() {
  console.log("Seeding additional recipes...");

  // Get category IDs
  const categories = await db.select().from(recipeCategories).execute();
  const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]));

  // Dinner Recipes
  const dinnerRecipes = [
    {
      title: "Grilled Salmon",
      description: "Perfectly grilled salmon with vegetables and herbs",
      servings: 1,
      prepTimeMinutes: 20,
      calories: 500,
      proteinGrams: 35,
      carbsGrams: 30,
      fatsGrams: 25,
      imageUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewCount: 180,
      categoryId: categoryMap.get("Dinner"),
      ingredients: [
        { name: "Salmon fillet", amount: 6, unit: "oz", orderIndex: 1 },
        { name: "Asparagus", amount: 1, unit: "cup", orderIndex: 2 },
        { name: "Cherry tomatoes", amount: 0.5, unit: "cup", orderIndex: 3 },
        { name: "Brown rice", amount: 0.5, unit: "cup", orderIndex: 4 },
        { name: "Olive oil", amount: 1, unit: "tbsp", orderIndex: 5 },
        { name: "Lemon", amount: 0.5, unit: "medium", orderIndex: 6 },
        { name: "Dill", amount: 1, unit: "tbsp", orderIndex: 7 },
        { name: "Garlic", amount: 1, unit: "clove", orderIndex: 8 }
      ],
      instructions: [
        { stepNumber: 1, instruction: "Preheat grill to medium-high heat" },
        { stepNumber: 2, instruction: "Rub salmon with olive oil, minced garlic, salt, and pepper" },
        { stepNumber: 3, instruction: "Grill salmon skin-side down for 4-5 minutes, then flip and cook for another 3-4 minutes" },
        { stepNumber: 4, instruction: "Toss asparagus and tomatoes with olive oil, salt, and pepper and grill for 3-4 minutes" },
        { stepNumber: 5, instruction: "Cook brown rice according to package instructions" },
        { stepNumber: 6, instruction: "Serve salmon over rice with vegetables, garnish with fresh dill and lemon wedges" }
      ]
    },
    {
      title: "Turkey Chili",
      description: "Hearty and nutritious turkey chili with beans",
      servings: 2,
      prepTimeMinutes: 30,
      calories: 420,
      proteinGrams: 32,
      carbsGrams: 38,
      fatsGrams: 14,
      imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 130,
      categoryId: categoryMap.get("Dinner"),
      ingredients: [
        { name: "Ground turkey", amount: 6, unit: "oz", orderIndex: 1 },
        { name: "Onion", amount: 0.5, unit: "medium", orderIndex: 2 },
        { name: "Bell pepper", amount: 0.5, unit: "medium", orderIndex: 3 },
        { name: "Kidney beans", amount: 0.5, unit: "cup", orderIndex: 4 },
        { name: "Black beans", amount: 0.5, unit: "cup", orderIndex: 5 },
        { name: "Diced tomatoes", amount: 1, unit: "cup", orderIndex: 6 },
        { name: "Chili powder", amount: 1, unit: "tbsp", orderIndex: 7 },
        { name: "Cumin", amount: 1, unit: "tsp", orderIndex: 8 },
        { name: "Greek yogurt", amount: 2, unit: "tbsp", orderIndex: 9 }
      ],
      instructions: [
        { stepNumber: 1, instruction: "In a large pot, cook ground turkey until browned" },
        { stepNumber: 2, instruction: "Add diced onion and bell pepper, cook until softened" },
        { stepNumber: 3, instruction: "Stir in drained beans, diced tomatoes, chili powder, and cumin" },
        { stepNumber: 4, instruction: "Simmer for 20 minutes, stirring occasionally" },
        { stepNumber: 5, instruction: "Serve topped with a dollop of Greek yogurt" }
      ]
    },
    {
      title: "Vegetable Stir Fry",
      description: "Quick and colorful vegetable stir fry with tofu",
      servings: 1,
      prepTimeMinutes: 20,
      calories: 380,
      proteinGrams: 25,
      carbsGrams: 42,
      fatsGrams: 12,
      imageUrl: "https://images.unsplash.com/photo-1512003867696-6d5ce6835040?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.5,
      reviewCount: 95,
      categoryId: categoryMap.get("Dinner"),
      ingredients: [
        { name: "Firm tofu", amount: 4, unit: "oz", orderIndex: 1 },
        { name: "Broccoli", amount: 1, unit: "cup", orderIndex: 2 },
        { name: "Carrot", amount: 1, unit: "medium", orderIndex: 3 },
        { name: "Snow peas", amount: 0.5, unit: "cup", orderIndex: 4 },
        { name: "Bell pepper", amount: 0.5, unit: "medium", orderIndex: 5 },
        { name: "Brown rice", amount: 0.5, unit: "cup", orderIndex: 6 },
        { name: "Sesame oil", amount: 1, unit: "tsp", orderIndex: 7 },
        { name: "Soy sauce", amount: 1, unit: "tbsp", orderIndex: 8 },
        { name: "Ginger", amount: 1, unit: "tsp", orderIndex: 9 },
        { name: "Garlic", amount: 1, unit: "clove", orderIndex: 10 }
      ],
      instructions: [
        { stepNumber: 1, instruction: "Press tofu to remove excess water, then cube it" },
        { stepNumber: 2, instruction: "Heat sesame oil in a wok or large pan" },
        { stepNumber: 3, instruction: "Cook tofu until golden, remove from pan" },
        { stepNumber: 4, instruction: "Add minced garlic and ginger to the pan, stir for 30 seconds" },
        { stepNumber: 5, instruction: "Add vegetables and stir-fry until crisp-tender" },
        { stepNumber: 6, instruction: "Return tofu to pan, add soy sauce and stir to combine" },
        { stepNumber: 7, instruction: "Serve over cooked brown rice" }
      ]
    }
  ];

  // Snack Recipes
  const snackRecipes = [
    {
      title: "Berry Protein Bowl",
      description: "Quick protein bowl with berries and seeds",
      servings: 1,
      prepTimeMinutes: 5,
      calories: 200,
      proteinGrams: 18,
      carbsGrams: 15,
      fatsGrams: 5,
      imageUrl: "https://images.unsplash.com/photo-1575224526797-5730d09d781d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.4,
      reviewCount: 65,
      categoryId: categoryMap.get("Snacks"),
      ingredients: [
        { name: "Protein powder", amount: 1, unit: "scoop", orderIndex: 1 },
        { name: "Greek yogurt", amount: 0.5, unit: "cup", orderIndex: 2 },
        { name: "Mixed berries", amount: 0.5, unit: "cup", orderIndex: 3 },
        { name: "Chia seeds", amount: 1, unit: "tsp", orderIndex: 4 },
        { name: "Hemp hearts", amount: 1, unit: "tsp", orderIndex: 5 }
      ],
      instructions: [
        { stepNumber: 1, instruction: "Mix protein powder with Greek yogurt until smooth" },
        { stepNumber: 2, instruction: "Top with berries, chia seeds, and hemp hearts" },
        { stepNumber: 3, instruction: "Enjoy immediately or refrigerate for up to 1 day" }
      ]
    },
    {
      title: "Hummus and Veggies",
      description: "Hummus with fresh vegetables for dipping",
      servings: 1,
      prepTimeMinutes: 5,
      calories: 180,
      proteinGrams: 8,
      carbsGrams: 20,
      fatsGrams: 8,
      imageUrl: "https://images.unsplash.com/photo-1580223530509-849e0c4c4ac6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.3,
      reviewCount: 55,
      categoryId: categoryMap.get("Snacks"),
      ingredients: [
        { name: "Hummus", amount: 0.25, unit: "cup", orderIndex: 1 },
        { name: "Carrot sticks", amount: 0.5, unit: "cup", orderIndex: 2 },
        { name: "Cucumber", amount: 0.5, unit: "medium", orderIndex: 3 },
        { name: "Bell pepper strips", amount: 0.5, unit: "cup", orderIndex: 4 },
        { name: "Cherry tomatoes", amount: 5, unit: "pieces", orderIndex: 5 }
      ],
      instructions: [
        { stepNumber: 1, instruction: "Cut vegetables into sticks or bite-sized pieces" },
        { stepNumber: 2, instruction: "Place hummus in a small bowl for dipping" },
        { stepNumber: 3, instruction: "Arrange vegetables around the hummus bowl" }
      ]
    },
    {
      title: "Protein Energy Balls",
      description: "No-bake protein energy balls for a quick snack",
      servings: 10,
      prepTimeMinutes: 15,
      calories: 120,
      proteinGrams: 5,
      carbsGrams: 12,
      fatsGrams: 7,
      imageUrl: "https://images.unsplash.com/photo-1582284540998-d894d3da3adf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 110,
      categoryId: categoryMap.get("Snacks"),
      ingredients: [
        { name: "Oats", amount: 1, unit: "cup", orderIndex: 1 },
        { name: "Almond butter", amount: 0.5, unit: "cup", orderIndex: 2 },
        { name: "Honey", amount: 2, unit: "tbsp", orderIndex: 3 },
        { name: "Protein powder", amount: 2, unit: "scoop", orderIndex: 4 },
        { name: "Chia seeds", amount: 2, unit: "tbsp", orderIndex: 5 },
        { name: "Dark chocolate chips", amount: 0.25, unit: "cup", orderIndex: 6 }
      ],
      instructions: [
        { stepNumber: 1, instruction: "Combine all ingredients in a large bowl and mix well" },
        { stepNumber: 2, instruction: "Roll mixture into 1-inch balls" },
        { stepNumber: 3, instruction: "Refrigerate for at least 30 minutes before serving" },
        { stepNumber: 4, instruction: "Store in an airtight container in the refrigerator for up to 1 week" }
      ]
    }
  ];

  const allRecipes = [...dinnerRecipes, ...snackRecipes];
  
  for (const recipeData of allRecipes) {
    const { ingredients, instructions, ...recipe } = recipeData;

    // Check if recipe already exists
    const existingRecipe = await db.select().from(recipes).where(eq(recipes.title, recipe.title)).execute();
    
    if (existingRecipe.length > 0) {
      console.log(`Recipe ${recipe.title} already exists, skipping...`);
      continue;
    }
    
    // Insert recipe
    const [insertedRecipe] = await db.insert(recipes).values({
        ...recipe,
        rating: recipe.rating.toFixed(1),
    }).returning({
      id: recipes.id,
    });

    if (!insertedRecipe) {
      console.error(`Failed to insert recipe ${recipe.title}`);
      continue;
    }
    
    // Insert ingredients
    for (const ingredient of ingredients) {
      await db.insert(recipeIngredients).values({
        ingredientName: ingredient.name,
        amount: ingredient.amount.toFixed(2),
        unit: ingredient.unit,
        orderIndex: ingredient.orderIndex,
        recipeId: insertedRecipe.id,
      });
    }
    
    // Insert instructions
    for (const instruction of instructions) {
      await db.insert(recipeInstructions).values({
        ...instruction,
        recipeId: insertedRecipe.id,
      });
    }
  }
  
  console.log(`Inserted ${allRecipes.length} additional recipes`);
} 