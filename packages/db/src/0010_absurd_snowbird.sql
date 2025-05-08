CREATE TABLE "user_devices" (
	"user_id" integer NOT NULL,
	"device_id" varchar(255) NOT NULL,
	"device_name" varchar(100),
	"device_type" varchar(50),
	"last_active_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "user_devices_user_id_device_id_pk" PRIMARY KEY("user_id","device_id"),
	CONSTRAINT "user_devices_device_id_key" UNIQUE("device_id")
);
--> statement-breakpoint
ALTER TABLE "workout_plans" ALTER COLUMN "status" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_devices_user" ON "user_devices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_devices_device" ON "user_devices" USING btree ("device_id");