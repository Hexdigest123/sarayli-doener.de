CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"referer" text,
	"landing_page" text NOT NULL,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"locale" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
