CREATE TABLE "recipe_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "recipe_categories_name_key" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."recipe_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_recipes_category" ON "recipes" USING btree ("category_id" int4_ops);