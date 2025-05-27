CREATE TABLE "workout_classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "workout_classes_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "workout_to_class" (
	"workout_id" integer NOT NULL,
	"class_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "workout_to_class_workout_id_class_id_pk" PRIMARY KEY("workout_id","class_id")
);
--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ALTER COLUMN "unit" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "workout_to_class" ADD CONSTRAINT "workout_to_class_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_to_class" ADD CONSTRAINT "workout_to_class_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."workout_classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_workout_to_class_workout" ON "workout_to_class" USING btree ("workout_id");--> statement-breakpoint
CREATE INDEX "idx_workout_to_class_class" ON "workout_to_class" USING btree ("class_id");