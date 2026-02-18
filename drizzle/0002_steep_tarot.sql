CREATE TABLE "visitor_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"visitor_id" text NOT NULL,
	"event_type" text NOT NULL,
	"page" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "visitor_events_visitor_id_created_at_idx" ON "visitor_events" USING btree ("visitor_id","created_at");