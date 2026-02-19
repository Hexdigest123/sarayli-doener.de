ALTER TABLE "orders" ADD COLUMN "order_number" text;--> statement-breakpoint
UPDATE "orders" SET "order_number" = 'SD-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6)) WHERE "order_number" IS NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "order_number" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_number_unique" UNIQUE("order_number");