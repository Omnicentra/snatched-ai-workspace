CREATE TABLE "workout_plan_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"workout_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"completed" boolean DEFAULT false,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "workout_plan_days_plan_id_day_number_key" UNIQUE("plan_id","day_number"),
	CONSTRAINT "workout_plan_days_day_number_check" CHECK (day_number > 0 AND day_number <= 7)
);
--> statement-breakpoint
CREATE TABLE "workout_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"target_calories_burn" integer,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "workout_plans_date_check" CHECK (end_date >= start_date)
);
--> statement-breakpoint
ALTER TABLE "workout_plan_days" ADD CONSTRAINT "workout_plan_days_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_days" ADD CONSTRAINT "workout_plan_days_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_workout_plan_days_plan" ON "workout_plan_days" USING btree ("plan_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_workout_plans_user_date" ON "workout_plans" USING btree ("user_id" int4_ops,"start_date" date_ops);