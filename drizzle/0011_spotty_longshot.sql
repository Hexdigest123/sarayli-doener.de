CREATE TABLE "site_popup" (
	"id" serial PRIMARY KEY NOT NULL,
	"active" integer DEFAULT 0 NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text,
	"image_url" text,
	"badge" text,
	"cta_label" text,
	"cta_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
