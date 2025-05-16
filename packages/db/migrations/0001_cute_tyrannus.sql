ALTER TABLE "users" RENAME TO "user";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "body_considerations" DROP CONSTRAINT "body_considerations_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "body_measurements" DROP CONSTRAINT "body_measurements_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "fitness_blockers" DROP CONSTRAINT "fitness_blockers_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "fitness_goals" DROP CONSTRAINT "fitness_goals_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "food_cravings" DROP CONSTRAINT "food_cravings_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "health_conditions" DROP CONSTRAINT "health_conditions_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "meal_plans" DROP CONSTRAINT "meal_plans_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "previous_experiences" DROP CONSTRAINT "previous_experiences_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "user_milestone_progress" DROP CONSTRAINT "user_milestone_progress_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "user_recipes" DROP CONSTRAINT "user_recipes_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "user_workout_progress" DROP CONSTRAINT "user_workout_progress_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_considerations" ADD CONSTRAINT "body_considerations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_blockers" ADD CONSTRAINT "fitness_blockers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fitness_goals" ADD CONSTRAINT "fitness_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_cravings" ADD CONSTRAINT "food_cravings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_conditions" ADD CONSTRAINT "health_conditions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "previous_experiences" ADD CONSTRAINT "previous_experiences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_milestone_progress" ADD CONSTRAINT "user_milestone_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_recipes" ADD CONSTRAINT "user_recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_workout_progress" ADD CONSTRAINT "user_workout_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;