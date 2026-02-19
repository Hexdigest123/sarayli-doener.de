CREATE TABLE "store_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"is_open" integer DEFAULT 1 NOT NULL,
	"closed_message" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "extras" text;