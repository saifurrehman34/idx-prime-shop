-- To apply this schema, run the "Execute SQL Schema" command on the Admin Dashboard.
-- WARNING: This is a destructive operation that will drop existing tables and data.

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS "public"."wishlists" CASCADE;
DROP TABLE IF EXISTS "public"."reviews" CASCADE;
DROP TABLE IF EXISTS "public"."order_items" CASCADE;
DROP TABLE IF EXISTS "public"."orders" CASCADE;
DROP TABLE IF EXISTS "public"."addresses" CASCADE;
DROP TABLE IF EXISTS "public"."products" CASCADE;
DROP TABLE IF EXISTS "public"."categories" CASCADE;
DROP TABLE IF EXISTS "public"."user_profiles" CASCADE;
DROP TABLE IF EXISTS "public"."newsletter_subscribers" CASCADE;
DROP TABLE IF EXISTS "public"."hero_slides" CASCADE; -- New table

-- Drop existing types
DROP TYPE IF EXISTS "public"."order_status";

-- Create Enums
CREATE TYPE "public"."order_status" AS ENUM ('pending', 'shipped', 'delivered', 'cancelled');

-- Create Tables
CREATE TABLE "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "role" "text" NOT NULL DEFAULT 'user'::"text"
);
ALTER TABLE "public"."user_profiles" OWNER TO "postgres";
ALTER TABLE ONLY "public"."user_profiles" ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."user_profiles" ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "data_ai_hint" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."categories" OWNER TO "postgres";
ALTER TABLE ONLY "public"."categories" ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

CREATE TABLE "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "long_description" "text" NOT NULL,
    "price" "numeric" NOT NULL,
    "image_url" "text" NOT NULL,
    "data_ai_hint" "text" NOT NULL,
    "is_featured" "boolean" DEFAULT false NOT NULL,
    "is_best_seller" "boolean" DEFAULT false NOT NULL,
    "category_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."products" OWNER TO "postgres";
ALTER TABLE ONLY "public"."products" ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE TABLE "public"."addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "address_line_1" "text" NOT NULL,
    "address_line_2" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "postal_code" "text" NOT NULL,
    "country" "text" NOT NULL DEFAULT 'USA',
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "public"."addresses" OWNER TO "postgres";
ALTER TABLE ONLY "public"."addresses" ADD CONSTRAINT "addresses_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "public"."addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "total_amount" "numeric" NOT NULL,
    "status" "public"."order_status" DEFAULT 'pending'::"public"."order_status" NOT NULL,
    "shipping_address_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."orders" OWNER TO "postgres";
ALTER TABLE ONLY "public"."orders" ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."orders" ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY (shipping_address_id) REFERENCES public.addresses(id) ON DELETE SET NULL;

CREATE TABLE "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" "integer" NOT NULL,
    "price" "numeric" NOT NULL
);
ALTER TABLE "public"."order_items" OWNER TO "postgres";
ALTER TABLE ONLY "public"."order_items" ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

CREATE TABLE "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "comment" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "public"."reviews" OWNER TO "postgres";
ALTER TABLE ONLY "public"."reviews" ADD CONSTRAINT "reviews_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "public"."reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

CREATE TABLE "public"."wishlists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."wishlists" OWNER TO "postgres";
ALTER TABLE ONLY "public"."wishlists" ADD CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."wishlists" ADD CONSTRAINT "wishlists_user_id_product_id_key" UNIQUE (user_id, product_id);
ALTER TABLE ONLY "public"."wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."wishlists" ADD CONSTRAINT "wishlists_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

CREATE TABLE "public"."newsletter_subscribers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";
ALTER TABLE ONLY "public"."newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email");

-- New table for Hero Slides
CREATE TABLE "public"."hero_slides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "image_url" "text" NOT NULL,
    "image_ai_hint" "text",
    "link" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."hero_slides" OWNER TO "postgres";
ALTER TABLE ONLY "public"."hero_slides" ADD CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id");

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(total_users bigint, total_products bigint, total_orders bigint, total_revenue numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT count(*) FROM auth.users) AS total_users,
        (SELECT count(*) FROM public.products) AS total_products,
        (SELECT count(*) FROM public.orders) AS total_orders,
        (SELECT sum(total_amount) FROM public.orders WHERE status = 'delivered') AS total_revenue;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent numeric, total_orders bigint, pending_orders bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(CASE WHEN o.status = 'delivered' THEN o.total_amount ELSE 0 END), 0) as total_spent,
        COUNT(o.id) as total_orders,
        COUNT(CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders
    FROM
        public.orders o
    WHERE
        o.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

create or replace function public.execute_sql(sql_query text)
returns table(result json)
language plpgsql
as $$
begin
  return query execute sql_query;
end;
$$;

-- Seed Data
INSERT INTO public.categories (name, image_url, data_ai_hint) VALUES
('Smartphones', 'https://source.unsplash.com/random/600x400/?smartphones', 'smartphone iphone'),
('Laptops', 'https://source.unsplash.com/random/600x400/?laptops', 'computer laptop'),
('Headphones', 'https://source.unsplash.com/random/600x400/?headphones', 'headphones audio'),
('Cameras', 'https://source.unsplash.com/random/600x400/?cameras', 'camera photography'),
('Gaming', 'https://source.unsplash.com/random/600x400/?gaming gear', 'gaming console'),
('Accessories', 'https://source.unsplash.com/random/600x400/?tech accessories', 'tech accessories');
