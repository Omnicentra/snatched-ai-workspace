CREATE TABLE "snatch_hacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(50),
	"color" varchar(20),
	"bg_color" varchar(20),
	"benefits" jsonb,
	"instructions" jsonb,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "user_body_ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"front_image_key" text NOT NULL,
	"side_image_key" text NOT NULL,
	"back_image_key" text NOT NULL,
	"body_rating" jsonb,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "user_image_transformations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"input_image_key" text NOT NULL,
	"transformed_image_key" text,
	"face_coordinates" jsonb,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_snatch_hacks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"snatch_hack_id" integer NOT NULL,
	"completed_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "user_snatch_hacks_user_id_date_key" UNIQUE("user_id","completed_date")
);
--> statement-breakpoint
ALTER TABLE "user_body_ratings" ADD CONSTRAINT "user_body_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_image_transformations" ADD CONSTRAINT "user_image_transformations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_snatch_hacks" ADD CONSTRAINT "user_snatch_hacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_snatch_hacks" ADD CONSTRAINT "user_snatch_hacks_snatch_hack_id_fkey" FOREIGN KEY ("snatch_hack_id") REFERENCES "public"."snatch_hacks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_body_ratings_user" ON "user_body_ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_image_transformations_user" ON "user_image_transformations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_snatch_hacks_user_day" ON "user_snatch_hacks" USING btree ("user_id" int4_ops,"completed_date" date_ops);