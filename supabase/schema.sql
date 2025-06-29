-- Drop existing tables and other objects to avoid conflicts if they already exist.
-- The 'CASCADE' option will also drop any dependent objects.
DROP TABLE IF EXISTS "public"."wishlists" CASCADE;
DROP TABLE IF EXISTS "public"."reviews" CASCADE;
DROP TABLE IF EXISTS "public"."order_items" CASCADE;
DROP TABLE IF EXISTS "public"."orders" CASCADE;
DROP TABLE IF EXISTS "public"."addresses" CASCADE;
DROP TABLE IF EXISTS "public"."user_profiles" CASCADE;
DROP TABLE IF EXISTS "public"."products" CASCADE;
DROP TABLE IF EXISTS "public"."categories" CASCADE;
DROP TABLE IF EXISTS "public"."newsletter_subscribers" CASCADE;
DROP TYPE IF EXISTS "public"."order_status" CASCADE;
DROP FUNCTION IF EXISTS "public"."handle_new_user" CASCADE;
DROP FUNCTION IF EXISTS "public"."get_user_order_stats" CASCADE;
DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";

-- Enums
CREATE TYPE "public"."order_status" AS ENUM (
    'pending',
    'shipped',
    'delivered',
    'cancelled'
);

-- Tables
CREATE TABLE "public"."categories" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "name" character varying NOT NULL,
    "image_url" text NOT NULL,
    "data_ai_hint" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."products" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "name" character varying NOT NULL,
    "description" text NOT NULL,
    "long_description" text NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "image_url" text NOT NULL,
    "data_ai_hint" text NOT NULL,
    "category_id" uuid REFERENCES public.categories(id),
    "is_featured" boolean DEFAULT false NOT NULL,
    "is_best_seller" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."user_profiles" (
    "id" uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    "full_name" text,
    "avatar_url" text,
    "role" character varying DEFAULT 'user' NOT NULL
);

CREATE TABLE "public"."addresses" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "address_line_1" text NOT NULL,
    "address_line_2" text,
    "city" text NOT NULL,
    "state" text NOT NULL,
    "postal_code" text NOT NULL,
    "country" text DEFAULT 'USA'::text NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."orders" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "total_amount" numeric(10,2) NOT NULL,
    "status" public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    "shipping_address_id" uuid NOT NULL REFERENCES public.addresses(id),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."order_items" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "order_id" uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    "product_id" uuid NOT NULL REFERENCES public.products(id),
    "quantity" integer NOT NULL,
    "price" numeric(10,2) NOT NULL
);

CREATE TABLE "public"."reviews" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "product_id" uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "comment" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "public"."wishlists" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "product_id" uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT wishlists_user_id_product_id_key UNIQUE (user_id, product_id)
);

CREATE TABLE "public"."newsletter_subscribers" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "email" text NOT NULL UNIQUE,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Functions & Triggers for User Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function for User Order Statistics
CREATE OR REPLACE FUNCTION public.get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent numeric, total_orders bigint, pending_orders bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        COUNT(o.id) as total_orders,
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_orders
    FROM
        public.orders o
    WHERE
        o.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can see their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage their own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view items of their own orders" ON public.order_items FOR SELECT USING (exists(select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

CREATE POLICY "Users can manage their own reviews" ON public.reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public access to newsletter subscribers" ON public.newsletter_subscribers FOR ALL USING (true);


-- Seed Categories
INSERT INTO "public"."categories" ("name", "image_url", "data_ai_hint") VALUES
('Computers', 'https://source.unsplash.com/featured/600x400/?computer,laptop', 'computer laptop'),
('Smartphones', 'https://source.unsplash.com/featured/600x400/?smartphone,iphone', 'smartphone iphone'),
('Cameras', 'https://source.unsplash.com/featured/600x400/?camera,photography', 'camera photography'),
('Headphones', 'https://source.unsplash.com/featured/600x400/?headphones,audio', 'headphones audio'),
('Gaming', 'https://source.unsplash.com/featured/600x400/?gaming,console', 'gaming console'),
('Accessories', 'https://source.unsplash.com/featured/600x400/?tech,accessories', 'tech accessories');

-- Seed Products
DO $$
DECLARE
    computer_cat_id uuid;
    smartphone_cat_id uuid;
    camera_cat_id uuid;
    headphones_cat_id uuid;
    gaming_cat_id uuid;
    accessories_cat_id uuid;
BEGIN
    SELECT id INTO computer_cat_id FROM categories WHERE name = 'Computers';
    SELECT id INTO smartphone_cat_id FROM categories WHERE name = 'Smartphones';
    SELECT id INTO camera_cat_id FROM categories WHERE name = 'Cameras';
    SELECT id INTO headphones_cat_id FROM categories WHERE name = 'Headphones';
    SELECT id INTO gaming_cat_id FROM categories WHERE name = 'Gaming';
    SELECT id INTO accessories_cat_id FROM categories WHERE name = 'Accessories';

    INSERT INTO "public"."products" ("name", "description", "long_description", "price", "image_url", "data_ai_hint", "category_id", "is_featured", "is_best_seller") VALUES
    ('Pro Gaming Laptop', '16-inch high-performance gaming laptop.', 'Equipped with the latest processor and a dedicated graphics card, this laptop is built for competitive gaming. Features a 165Hz display and RGB keyboard.', 1499.99, 'https://source.unsplash.com/featured/600x400/?gaming,laptop', 'gaming laptop', computer_cat_id, true, true),
    ('Ultra-Thin Notebook', 'Sleek and lightweight 13-inch notebook for professionals.', 'With an all-day battery life and a stunning high-resolution display, this notebook is perfect for productivity on the go. Crafted from premium aluminum.', 999.00, 'https://source.unsplash.com/featured/600x400/?ultrabook,notebook', 'ultrabook notebook', computer_cat_id, true, false),
    ('Flagship Smartphone X', 'The latest smartphone with a pro-grade camera system.', 'Capture breathtaking photos and videos with the advanced triple-camera system. The vibrant 6.7-inch OLED display brings content to life.', 1099.00, 'https://source.unsplash.com/featured/600x400/?smartphone,pro', 'smartphone pro', smartphone_cat_id, true, true),
    ('Compact Mirrorless Camera', 'A versatile mirrorless camera for enthusiasts.', 'This camera packs a large sensor into a compact body, delivering exceptional image quality. Perfect for travel and everyday photography.', 850.50, 'https://source.unsplash.com/featured/600x400/?mirrorless,camera', 'mirrorless camera', camera_cat_id, true, false),
    ('Noise-Cancelling Headphones', 'Immerse yourself in sound with these wireless headphones.', 'Block out distractions and enjoy pure, high-fidelity audio. Features industry-leading noise cancellation and up to 30 hours of battery life.', 349.99, 'https://source.unsplash.com/featured/600x400/?wireless,headphones', 'wireless headphones', headphones_cat_id, true, true),
    ('Next-Gen Gaming Console', 'Experience the future of gaming.', 'Blazing-fast load times and breathtaking 4K graphics make this the ultimate gaming machine. Comes with one innovative wireless controller.', 499.99, 'https://source.unsplash.com/featured/600x400/?gaming,console,controller', 'gaming console', gaming_cat_id, true, false),
    ('Mechanical Keyboard', 'RGB mechanical keyboard with tactile switches.', 'Enjoy a superior typing and gaming experience with satisfying tactile feedback and customizable per-key RGB lighting.', 129.99, 'https://source.unsplash.com/featured/600x400/?mechanical,keyboard', 'mechanical keyboard', accessories_cat_id, false, true),
    ('4K Action Camera', 'Capture all your adventures in stunning 4K.', 'Waterproof, durable, and packed with features like image stabilization and slow-motion recording. Your perfect companion for any adventure.', 399.00, 'https://source.unsplash.com/featured/600x400/?action,camera', 'action camera', camera_cat_id, false, false);
END $$;
