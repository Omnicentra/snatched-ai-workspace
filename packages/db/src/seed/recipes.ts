import { db } from "../client";
import { recipes, recipeCategories, recipeIngredients, recipeInstructions } from "../schema";
import { eq } from "drizzle-orm";

export async function seedRecipes() {
  console.log("Seeding recipes...");

  // Get category IDs
  const categories = await db.select().from(recipeCategories).execute();
  const categoryMap = new Map(categories.map(cat => [cat.name, cat.id]));

  // Breakfast Recipes
  const breakfastRecipes = [
    {
      title: "Oatmeal with Banana and Almond Butter",
      description: "Nutritious oatmeal with fruits and nuts to start your day",
      servings: 1,
      prepTimeMinutes: 10,
      calories: 350,
      proteinGrams: 15,
      carbsGrams: 45,
      fatsGrams: 8,
      imageUrl: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.5,
      reviewCount: 120,
      categoryId: categoryMap.get("Breakfast"),
      ingredients: [
        { name: "Rolled oats", amount: 0.5, unit: "cup", orderIndex: 1 },
        { name: "Almond milk", amount: 1, unit: "cup", orderIndex: 2 },
        { name: "Banana", amount: 1, unit: "medium", orderIndex: 3 },
        { name: "Blueberries", amount: 0.25, unit: "cup", orderIndex: 4 },
        { name: "Almonds", amount: 1, unit: "tbsp", orderIndex: 5 },
        { name: "Honey", amount: 1, unit: "tsp", orderIndex: 6 }
      ],
      instructions: [
        { stepNumber: 1, instruction: "Combine oats and almond milk in a microwave-safe bowl" },
        { stepNumber: 2, instruction: "Microwave for 2 minutes, stir, then microwave for another minute" },
        { stepNumber: 3, instruction: "Top with sliced banana, blueberries, almonds and a drizzle of honey" }
      ]
    },
    {
      title: "Avocado Toast",
      description: "Classic avocado toast with a protein boost from eggs",
      servings: 1,
      prepTimeMinutes: 15,
      calories: 320,
      proteinGrams: 14,
      carbsGrams: 30,
      fatsGrams: 18,
      imageUrl: "https://images.unsplash.com/photo-1588137378633-dea1288d6dce?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 150,
      categoryId: categoryMap.get("Breakfast"),
      ingredients: [
        { name: "Whole grain bread", amount: 1, unit: "slice", orderIndex: 1 },
        { name: "Avocado", amount: 0.5, unit: "medium", orderIndex: 2 },
        { name: "Egg", amount: 1, unit: "large", orderIndex: 3 },
        { name: "Cherry tomatoes", amount: 4, unit: "pieces", orderIndex: 4 },
        { name: "Lemon juice", amount: 0.5, unit: "tsp", orderIndex: 5 },
        { name: "Red pepper flakes", amount: 0.25, unit: "tsp", orderIndex: 6 }
      ],
      instructions: [
        { stepNumber: 1, instruction: "Toast the bread until golden and crispy" },
        { stepNumber: 2, instruction: "Mash the avocado with lemon juice and spread on toast" },
        { stepNumber: 3, instruction: "Fry the egg sunny-side up or to your preference" },
        { stepNumber: 4, instruction: "Place egg on top of avocado, add sliced tomatoes and sprinkle with red pepper flakes" }
      ]
    },
    {
      title: "Greek Yogurt Parfait",
      description: "Protein-rich yogurt parfait with berries and granola",
      servings: 1,
      prepTimeMinutes: 5,
      calories: 280,
      proteinGrams: 18,
      carbsGrams: 32,
      fatsGrams: 9,
      imageUrl: "https://images.unsplash.com/photo-1488477304112-4944851de03d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 95,
      categoryId: categoryMap.get("Breakfast"),
      ingredients: [
        { name: "Greek yogurt", amount: 1, unit: "cup", orderIndex: 1 },
        { name: "Mixed berries", amount: 0.5, unit: "cup", orderIndex: 2 },
        { name: "Granola", amount: 0.25, unit: "cup", orderIndex: 3 },
        { name: "Honey", amount: 1, unit: "tsp", orderIndex: 4 },
        { name: "Chia seeds", amount: 1, unit: "tsp", orderIndex: 5 }
      ],
      instructions: [
        { stepNumber: 1, instruction: "Layer half of the yogurt at the bottom of a glass or bowl" },
        { stepNumber: 2, instruction: "Add a layer of berries and granola" },
        { stepNumber: 3, instruction: "Add the remaining yogurt and top with more berries, granola, honey, and chia seeds" }
      ]
    }
  ];

  // Lunch Recipes
  const lunchRecipes = [
    {
      title: "Mediterranean Salad",
      description: "Fresh Mediterranean salad with chickpeas and feta cheese",
      servings: 1,
      prepTimeMinutes: 15,
      calories: 450,
      proteinGrams: 35,
      carbsGrams: 25,
      fatsGrams: 20,
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
      reviewCount: 110,
      categoryId: categoryMap.get("Lunch"),
      ingredients: [
        { name: "Mixed greens", amount: 2, unit: "cups", orderIndex: 1 },
        { name: "Cherry tomatoes", amount: 0.5, unit: "cup", orderIndex: 2 },
        { name: "Cucumber", amount: 0.5, unit: "medium", orderIndex: 3 },
        { name: "Red onion", amount: 0.25, unit: "medium", orderIndex: 4 },
        { name: "Chickpeas", amount: 0.5, unit: "cup", orderIndex: 5 },
        { name: "Feta cheese", amount: 0.25, unit: "cup", orderIndex: 6 },
        { name: "Kalamata olives", amount: 6, unit: "pieces", orderIndex: 7 },
        { name: "Olive oil", amount: 1, unit: "tbsp", orderIndex: 8 },
        { name: "Lemon juice", amount: 1, unit: "tbsp", orderIndex: 9 }
      ],
      instructions: [
        { stepNumber: 1, instruction: "Combine mixed greens, halved cherry tomatoes, diced cucumber, and thinly sliced red onion in a bowl" },
        { stepNumber: 2, instruction: "Add drained chickpeas, crumbled feta cheese, and olives" },
        { stepNumber: 3, instruction: "Drizzle with olive oil and lemon juice, toss gently to combine" },
        { stepNumber: 4, instruction: "Season with salt and pepper to taste" }
      ]
    },
    {
      title: "Quinoa Bowl",
      description: "Protein-packed quinoa bowl with roasted vegetables",
      servings: 1,
      prepTimeMinutes: 25,
      calories: 420,
      proteinGrams: 28,
      carbsGrams: 40,
      fatsGrams: 16,
      imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.5,
      reviewCount: 88,
      categoryId: categoryMap.get("Lunch"),
      ingredients: [
        { name: "Quinoa", amount: 0.5, unit: "cup", orderIndex: 1 },
        { name: "Chicken breast", amount: 4, unit: "oz", orderIndex: 2 },
        { name: "Sweet potato", amount: 0.5, unit: "medium", orderIndex: 3 },
        { name: "Bell pepper", amount: 0.5, unit: "medium", orderIndex: 4 },
        { name: "Broccoli", amount: 1, unit: "cup", orderIndex: 5 },
        { name: "Olive oil", amount: 1, unit: "tbsp", orderIndex: 6 },
        { name: "Lemon juice", amount: 1, unit: "tbsp", orderIndex: 7 },
        { name: "Tahini", amount: 1, unit: "tbsp", orderIndex: 8 }
      ],
      instructions: [
        { stepNumber: 1, instruction: "Cook quinoa according to package instructions" },
        { stepNumber: 2, instruction: "Season chicken with salt and pepper, cook in a pan until done" },
        { stepNumber: 3, instruction: "Roast diced sweet potato, bell pepper, and broccoli at 400°F for 20 minutes" },
        { stepNumber: 4, instruction: "Combine quinoa, sliced chicken, and roasted vegetables in a bowl" },
        { stepNumber: 5, instruction: "Mix olive oil, lemon juice, and tahini for dressing and drizzle over bowl" }
      ]
    },
    {
      title: "Tuna Wrap",
      description: "Quick and protein-rich tuna wrap with vegetables",
      servings: 1,
      prepTimeMinutes: 10,
      calories: 380,
      proteinGrams: 30,
      carbsGrams: 35,
      fatsGrams: 15,
      imageUrl: "https://images.unsplash.com/photo-1553909489-cd47e0907980?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.3,
      reviewCount: 75,
      categoryId: categoryMap.get("Lunch"),
      ingredients: [
        { name: "Whole wheat wrap", amount: 1, unit: "large", orderIndex: 1 },
        { name: "Canned tuna", amount: 3, unit: "oz", orderIndex: 2 },
        { name: "Greek yogurt", amount: 2, unit: "tbsp", orderIndex: 3 },
        { name: "Dijon mustard", amount: 1, unit: "tsp", orderIndex: 4 },
        { name: "Mixed greens", amount: 1, unit: "cup", orderIndex: 5 },
        { name: "Cucumber", amount: 0.25, unit: "medium", orderIndex: 6 },
        { name: "Carrot", amount: 0.5, unit: "medium", orderIndex: 7 },
        { name: "Lemon juice", amount: 0.5, unit: "tsp", orderIndex: 8 }
      ],
      instructions: [
        { stepNumber: 1, instruction: "Mix tuna with Greek yogurt, mustard, and lemon juice" },
        { stepNumber: 2, instruction: "Lay wrap flat and add mixed greens, sliced cucumber, and grated carrot" },
        { stepNumber: 3, instruction: "Spread tuna mixture on top of vegetables" },
        { stepNumber: 4, instruction: "Roll wrap tightly and cut in half diagonally" }
      ]
    }
  ];

  // Will add dinner and other recipes in another function to keep the file size manageable
  const allRecipes = [...breakfastRecipes, ...lunchRecipes];
  
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
        calories: recipe.calories,
        carbsGrams: recipe.carbsGrams,
        categoryId: recipe.categoryId,
        description: recipe.description,
        fatsGrams: recipe.fatsGrams,
        imageUrl: recipe.imageUrl,
        proteinGrams: recipe.proteinGrams,
        reviewCount: recipe.reviewCount,
        servings: recipe.servings,
        title: recipe.title,
        prepTimeMinutes: recipe.prepTimeMinutes,
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
  
  console.log(`Inserted ${allRecipes.length} recipes`);
} 