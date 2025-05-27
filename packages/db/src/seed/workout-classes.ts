import { db } from '../client';
import { workoutClasses } from "../schema";
import { eq } from 'drizzle-orm';

export const workoutClassesData = [
  {
    id: 1,
    name: "Pilates",
    description: "Equipment-based and mat exercises focusing on core strength, flexibility, and overall body control.",
  },
  {
    id: 2,
    name: "Gym",
    description: "Workouts designed for a gym environment with access to various equipment and machines.",
  },
  {
    id: 3,
    name: "Home",
    description: "Exercises that can be performed at home with minimal or no equipment required.",
  },
];

export async function seedWorkoutClasses() {
  console.log("🏋️‍♂️ Seeding workout classes...");

  try {
    // Insert classes one by one to handle unique constraint
    for (const workoutClass of workoutClassesData) {
      // Check if class already exists
      const existingClass = await db.query.workoutClasses.findFirst({
        where: eq(workoutClasses.name, workoutClass.name),
      });
      
      if (existingClass) {
        console.log(`⚠️ Workout class "${workoutClass.name}" already exists, skipping seeding`);
        continue;
      }
      
      await db.insert(workoutClasses).values(workoutClass).onConflictDoNothing();
      console.log(`🌱 Workout class "${workoutClass.name}" seeded`);
    }

    console.log("✅ Successfully seeded workout classes");
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error seeding workout classes:", error.message);
    } else {
      console.error("❌ Error seeding workout classes:", String(error));
    }
    throw error;
  }
} 