-- Drop existing tables, types, and functions to start fresh.
DROP TABLE IF EXISTS "public"."user_profiles" CASCADE;
DROP TABLE IF EXISTS "public"."products" CASCADE;
DROP TABLE IF EXISTS "public"."categories" CASCADE;
DROP TABLE IF EXISTS "public"."orders" CASCADE;
DROP TABLE IF EXISTS "public"."order_items" CASCADE;
DROP TABLE IF EXISTS "public"."addresses" CASCADE;
DROP TABLE IF EXISTS "public"."reviews" CASCADE;
DROP TABLE IF EXISTS "public"."wishlists" CASCADE;
DROP TABLE IF EXISTS "public"."notifications" CASCADE;
DROP TABLE IF EXISTS "public"."newsletter_subscribers" CASCADE;
DROP TYPE IF EXISTS "public"."order_status" CASCADE;
DROP FUNCTION IF EXISTS "public"."handle_new_user" CASCADE;
DROP FUNCTION IF EXISTS "public"."get_user_order_stats" CASCADE;
DROP FUNCTION IF EXISTS "public"."execute_sql" CASCADE;


-- Create ENUM for order status
CREATE TYPE "public"."order_status" AS ENUM ('pending', 'shipped', 'delivered', 'cancelled');

-- Table for Categories
CREATE TABLE "public"."categories" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "name" character varying NOT NULL,
    "image_url" text NOT NULL,
    "data_ai_hint" text NOT NULL,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to categories" ON "public"."categories" FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to categories" ON "public"."categories" FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Table for Products
CREATE TABLE "public"."products" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "name" character varying NOT NULL,
    "description" text NOT NULL,
    "long_description" text NOT NULL,
    "price" numeric NOT NULL,
    "image_url" text NOT NULL,
    "data_ai_hint" text NOT NULL,
    "is_featured" boolean NOT NULL DEFAULT false,
    "is_best_seller" boolean NOT NULL DEFAULT false,
    "category_id" uuid,
    CONSTRAINT "products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id")
);
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to products" ON "public"."products" FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to products" ON "public"."products" FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Table for User Profiles
CREATE TABLE "public"."user_profiles" (
    "id" uuid NOT NULL,
    "full_name" text,
    "avatar_url" text,
    "role" text NOT NULL DEFAULT 'user',
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);
ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read their own profile" ON "public"."user_profiles" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON "public"."user_profiles" FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow admin full access to user_profiles" ON "public"."user_profiles" FOR ALL USING (auth.jwt() ->> 'role' = 'admin');


-- Function to create a user profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url', 'user');
  RETURN new;
END;
$$;

-- Trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Table for Addresses
CREATE TABLE "public"."addresses" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "address_line_1" text NOT NULL,
    "address_line_2" text,
    "city" text NOT NULL,
    "state" text NOT NULL,
    "postal_code" text NOT NULL,
    "country" text NOT NULL DEFAULT 'USA',
    "is_default" boolean NOT NULL DEFAULT false,
    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);
ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own addresses" ON "public"."addresses" FOR ALL USING (auth.uid() = user_id);

-- Table for Orders
CREATE TABLE "public"."orders" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "total_amount" numeric NOT NULL,
    "status" public.order_status NOT NULL DEFAULT 'pending',
    "shipping_address_id" uuid NOT NULL,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."addresses"("id")
);
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to see their own orders" ON "public"."orders" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow admins to manage all orders" ON "public"."orders" FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Table for Order Items
CREATE TABLE "public"."order_items" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "order_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "quantity" integer NOT NULL,
    "price" numeric NOT NULL,
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE,
    CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
);
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to see their own order items" ON "public"."order_items" FOR SELECT USING (
  (SELECT user_id FROM public.orders WHERE id = order_id) = auth.uid()
);
CREATE POLICY "Allow admin to manage all order items" ON "public"."order_items" FOR ALL USING (auth.jwt() ->> 'role' = 'admin');


-- Table for Reviews
CREATE TABLE "public"."reviews" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" text,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE
);
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to reviews" ON "public"."reviews" FOR SELECT USING (true);
CREATE POLICY "Allow users to manage their own reviews" ON "public"."reviews" FOR ALL USING (auth.uid() = user_id);

-- Table for Wishlists
CREATE TABLE "public"."wishlists" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "wishlists_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE
);
ALTER TABLE "public"."wishlists" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own wishlist" ON "public"."wishlists" FOR ALL USING (auth.uid() = user_id);


-- Table for Notifications
CREATE TABLE "public"."notifications" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "message" text NOT NULL,
    "link" text,
    "is_read" boolean NOT NULL DEFAULT false,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own notifications" ON "public"."notifications" FOR ALL USING (auth.uid() = user_id);

-- Table for Newsletter Subscribers
CREATE TABLE "public"."newsletter_subscribers" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "email" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "newsletter_subscribers_email_key" UNIQUE ("email")
);
ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert access" ON "public"."newsletter_subscribers" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin full access" ON "public"."newsletter_subscribers" FOR ALL USING (auth.jwt() ->> 'role' = 'admin');


-- Function for user order stats
CREATE OR REPLACE FUNCTION public.get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent numeric, total_orders bigint, pending_orders bigint)
LANGUAGE sql
AS $$
  SELECT
    COALESCE(SUM(total_amount), 0) as total_spent,
    COUNT(id) as total_orders,
    COUNT(id) FILTER (WHERE status = 'pending') as pending_orders
  FROM public.orders
  WHERE user_id = p_user_id;
$$;


-- Insert sample data
INSERT INTO "public"."categories" ("name", "image_url", "data_ai_hint") VALUES
('Fruits', 'https://placehold.co/400x400.png', 'assorted fruits'),
('Vegetables', 'https://placehold.co/400x400.png', 'fresh vegetables'),
('Dairy', 'https://placehold.co/400x400.png', 'dairy products'),
('Bakery', 'https://placehold.co/400x400.png', 'artisan bread'),
('Meats', 'https://placehold.co/400x400.png', 'fresh meat'),
('Pantry', 'https://placehold.co/400x400.png', 'pantry staples');

INSERT INTO "public"."products" ("name", "description", "long_description", "price", "image_url", "data_ai_hint", "is_featured", "is_best_seller", "category_id", "created_at") VALUES
('Organic Avocados', 'Pack of 4 creamy, organic Hass avocados.', 'Our organic Hass avocados are grown in nutrient-rich soil... Perfect for toast, salads, or guacamole.', 4.99, 'https://placehold.co/600x400.png', 'organic avocados', TRUE, TRUE, (SELECT id FROM categories WHERE name = 'Fruits'), '2025-06-24T10:34:35.704392+00:00'),
('Fresh Strawberries', '1 lb of sweet, juicy strawberries.', 'Hand-picked at peak ripeness, our strawberries are bursting with sweet, natural flavor.', 3.49, 'https://placehold.co/600x400.png', 'fresh strawberries', TRUE, FALSE, (SELECT id FROM categories WHERE name = 'Fruits'), '2025-06-25T10:34:35.704392+00:00'),
('Free-Range Eggs', 'One dozen large brown free-range eggs.', 'Our hens are free to roam on open pastures, resulting in eggs with rich, flavorful yolks.', 6.29, 'https://placehold.co/600x400.png', 'free-range eggs', FALSE, TRUE, (SELECT id FROM categories WHERE name = 'Dairy'), '2025-06-26T10:34:35.704392+00:00'),
('Heirloom Tomatoes', 'A mix of colorful and flavorful heirloom tomatoes.', 'Experience the vibrant colors and diverse flavors of our heirloom tomatoes.', 4.79, 'https://placehold.co/600x400.png', 'heirloom tomatoes', TRUE, FALSE, (SELECT id FROM categories WHERE name = 'Vegetables'), '2025-06-27T10:34:35.704392+00:00'),
('Artisanal Sourdough', 'A freshly baked loaf of artisanal sourdough bread.', 'Baked daily using a traditional starter, our sourdough has a delightful tangy flavor.', 5.99, 'https://placehold.co/600x400.png', 'sourdough bread', TRUE, TRUE, (SELECT id FROM categories WHERE name = 'Bakery'), '2025-06-28T10:34:35.704392+00:00'),
('Cold-Pressed Olive Oil', '500ml bottle of extra virgin olive oil.', 'Our extra virgin olive oil is cold-pressed from the finest olives to preserve its natural antioxidants.', 12.99, 'https://placehold.co/600x400.png', 'olive oil', FALSE, FALSE, (SELECT id FROM categories WHERE name = 'Pantry'), '2025-06-29T10:34:35.704392+00:00');


-- Secure function to execute arbitrary SQL, callable only by the service_role.
-- This is used by the admin dashboard to reset the schema.
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

GRANT EXECUTE ON FUNCTION execute_sql(text) TO service_role;
REVOKE EXECUTE ON FUNCTION execute_sql(text) FROM anon, authenticated;
