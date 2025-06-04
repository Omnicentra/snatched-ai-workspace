ALTER TABLE "fitness_goals" ALTER COLUMN "timeline_weeks" SET DEFAULT 12;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ALTER COLUMN "unit" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "dietary_preference" varchar(50) DEFAULT 'Classic' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "style_preference" varchar(50) DEFAULT 'CASUAL_ATHLEISURE' NOT NULL;--> statement-breakpoint
CREATE INDEX "email_idx" ON "user" USING btree ("email");--> statement-breakpoint
ALTER TABLE "fitness_goals" DROP COLUMN "body_tone_preference";--> statement-breakpoint
ALTER TABLE "fitness_goals" DROP COLUMN "style_preference";--> statement-breakpoint
ALTER TABLE "fitness_goals" DROP COLUMN "body_ratio_preference";