import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bodyMeasurements = pgTable(
  "body_measurements",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    measurementDate: date("measurement_date")
      .default(sql`CURRENT_DATE`)
      .notNull(),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_body_measurements_user_id_date").using(
      "btree",
      table.userId.asc().nullsLast().op("date_ops"),
      table.measurementDate.asc().nullsLast().op("date_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "body_measurements_user_id_fkey",
    }),
    check(
      "body_measurements_weight_kg_check",
      sql`weight_kg
      > (0)::numeric`,
    ),
  ],
);

export const fitnessBlockers = pgTable(
  "fitness_blockers",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    blockerType: varchar("blocker_type", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "fitness_blockers_user_id_fkey",
    }),
  ],
);

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    age: integer().notNull(),
    heightCm: integer("height_cm").notNull(),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }).notNull(),
    ethnicity: varchar({ length: 50 }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_users_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    check(
      "users_age_check",
      sql`age
      > 0`,
    ),
    check(
      "users_height_cm_check",
      sql`height_cm
      > 0`,
    ),
    check(
      "users_weight_kg_check",
      sql`weight_kg
      > (0)::numeric`,
    ),
  ],
);

export const foodCravings = pgTable(
  "food_cravings",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    cravingType: varchar("craving_type", { length: 50 }).notNull(),
    otherCravings: text("other_cravings"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "food_cravings_user_id_fkey",
    }),
  ],
);

export const previousExperiences = pgTable(
  "previous_experiences",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    experienceType: varchar("experience_type", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "previous_experiences_user_id_fkey",
    }),
  ],
);

export const workouts = pgTable(
  "workouts",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: varchar({ length: 100 }).notNull(),
    description: text(),
    durationMinutes: integer("duration_minutes").notNull(),
    difficultyLevel: varchar("difficulty_level", { length: 20 }).notNull(),
    caloriesBurn: integer("calories_burn"),
    rating: numeric({ precision: 2, scale: 1 }),
    imageUrl: text("image_url"),
    categoryId: uuid("category_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_workouts_category").using(
      "btree",
      table.categoryId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [workoutCategories.id],
      name: "workouts_category_id_fkey",
    }),
    check(
      "workouts_duration_minutes_check",
      sql`duration_minutes
      > 0`,
    ),
    check(
      "workouts_rating_check",
      sql`(rating >= (0):: numeric)
          AND (rating <= (5)::numeric)`,
    ),
  ],
);

export const healthConditions = pgTable(
  "health_conditions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    hasConditions: boolean("has_conditions").notNull(),
    conditionsDescription: text("conditions_description"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "health_conditions_user_id_fkey",
    }),
  ],
);

export const bodyConsiderations = pgTable(
  "body_considerations",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    considerationType: varchar("consideration_type", { length: 50 }).notNull(),
    customDescription: text("custom_description"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "body_considerations_user_id_fkey",
    }),
  ],
);

export const workoutCategories = pgTable(
  "workout_categories",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 50 }).notNull(),
    description: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [unique("workout_categories_name_key").on(table.name)],
);

export const userWorkoutProgress = pgTable(
  "user_workout_progress",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    workoutId: uuid("workout_id").notNull(),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    caloriesBurned: integer("calories_burned"),
    durationMinutes: integer("duration_minutes"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_user_workout_progress_user").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_workout_progress_user_id_fkey",
    }),
    foreignKey({
      columns: [table.workoutId],
      foreignColumns: [workouts.id],
      name: "user_workout_progress_workout_id_fkey",
    }),
  ],
);

export const fitnessGoals = pgTable(
  "fitness_goals",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    desiredShape: varchar("desired_shape", { length: 50 }).notNull(),
    timelineWeeks: integer("timeline_weeks").notNull(),
    bodyTonePreference: integer("body_tone_preference"),
    stylePreference: integer("style_preference"),
    bodyRatioPreference: numeric("body_ratio_preference", {
      precision: 3,
      scale: 2,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_fitness_goals_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "fitness_goals_user_id_fkey",
    }),
    check(
      "fitness_goals_timeline_weeks_check",
      sql`timeline_weeks
      > 0`,
    ),
    check(
      "fitness_goals_body_tone_preference_check",
      sql`(body_tone_preference >= 0)
          AND (body_tone_preference <= 100)`,
    ),
    check(
      "fitness_goals_style_preference_check",
      sql`(style_preference >= 0)
          AND (style_preference <= 100)`,
    ),
    check(
      "fitness_goals_body_ratio_preference_check",
      sql`(body_ratio_preference >= 0.65)
          AND (body_ratio_preference <= 0.85)`,
    ),
  ],
);

export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    workoutId: uuid("workout_id").notNull(),
    exerciseId: uuid("exercise_id").notNull(),
    sets: integer().notNull(),
    reps: integer().notNull(),
    restSeconds: integer("rest_seconds").notNull(),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_workout_exercises_workout").using(
      "btree",
      table.workoutId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.workoutId],
      foreignColumns: [workouts.id],
      name: "workout_exercises_workout_id_fkey",
    }),
    foreignKey({
      columns: [table.exerciseId],
      foreignColumns: [exercises.id],
      name: "workout_exercises_exercise_id_fkey",
    }),
    unique("workout_exercises_workout_id_order_index_key").on(
      table.workoutId,
      table.orderIndex,
    ),
    check(
      "workout_exercises_sets_check",
      sql`sets
      > 0`,
    ),
    check(
      "workout_exercises_reps_check",
      sql`reps
      > 0`,
    ),
    check(
      "workout_exercises_rest_seconds_check",
      sql`rest_seconds
      >= 0`,
    ),
  ],
);

export const exercises = pgTable("exercises", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  description: text(),
  targetMuscles: text("target_muscles"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`CURRENT_TIMESTAMP`),
});

export const recipeIngredients = pgTable(
  "recipe_ingredients",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    recipeId: uuid("recipe_id").notNull(),
    ingredientName: varchar("ingredient_name", { length: 100 }).notNull(),
    amount: numeric({ precision: 8, scale: 2 }).notNull(),
    unit: varchar({ length: 20 }).notNull(),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_recipe_ingredients_recipe").using(
      "btree",
      table.recipeId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.recipeId],
      foreignColumns: [recipes.id],
      name: "recipe_ingredients_recipe_id_fkey",
    }),
    unique("recipe_ingredients_recipe_id_order_index_key").on(
      table.recipeId,
      table.orderIndex,
    ),
    check(
      "recipe_ingredients_amount_check",
      sql`amount
      > (0)::numeric`,
    ),
  ],
);

export const mealSchedule = pgTable(
  "meal_schedule",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    mealPlanId: uuid("meal_plan_id").notNull(),
    recipeId: uuid("recipe_id").notNull(),
    mealType: varchar("meal_type", { length: 20 }).notNull(),
    scheduledTime: time("scheduled_time").notNull(),
    completed: boolean().default(false),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_meal_schedule_meal_plan").using(
      "btree",
      table.mealPlanId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.mealPlanId],
      foreignColumns: [mealPlans.id],
      name: "meal_schedule_meal_plan_id_fkey",
    }),
    foreignKey({
      columns: [table.recipeId],
      foreignColumns: [recipes.id],
      name: "meal_schedule_recipe_id_fkey",
    }),
  ],
);

export const userMilestoneProgress = pgTable(
  "user_milestone_progress",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    levelId: uuid("level_id").notNull(),
    currentDay: integer("current_day").notNull(),
    completed: boolean().default(false),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_user_milestone_progress_user").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_milestone_progress_user_id_fkey",
    }),
    foreignKey({
      columns: [table.levelId],
      foreignColumns: [milestoneLevels.id],
      name: "user_milestone_progress_level_id_fkey",
    }),
    check(
      "user_milestone_progress_current_day_check",
      sql`current_day
      > 0`,
    ),
  ],
);

export const milestoneLevels = pgTable(
  "milestone_levels",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    level: integer().notNull(),
    totalDays: integer("total_days").notNull(),
    emoji: varchar({ length: 10 }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    unique("milestone_levels_level_key").on(table.level),
    check(
      "milestone_levels_level_check",
      sql`level
      > 0`,
    ),
    check(
      "milestone_levels_total_days_check",
      sql`total_days
      > 0`,
    ),
  ],
);

export const mealPlans = pgTable(
  "meal_plans",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    date: date().notNull(),
    targetCalories: integer("target_calories").notNull(),
    targetProtein: integer("target_protein").notNull(),
    targetCarbs: integer("target_carbs").notNull(),
    targetFats: integer("target_fats").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_meal_plans_user_date").using(
      "btree",
      table.userId.asc().nullsLast().op("date_ops"),
      table.date.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "meal_plans_user_id_fkey",
    }),
    unique("meal_plans_user_id_date_key").on(table.userId, table.date),
    check(
      "meal_plans_target_calories_check",
      sql`target_calories
      > 0`,
    ),
    check(
      "meal_plans_target_protein_check",
      sql`target_protein
      > 0`,
    ),
    check(
      "meal_plans_target_carbs_check",
      sql`target_carbs
      > 0`,
    ),
    check(
      "meal_plans_target_fats_check",
      sql`target_fats
      > 0`,
    ),
  ],
);

export const recipeInstructions = pgTable(
  "recipe_instructions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    recipeId: uuid("recipe_id").notNull(),
    stepNumber: integer("step_number").notNull(),
    instruction: text().notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_recipe_instructions_recipe").using(
      "btree",
      table.recipeId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.recipeId],
      foreignColumns: [recipes.id],
      name: "recipe_instructions_recipe_id_fkey",
    }),
    unique("recipe_instructions_recipe_id_step_number_key").on(
      table.recipeId,
      table.stepNumber,
    ),
    check(
      "recipe_instructions_step_number_check",
      sql`step_number
      > 0`,
    ),
  ],
);

export const userRecipes = pgTable(
  "user_recipes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    recipeId: uuid("recipe_id").notNull(),
    isFavorite: boolean("is_favorite").default(false),
    personalNotes: text("personal_notes"),
    servingSizeOverride: integer("serving_size_override"),
    lastCookedAt: timestamp("last_cooked_at", {
      withTimezone: true,
      mode: "string",
    }),
    rating: integer(),
    customizations: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_user_recipes_favorite")
      .using(
        "btree",
        table.userId.asc().nullsLast().op("bool_ops"),
        table.isFavorite.asc().nullsLast().op("uuid_ops"),
      )
      .where(sql`(is_favorite = true)`),
    index("idx_user_recipes_recipe").using(
      "btree",
      table.recipeId.asc().nullsLast().op("uuid_ops"),
    ),
    index("idx_user_recipes_user").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_recipes_user_id_fkey",
    }),
    foreignKey({
      columns: [table.recipeId],
      foreignColumns: [recipes.id],
      name: "user_recipes_recipe_id_fkey",
    }),
    unique("user_recipes_user_id_recipe_id_key").on(
      table.userId,
      table.recipeId,
    ),
    check(
      "user_recipes_rating_check",
      sql`(rating >= 1)
          AND (rating <= 5)`,
    ),
  ],
);

export const recipes = pgTable(
  "recipes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: varchar({ length: 100 }).notNull(),
    description: text(),
    servings: integer().notNull(),
    prepTimeMinutes: integer("prep_time_minutes"),
    calories: integer().notNull(),
    proteinGrams: integer("protein_grams").notNull(),
    carbsGrams: integer("carbs_grams").notNull(),
    fatsGrams: integer("fats_grams").notNull(),
    imageUrl: text("image_url"),
    rating: numeric({ precision: 2, scale: 1 }),
    reviewCount: integer("review_count").default(0),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    check(
      "recipes_servings_check",
      sql`servings
      > 0`,
    ),
    check(
      "recipes_prep_time_minutes_check",
      sql`prep_time_minutes
      > 0`,
    ),
    check(
      "recipes_calories_check",
      sql`calories
      > 0`,
    ),
    check(
      "recipes_protein_grams_check",
      sql`protein_grams
      >= 0`,
    ),
    check(
      "recipes_carbs_grams_check",
      sql`carbs_grams
      >= 0`,
    ),
    check(
      "recipes_fats_grams_check",
      sql`fats_grams
      >= 0`,
    ),
    check(
      "recipes_rating_check",
      sql`(rating >= (0):: numeric)
          AND (rating <= (5)::numeric)`,
    ),
  ],
);

export const createRecipeSchema = createInsertSchema(recipes, {
  title: z.string().min(1).max(100),
  description: z.string().max(1000),
  servings: z.number().min(1).max(100),
  prepTimeMinutes: z.number().min(1).max(1000),
  calories: z.number().min(1).max(1000),
  proteinGrams: z.number().min(1).max(1000),
  carbsGrams: z.number().min(1).max(1000),
  fatsGrams: z.number().min(1).max(1000),
  imageUrl: z.string().max(1000).optional(),
  rating: z.string().optional(),
  reviewCount: z.number().min(1).max(1000),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
