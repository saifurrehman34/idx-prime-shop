-- Drop existing tables to start fresh
DROP TABLE IF EXISTS "wishlists" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "addresses" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "brands" CASCADE;
DROP TABLE IF EXISTS "blog_posts" CASCADE;
DROP TABLE IF EXISTS "testimonials" CASCADE;
DROP TABLE IF EXISTS "offers" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "newsletter_subscribers" CASCADE;
DROP TABLE IF EXISTS "user_profiles" CASCADE;

-- Drop existing enums and functions
DROP TYPE IF EXISTS "order_status";
DROP FUNCTION IF EXISTS "get_user_order_stats";
DROP FUNCTION IF EXISTS "execute_sql";

-- Create Enums
CREATE TYPE "order_status" AS ENUM ('pending', 'shipped', 'delivered', 'cancelled');

-- Create Tables

-- User Profiles Table
CREATE TABLE "user_profiles" (
  "id" uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "full_name" text,
  "avatar_url" text,
  "role" text NOT NULL DEFAULT 'user'
);
-- Function to create a user profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Categories Table
CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "image_url" text NOT NULL,
  "data_ai_hint" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Products Table
CREATE TABLE "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text NOT NULL,
  "long_description" text NOT NULL,
  "price" numeric(10, 2) NOT NULL,
  "image_url" text NOT NULL,
  "data_ai_hint" text NOT NULL,
  "is_featured" boolean NOT NULL DEFAULT false,
  "is_best_seller" boolean NOT NULL DEFAULT false,
  "category_id" uuid REFERENCES "categories"("id") ON DELETE SET NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Addresses Table
CREATE TABLE "addresses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "address_line_1" text NOT NULL,
  "address_line_2" text,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "postal_code" text NOT NULL,
  "country" text NOT NULL DEFAULT 'USA',
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Orders Table
CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "total_amount" numeric(10, 2) NOT NULL,
  "status" order_status NOT NULL DEFAULT 'pending',
  "shipping_address_id" uuid NOT NULL REFERENCES "addresses"("id"),
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Order Items Table
CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "product_id" uuid NOT NULL REFERENCES "products"("id"),
  "quantity" integer NOT NULL,
  "price" numeric(10, 2) NOT NULL
);

-- Reviews Table
CREATE TABLE "reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "comment" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Wishlists Table
CREATE TABLE "wishlists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  UNIQUE("user_id", "product_id")
);

-- Newsletter Subscribers Table
CREATE TABLE "newsletter_subscribers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "created_at" timestamptz NOT NULL DEFAULT now()
);


-- Insert data into Categories
INSERT INTO "categories" ("name", "image_url", "data_ai_hint") VALUES
('Smartphones', 'https://source.unsplash.com/600x400/?smartphone,iphone', 'smartphone iphone'),
('Computers', 'https://source.unsplash.com/600x400/?computer,laptop', 'computer laptop'),
('Cameras', 'https://source.unsplash.com/600x400/?camera,photography', 'camera photography'),
('Headphones', 'https://source.unsplash.com/600x400/?headphones,audio', 'headphones audio'),
('Gaming', 'https://source.unsplash.com/600x400/?gaming,console', 'gaming console'),
('Accessories', 'https://source.unsplash.com/600x400/?tech,accessories', 'tech accessories');

-- Get Category IDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$
DECLARE
    smartphones_cat_id uuid := (SELECT id FROM categories WHERE name = 'Smartphones');
    computers_cat_id uuid := (SELECT id FROM categories WHERE name = 'Computers');
    cameras_cat_id uuid := (SELECT id FROM categories WHERE name = 'Cameras');
    headphones_cat_id uuid := (SELECT id FROM categories WHERE name = 'Headphones');
    gaming_cat_id uuid := (SELECT id FROM categories WHERE name = 'Gaming');
    accessories_cat_id uuid := (SELECT id FROM categories WHERE name = 'Accessories');
BEGIN
-- Insert data into Products
INSERT INTO "products" ("name", "description", "long_description", "price", "image_url", "data_ai_hint", "is_featured", "is_best_seller", "category_id") VALUES
('Pro Gaming Laptop', '16-inch high-performance gaming laptop.', 'Equipped with the latest processor and a dedicated graphics card, this laptop is built for competitive gaming. Features a 165Hz display and RGB keyboard.', 1499.99, 'https://source.unsplash.com/600x400/?gaming,laptop', 'gaming laptop', true, true, computers_cat_id),
('Ultra-Thin Notebook', 'Sleek and lightweight 13-inch notebook for professionals.', 'With an all-day battery life and a stunning high-resolution display, this notebook is perfect for productivity on the go. Crafted from premium aluminum.', 999.00, 'https://source.unsplash.com/600x400/?ultrabook,notebook', 'ultrabook notebook', true, false, computers_cat_id),
('Flagship Smartphone X', 'The latest smartphone with a pro-grade camera system.', 'Capture breathtaking photos and videos with the advanced triple-camera system. The vibrant 6.7-inch OLED display brings content to life.', 1099.00, 'https://source.unsplash.com/600x400/?smartphone,pro', 'smartphone pro', true, true, smartphones_cat_id),
('Compact Mirrorless Camera', 'A versatile mirrorless camera for enthusiasts.', 'This camera packs a large sensor into a compact body, delivering exceptional image quality. Perfect for travel and everyday photography.', 850.50, 'https://source.unsplash.com/600x400/?mirrorless,camera', 'mirrorless camera', true, false, cameras_cat_id),
('Noise-Cancelling Headphones', 'Immerse yourself in sound with these wireless headphones.', 'Block out distractions and enjoy pure, high-fidelity audio. Features industry-leading noise cancellation and up to 30 hours of battery life.', 349.99, 'https://source.unsplash.com/600x400/?wireless,headphones', 'wireless headphones', true, true, headphones_cat_id),
('Next-Gen Gaming Console', 'Experience the future of gaming.', 'Blazing-fast load times and breathtaking 4K graphics make this the ultimate gaming machine. Comes with one innovative wireless controller.', 499.99, 'https://source.unsplash.com/600x400/?gaming,console,controller', 'gaming console', true, false, gaming_cat_id),
('Mechanical Keyboard', 'RGB mechanical keyboard with tactile switches.', 'Enjoy a superior typing and gaming experience with satisfying tactile feedback and customizable per-key RGB lighting.', 129.99, 'https://source.unsplash.com/600x400/?mechanical,keyboard', 'mechanical keyboard', false, true, accessories_cat_id),
('4K Action Camera', 'Capture all your adventures in stunning 4K.', 'Waterproof, durable, and packed with features like image stabilization and slow-motion recording. Your perfect companion for any adventure.', 399.00, 'https://source.unsplash.com/600x400/?action,camera', 'action camera', false, false, cameras_cat_id),
('Ergonomic Wireless Mouse', 'A high-precision mouse for work and play.', 'Designed for comfort and long hours of use, this mouse features customizable buttons and a long-lasting battery.', 79.99, 'https://source.unsplash.com/600x400/?computer,mouse', 'computer mouse', false, false, accessories_cat_id),
('Portable Power Bank', '20,000mAh power bank to charge your devices on the go.', 'With dual USB ports and fast-charging technology, you can keep your phone and tablet powered up wherever you are.', 49.99, 'https://source.unsplash.com/600x400/?power,bank', 'power bank', false, false, accessories_cat_id);
END $$;

-- Create Functions

-- Function for admin to execute arbitrary SQL
CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql;

-- Function to get user order stats
CREATE OR REPLACE FUNCTION get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent numeric, total_orders bigint, pending_orders bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(o.total_amount), 0.00)::numeric AS total_spent,
    COUNT(o.id)::bigint AS total_orders,
    COUNT(CASE WHEN o.status = 'pending' THEN 1 END)::bigint AS pending_orders
  FROM
    orders o
  WHERE
    o.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;


-- RLS Policies

-- Enable RLS for all tables
ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wishlists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_subscribers" ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON "user_profiles" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON "user_profiles" FOR UPDATE USING (auth.uid() = id);

-- Policies for categories
CREATE POLICY "Public can view categories" ON "categories" FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON "categories" FOR ALL USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Policies for products
CREATE POLICY "Public can view products" ON "products" FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON "products" FOR ALL USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Policies for addresses
CREATE POLICY "Users can view their own addresses" ON "addresses" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own addresses" ON "addresses" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses" ON "addresses" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own addresses" ON "addresses" FOR DELETE USING (auth.uid() = user_id);

-- Policies for orders
CREATE POLICY "Users can view their own orders" ON "orders" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON "orders" FOR SELECT USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Users can create their own orders" ON "orders" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON "orders" FOR UPDATE USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Policies for order_items
CREATE POLICY "Users can view items in their own orders" ON "order_items" FOR SELECT USING (
  (SELECT user_id FROM orders WHERE id = order_id) = auth.uid()
);
CREATE POLICY "Admins can view all order items" ON "order_items" FOR SELECT USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Users can create items for their own orders" ON "order_items" FOR INSERT WITH CHECK (
  (SELECT user_id FROM orders WHERE id = order_id) = auth.uid()
);

-- Policies for reviews
CREATE POLICY "Public can view reviews" ON "reviews" FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON "reviews" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON "reviews" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON "reviews" FOR DELETE USING (auth.uid() = user_id);

-- Policies for wishlists
CREATE POLICY "Users can view their own wishlist" ON "wishlists" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into their own wishlist" ON "wishlists" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from their own wishlist" ON "wishlists" FOR DELETE USING (auth.uid() = user_id);

-- Policies for newsletter_subscribers
CREATE POLICY "Public can subscribe to newsletter" ON "newsletter_subscribers" FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscribers" ON "newsletter_subscribers" FOR SELECT USING (
  (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);
