CREATE TABLE "account" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"account_id" varchar(255) NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"access_token" varchar(255),
	"refresh_token" varchar(255),
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" varchar(255),
	"id_token" text,
	"password" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "account_provider_account" UNIQUE("provider_id","account_id")
);
--> statement-breakpoint
CREATE TABLE "body_considerations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"consideration_type" varchar(50) NOT NULL,
	"custom_description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "body_measurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"measurement_date" date DEFAULT CURRENT_DATE NOT NULL,
	"weight_kg" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "body_measurements_weight_kg_check" CHECK (weight_kg
      > (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"target_muscles" text,
	"image_url" text,
	"video_url" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "fitness_blockers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"blocker_type" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "fitness_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"desired_shape" varchar(50) NOT NULL,
	"timeline_weeks" integer NOT NULL,
	"body_tone_preference" integer,
	"style_preference" integer,
	"body_ratio_preference" numeric(3, 2),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "fitness_goals_timeline_weeks_check" CHECK (timeline_weeks
      > 0),
	CONSTRAINT "fitness_goals_body_tone_preference_check" CHECK ((body_tone_preference >= 0)
          AND (body_tone_preference <= 100)),
	CONSTRAINT "fitness_goals_style_preference_check" CHECK ((style_preference >= 0)
          AND (style_preference <= 100)),
	CONSTRAINT "fitness_goals_body_ratio_preference_check" CHECK ((body_ratio_preference >= 0.65)
          AND (body_ratio_preference <= 0.85))
);
--> statement-breakpoint
CREATE TABLE "food_cravings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"craving_type" varchar(50) NOT NULL,
	"other_cravings" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "health_conditions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"has_conditions" boolean NOT NULL,
	"conditions_description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "meal_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"target_calories" integer NOT NULL,
	"target_protein" integer NOT NULL,
	"target_carbs" integer NOT NULL,
	"target_fats" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "meal_plans_user_id_date_key" UNIQUE("user_id","date"),
	CONSTRAINT "meal_plans_target_calories_check" CHECK (target_calories
      > 0),
	CONSTRAINT "meal_plans_target_protein_check" CHECK (target_protein
      > 0),
	CONSTRAINT "meal_plans_target_carbs_check" CHECK (target_carbs
      > 0),
	CONSTRAINT "meal_plans_target_fats_check" CHECK (target_fats
      > 0)
);
--> statement-breakpoint
CREATE TABLE "meal_schedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_plan_id" integer NOT NULL,
	"recipe_id" integer NOT NULL,
	"meal_type" varchar(20) NOT NULL,
	"scheduled_time" time NOT NULL,
	"completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "milestone_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" integer NOT NULL,
	"total_days" integer NOT NULL,
	"emoji" varchar(10),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "milestone_levels_level_key" UNIQUE("level"),
	CONSTRAINT "milestone_levels_level_check" CHECK (level
      > 0),
	CONSTRAINT "milestone_levels_total_days_check" CHECK (total_days
      > 0)
);
--> statement-breakpoint
CREATE TABLE "previous_experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"experience_type" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipe_id" integer NOT NULL,
	"ingredient_name" varchar(100) NOT NULL,
	"amount" numeric(8, 2) NOT NULL,
	"unit" varchar(20) NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "recipe_ingredients_recipe_id_order_index_key" UNIQUE("recipe_id","order_index"),
	CONSTRAINT "recipe_ingredients_amount_check" CHECK (amount
      > (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "recipe_instructions" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipe_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"instruction" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "recipe_instructions_recipe_id_step_number_key" UNIQUE("recipe_id","step_number"),
	CONSTRAINT "recipe_instructions_step_number_check" CHECK (step_number
      > 0)
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"servings" integer NOT NULL,
	"prep_time_minutes" integer,
	"calories" integer NOT NULL,
	"protein_grams" integer NOT NULL,
	"carbs_grams" integer NOT NULL,
	"fats_grams" integer NOT NULL,
	"image_url" text,
	"rating" numeric(2, 1),
	"review_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "recipes_servings_check" CHECK (servings
      > 0),
	CONSTRAINT "recipes_prep_time_minutes_check" CHECK (prep_time_minutes
      > 0),
	CONSTRAINT "recipes_calories_check" CHECK (calories
      > 0),
	CONSTRAINT "recipes_protein_grams_check" CHECK (protein_grams
      >= 0),
	CONSTRAINT "recipes_carbs_grams_check" CHECK (carbs_grams
      >= 0),
	CONSTRAINT "recipes_fats_grams_check" CHECK (fats_grams
      >= 0),
	CONSTRAINT "recipes_rating_check" CHECK ((rating >= (0):: numeric)
          AND (rating <= (5)::numeric))
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "user_milestone_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"level_id" integer NOT NULL,
	"current_day" integer NOT NULL,
	"completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "user_milestone_progress_current_day_check" CHECK (current_day
      > 0)
);
--> statement-breakpoint
CREATE TABLE "user_recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"recipe_id" integer NOT NULL,
	"is_favorite" boolean DEFAULT false,
	"personal_notes" text,
	"serving_size_override" integer,
	"last_cooked_at" timestamp with time zone,
	"rating" integer,
	"customizations" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "user_recipes_user_id_recipe_id_key" UNIQUE("user_id","recipe_id"),
	CONSTRAINT "user_recipes_rating_check" CHECK ((rating >= 1)
          AND (rating <= 5))
);
--> statement-breakpoint
CREATE TABLE "user_workout_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"workout_id" integer NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"calories_burned" integer,
	"duration_minutes" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"email_verified" timestamp with time zone,
	"image" text,
	"age" integer NOT NULL,
	"height_cm" integer NOT NULL,
	"weight_kg" numeric(5, 2) NOT NULL,
	"ethnicity" varchar(50),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_age_check" CHECK (age
      > 0),
	CONSTRAINT "users_height_cm_check" CHECK (height_cm
      > 0),
	CONSTRAINT "users_weight_kg_check" CHECK (weight_kg
      > (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "workout_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "workout_categories_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"sets" integer NOT NULL,
	"reps" integer NOT NULL,
	"rest_seconds" integer NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "workout_exercises_workout_id_order_index_key" UNIQUE("workout_id","order_index"),
	CONSTRAINT "workout_exercises_sets_check" CHECK (sets
      > 0),
	CONSTRAINT "workout_exercises_reps_check" CHECK (reps
      > 0),
	CONSTRAINT "workout_exercises_rest_seconds_check" CHECK (rest_seconds
      >= 0)
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"duration_minutes" integer NOT NULL,
	"difficulty_level" varchar(20) NOT NULL,
	"calories_burn" integer,
	"rating" numeric(2, 1),
	"image_url" text,
	"category_id" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "workouts_duration_minutes_check" CHECK (duration_minutes
      > 0),
	CONSTRAINT "workouts_rating_check" CHECK ((rating >= (0):: numeric)
          AND (rating <= (5)::numeric))
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_considerations" ADD CONSTRAINT "body_considerations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_blockers" ADD CONSTRAINT "fitness_blockers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_goals" ADD CONSTRAINT "fitness_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_cravings" ADD CONSTRAINT "food_cravings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_conditions" ADD CONSTRAINT "health_conditions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_schedule" ADD CONSTRAINT "meal_schedule_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_schedule" ADD CONSTRAINT "meal_schedule_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "previous_experiences" ADD CONSTRAINT "previous_experiences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_instructions" ADD CONSTRAINT "recipe_instructions_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_milestone_progress" ADD CONSTRAINT "user_milestone_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_milestone_progress" ADD CONSTRAINT "user_milestone_progress_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."milestone_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recipes" ADD CONSTRAINT "user_recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recipes" ADD CONSTRAINT "user_recipes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workout_progress" ADD CONSTRAINT "user_workout_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workout_progress" ADD CONSTRAINT "user_workout_progress_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."workout_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_account_user" ON "account" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_account_provider" ON "account" USING btree ("provider_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_body_measurements_user_id_date" ON "body_measurements" USING btree ("user_id" int4_ops,"measurement_date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_fitness_goals_user_id" ON "fitness_goals" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_meal_plans_user_date" ON "meal_plans" USING btree ("user_id" int4_ops,"date" date_ops);--> statement-breakpoint
CREATE INDEX "idx_meal_schedule_meal_plan" ON "meal_schedule" USING btree ("meal_plan_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_recipe_ingredients_recipe" ON "recipe_ingredients" USING btree ("recipe_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_recipe_instructions_recipe" ON "recipe_instructions" USING btree ("recipe_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_session_user" ON "session" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_session_token" ON "session" USING btree ("token" text_ops);--> statement-breakpoint
CREATE INDEX "idx_user_milestone_progress_user" ON "user_milestone_progress" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_user_recipes_favorite" ON "user_recipes" USING btree ("user_id" int4_ops,"is_favorite" bool_ops) WHERE (is_favorite = true);--> statement-breakpoint
CREATE INDEX "idx_user_recipes_recipe" ON "user_recipes" USING btree ("recipe_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_user_recipes_user" ON "user_recipes" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_user_workout_progress_user" ON "user_workout_progress" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_verification_identifier" ON "verification" USING btree ("identifier" text_ops);--> statement-breakpoint
CREATE INDEX "idx_verification_expires" ON "verification" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_workout_exercises_workout" ON "workout_exercises" USING btree ("workout_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_workouts_category" ON "workouts" USING btree ("category_id" int4_ops);