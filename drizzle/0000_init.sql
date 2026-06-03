CREATE TYPE "public"."user_role" AS ENUM('admin', 'seller', 'buyer');
CREATE TYPE "public"."dimension" AS ENUM('weight', 'volume', 'count');
CREATE TYPE "public"."display_unit" AS ENUM('g', 'kg', 'mL', 'L', 'unit');
CREATE TYPE "public"."order_status" AS ENUM('quotation', 'pending', 'approved', 'rejected', 'fulfilled', 'cancelled');

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(120) NOT NULL,
	"role" "user_role" DEFAULT 'seller' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"sku" varchar(64) NOT NULL,
	"description" text,
	"category" varchar(100),
	"dimension" "dimension" NOT NULL,
	"base_unit" "display_unit" NOT NULL,
	"price_per_base_unit" numeric(24, 10) NOT NULL,
	"stock_quantity" numeric(24, 8) DEFAULT '0' NOT NULL,
	"low_stock_threshold" numeric(24, 8) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);

CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(32) NOT NULL,
	"buyer_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'quotation' NOT NULL,
	"total_inr" numeric(24, 4) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);

CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"ordered_quantity" numeric(24, 8) NOT NULL,
	"ordered_unit" "display_unit" NOT NULL,
	"quantity_in_base" numeric(24, 8) NOT NULL,
	"price_per_base_unit" numeric(24, 10) NOT NULL,
	"line_total_inr" numeric(24, 4) NOT NULL,
	"product_name" varchar(200) NOT NULL,
	"product_sku" varchar(64) NOT NULL,
	"product_base_unit" "display_unit" NOT NULL
);

ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;
