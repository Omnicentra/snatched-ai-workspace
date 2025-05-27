ALTER TABLE "meal_plans" ALTER COLUMN "target_calories" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "meal_plans" ALTER COLUMN "target_protein" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "meal_plans" ALTER COLUMN "target_carbs" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "meal_plans" ALTER COLUMN "target_fats" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "calories" SET DATA TYPE numeric(8, 2);--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "protein_grams" SET DATA TYPE numeric(8, 2);--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "carbs_grams" SET DATA TYPE numeric(8, 2);--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "fats_grams" SET DATA TYPE numeric(8, 2);