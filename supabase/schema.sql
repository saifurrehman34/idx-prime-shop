-- Drop existing tables and types if they exist to start fresh.
DROP TABLE IF EXISTS "public"."wishlists" CASCADE;
DROP TABLE IF EXISTS "public"."reviews" CASCADE;
DROP TABLE IF EXISTS "public"."order_items" CASCADE;
DROP TABLE IF EXISTS "public"."orders" CASCADE;
DROP TABLE IF EXISTS "public"."addresses" CASCADE;
DROP TABLE IF EXISTS "public"."products" CASCADE;
DROP TABLE IF EXISTS "public"."categories" CASCADE;
DROP TABLE IF EXISTS "public"."user_profiles" CASCADE;
DROP TABLE IF EXISTS "public"."newsletter_subscribers" CASCADE;
DROP TYPE IF EXISTS "public"."order_status" CASCADE;

-- Drop functions and triggers if they exist
DROP FUNCTION IF EXISTS "public"."handle_new_user" CASCADE;
DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
DROP FUNCTION IF EXISTS "public"."execute_sql" CASCADE;
DROP FUNCTION IF EXISTS "public"."get_user_order_stats" CASCADE;


-- Create ENUM for order status
CREATE TYPE "public"."order_status" AS ENUM ('pending', 'shipped', 'delivered', 'cancelled');

-- Create tables
CREATE TABLE "public"."categories" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "name" text NOT NULL,
    "image_url" text NOT NULL,
    "data_ai_hint" text NOT NULL
);
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_pkey" PRIMARY KEY USING INDEX "categories_pkey";

CREATE TABLE "public"."products" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "name" text NOT NULL,
    "description" text NOT NULL,
    "long_description" text NOT NULL,
    "price" real NOT NULL,
    "image_url" text NOT NULL,
    "data_ai_hint" text NOT NULL,
    "is_featured" boolean NOT NULL DEFAULT false,
    "is_best_seller" boolean NOT NULL DEFAULT false,
    "category_id" uuid
);
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);
ALTER TABLE "public"."products" ADD CONSTRAINT "products_pkey" PRIMARY KEY USING INDEX "products_pkey";
ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE TABLE "public"."user_profiles" (
    "id" uuid NOT NULL,
    "full_name" text,
    "avatar_url" text,
    "role" text NOT NULL DEFAULT 'user'::text
);
ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY USING INDEX "user_profiles_pkey";
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."addresses" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "address_line_1" text NOT NULL,
    "address_line_2" text,
    "city" text NOT NULL,
    "state" text NOT NULL,
    "postal_code" text NOT NULL,
    "country" text NOT NULL DEFAULT 'USA'::text,
    "is_default" boolean NOT NULL DEFAULT false
);
ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (id);
ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_pkey" PRIMARY KEY USING INDEX "addresses_pkey";
ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."orders" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "total_amount" real NOT NULL,
    "status" public.order_status NOT NULL DEFAULT 'pending'::public.order_status,
    "shipping_address_id" uuid NOT NULL
);
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_pkey" PRIMARY KEY USING INDEX "orders_pkey";
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY (shipping_address_id) REFERENCES public.addresses(id) ON DELETE RESTRICT;
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."order_items" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "order_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "quantity" integer NOT NULL,
    "price" real NOT NULL
);
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_pkey" PRIMARY KEY USING INDEX "order_items_pkey";
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;

CREATE TABLE "public"."reviews" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "rating" integer NOT NULL,
    "comment" text,
    CONSTRAINT "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5)))
);
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_pkey" PRIMARY KEY USING INDEX "reviews_pkey";
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."wishlists" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "product_id" uuid NOT NULL
);
ALTER TABLE "public"."wishlists" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX wishlists_pkey ON public.wishlists USING btree (id);
ALTER TABLE "public"."wishlists" ADD CONSTRAINT "wishlists_pkey" PRIMARY KEY USING INDEX "wishlists_pkey";
ALTER TABLE "public"."wishlists" ADD CONSTRAINT "wishlists_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE "public"."wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."newsletter_subscribers" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "email" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX newsletter_subscribers_email_key ON public.newsletter_subscribers USING btree (email);
CREATE UNIQUE INDEX newsletter_subscribers_pkey ON public.newsletter_subscribers USING btree (id);
ALTER TABLE "public"."newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY USING INDEX "newsletter_subscribers_pkey";
ALTER TABLE "public"."newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE USING INDEX "newsletter_subscribers_email_key";

-- Policies
CREATE POLICY "Enable read access for all users" ON "public"."categories" FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON "public"."products" FOR SELECT USING (true);
CREATE POLICY "Public user_profiles are viewable by everyone." ON "public"."user_profiles" FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON "public"."user_profiles" FOR INSERT WITH CHECK ((auth.uid() = id));
CREATE POLICY "Users can update own profile." ON "public"."user_profiles" FOR UPDATE USING ((auth.uid() = id));
CREATE POLICY "Enable all operations for users based on user_id" ON "public"."addresses" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Enable all operations for users based on user_id" ON "public"."orders" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Enable all operations for users based on user_id" ON "public"."order_items" USING (auth.uid() IN ( SELECT orders.user_id FROM orders WHERE (orders.id = order_items.order_id))) WITH CHECK (auth.uid() IN ( SELECT orders.user_id FROM orders WHERE (orders.id = order_items.order_id)));
CREATE POLICY "Enable read access for all users" ON "public"."reviews" FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON "public"."reviews" FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for users based on user_id" ON "public"."reviews" FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Enable delete for users based on user_id" ON "public"."reviews" FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Enable all operations for users based on user_id" ON "public"."wishlists" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Enable insert for all users" ON "public"."newsletter_subscribers" FOR INSERT WITH CHECK (true);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user' -- All new sign-ups are users by default
  );
  -- Insert a welcome address for the new user
  INSERT INTO public.addresses (user_id, address_line_1, city, state, postal_code, country, is_default)
  VALUES (
    new.id,
    '123 Main St',
    'Anytown',
    'CA',
    '12345',
    'USA',
    true
  );
  return new;
END;
$$;

-- Trigger to call the function when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function for admin to execute arbitrary SQL
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only allow the service_role to execute this function
  IF NOT (current_setting('request.role', true) = 'service_role') THEN
    RAISE EXCEPTION 'Only service_role can execute this function';
  END IF;
  
  EXECUTE sql_query;
END;
$$;

-- Function to get user order stats
CREATE OR REPLACE FUNCTION public.get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent double precision, total_orders bigint, pending_orders bigint)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(o.total_amount), 0)::double precision as total_spent,
        COUNT(o.id)::bigint as total_orders,
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END)::bigint as pending_orders
    FROM
        public.orders o
    WHERE
        o.user_id = p_user_id;
END;
$$;

-- Insert Data
-- Categories
INSERT INTO "public"."categories" ("name", "image_url", "data_ai_hint") VALUES
('Smartphones', 'https://source.unsplash.com/random/600x400/?smartphones', 'smartphone iphone'),
('Laptops', 'https://source.unsplash.com/random/600x400/?laptops', 'computer laptop'),
('Cameras', 'https://source.unsplash.com/random/600x400/?cameras', 'camera photography'),
('Headphones', 'https://source.unsplash.com/random/600x400/?headphones', 'headphones audio'),
('Gaming', 'https://source.unsplash.com/random/600x400/?gaming gear', 'gaming console'),
('Accessories', 'https://source.unsplash.com/random/600x400/?tech accessories', 'tech accessories');

DO $$
DECLARE
    v_smartphones_cat_id uuid;
    v_laptops_cat_id uuid;
    v_cameras_cat_id uuid;
    v_headphones_cat_id uuid;
    v_gaming_cat_id uuid;
    v_accessories_cat_id uuid;
BEGIN
    SELECT id INTO v_smartphones_cat_id FROM public.categories WHERE name = 'Smartphones';
    SELECT id INTO v_laptops_cat_id FROM public.categories WHERE name = 'Laptops';
    SELECT id INTO v_cameras_cat_id FROM public.categories WHERE name = 'Cameras';
    SELECT id INTO v_headphones_cat_id FROM public.categories WHERE name = 'Headphones';
    SELECT id INTO v_gaming_cat_id FROM public.categories WHERE name = 'Gaming';
    SELECT id INTO v_accessories_cat_id FROM public.categories WHERE name = 'Accessories';

    -- Products
    INSERT INTO "public"."products" ("name", "description", "long_description", "price", "image_url", "data_ai_hint", "is_featured", "is_best_seller", "category_id") VALUES
    ('Pro Gaming Laptop', '16-inch high-performance gaming laptop.', 'Equipped with the latest processor and a dedicated graphics card, this laptop is built for competitive gaming. Features a 165Hz display and RGB keyboard.', 1499.99, 'https://source.unsplash.com/random/600x400/?gaming laptop', 'gaming laptop', true, true, v_laptops_cat_id),
    ('Ultra-Thin Notebook', 'Sleek and lightweight 13-inch notebook for professionals.', 'With an all-day battery life and a stunning high-resolution display, this notebook is perfect for productivity on the go. Crafted from premium aluminum.', 999, 'https://source.unsplash.com/random/600x400/?ultrathin notebook', 'ultrabook notebook', true, false, v_laptops_cat_id),
    ('Flagship Smartphone X', 'The latest smartphone with a pro-grade camera system.', 'Capture breathtaking photos and videos with the advanced triple-camera system. The vibrant 6.7-inch OLED display brings content to life.', 1099, 'https://source.unsplash.com/random/600x400/?flagship smartphone', 'smartphone pro', true, true, v_smartphones_cat_id),
    ('Compact Mirrorless Camera', 'A versatile mirrorless camera for enthusiasts.', 'This camera packs a large sensor into a compact body, delivering exceptional image quality. Perfect for travel and everyday photography.', 850.50, 'https://source.unsplash.com/random/600x400/?mirrorless camera', 'mirrorless camera', true, false, v_cameras_cat_id),
    ('Noise-Cancelling Headphones', 'Immerse yourself in sound with these wireless headphones.', 'Block out distractions and enjoy pure, high-fidelity audio. Features industry-leading noise cancellation and up to 30 hours of battery life.', 349.99, 'https://source.unsplash.com/random/600x400/?noise cancelling headphones', 'wireless headphones', true, true, v_headphones_cat_id),
    ('Next-Gen Gaming Console', 'Experience the future of gaming.', 'Blazing-fast load times and breathtaking 4K graphics make this the ultimate gaming machine. Comes with one innovative wireless controller.', 499.99, 'https://source.unsplash.com/random/600x400/?gaming console', 'gaming console', true, false, v_gaming_cat_id),
    ('Mechanical Keyboard', 'RGB mechanical keyboard with tactile switches.', 'Enjoy a superior typing and gaming experience with satisfying tactile feedback and customizable per-key RGB lighting.', 129.99, 'https://source.unsplash.com/random/600x400/?mechanical keyboard', 'mechanical keyboard', false, true, v_accessories_cat_id),
    ('4K Action Camera', 'Capture all your adventures in stunning 4K.', 'Waterproof, durable, and packed with features like image stabilization and slow-motion recording. Your perfect companion for any adventure.', 399, 'https://source.unsplash.com/random/600x400/?action camera', 'action camera', false, false, v_cameras_cat_id),
    ('Smartwatch Pro', 'Track your fitness and stay connected.', 'Features advanced health monitoring, GPS, and seamless smartphone integration. A stylish and functional accessory for your daily life.', 299.00, 'https://source.unsplash.com/random/600x400/?smartwatch pro', 'smartwatch fitness', false, false, v_accessories_cat_id),
    ('Portable Bluetooth Speaker', 'Your music, loud and clear, anywhere you go.', 'This compact speaker delivers powerful sound and deep bass. It''s waterproof and has a 12-hour battery life, making it perfect for any outing.', 89.50, 'https://source.unsplash.com/random/600x400/?bluetooth speaker', 'bluetooth speaker', true, false, v_accessories_cat_id);
END $$;
