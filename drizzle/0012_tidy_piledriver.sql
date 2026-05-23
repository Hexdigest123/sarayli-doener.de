CREATE TABLE "menu_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_de" text NOT NULL,
	"name_en" text,
	"name_tr" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name_de" text NOT NULL,
	"name_en" text,
	"name_tr" text,
	"desc_de" text,
	"desc_en" text,
	"desc_tr" text,
	"size_de" text,
	"size_en" text,
	"size_tr" text,
	"price_cents" integer NOT NULL,
	"supports_extras" integer DEFAULT 0 NOT NULL,
	"is_available" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "menu_categories_sort_order_idx" ON "menu_categories" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "menu_items_category_id_sort_order_idx" ON "menu_items" USING btree ("category_id","sort_order");