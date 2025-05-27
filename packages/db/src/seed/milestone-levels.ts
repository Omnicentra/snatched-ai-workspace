import { db } from "../client";
import { milestoneLevels } from "../schema";
import { eq } from "drizzle-orm";

export const milestoneLevelsData = [
  {
    level: 1,
    totalDays: 7,
    emoji: "🌱", // Beginner
  },
  {
    level: 2,
    totalDays: 14,
    emoji: "🌿", // Growing
  },
  {
    level: 3,
    totalDays: 21,
    emoji: "🌳", // Established
  },
  {
    level: 4,
    totalDays: 30,
    emoji: "💪", // Strong
  },
  {
    level: 5,
    totalDays: 45,
    emoji: "🔥", // On Fire
  },
  {
    level: 6,
    totalDays: 60,
    emoji: "⚡️", // Lightning
  },
  {
    level: 7,
    totalDays: 90,
    emoji: "🏆", // Champion
  },
  {
    level: 8,
    totalDays: 120,
    emoji: "👑", // King/Queen
  },
  {
    level: 9,
    totalDays: 180,
    emoji: "🌟", // Superstar
  },
  {
    level: 10,
    totalDays: 240,
    emoji: "💫", // Legend
  },
];

export async function seedMilestoneLevels() {
  console.log("🌱 Seeding milestone levels...");

  try {
    // Insert levels one by one to handle unique constraint
    for (const level of milestoneLevelsData) {
      // Check if level already exists
      const existingLevel = await db.query.milestoneLevels.findFirst({
        where: eq(milestoneLevels.level, level.level),
      });

      if (existingLevel) {
        console.log(`⚠️ Milestone level ${level.level} (${level.emoji}) already exists, skipping`);
        continue;
      }

      await db.insert(milestoneLevels).values(level).onConflictDoNothing();
      console.log(`🌱 Milestone level ${level.level} (${level.emoji}) seeded`);
    }

    console.log("✅ Successfully seeded milestone levels");
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error seeding milestone levels:", error.message);
    } else {
      console.error("❌ Error seeding milestone levels:", String(error));
    }
    throw error;
  }
} 