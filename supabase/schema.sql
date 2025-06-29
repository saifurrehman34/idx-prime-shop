-- Drop existing tables to start fresh
DROP TABLE IF EXISTS "newsletter_subscribers" CASCADE;
DROP TABLE IF EXISTS "brands" CASCADE;
DROP TABLE IF EXISTS "blog_posts" CASCADE;
DROP TABLE IF EXISTS "testimonials" CASCADE;
DROP TABLE IF EXISTS "offers" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;

-- Create Categories Table
CREATE TABLE "categories" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "image_url" text NOT NULL,
    "data_ai_hint" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Products Table
CREATE TABLE "products" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "price" real NOT NULL,
    "image_url" text NOT NULL,
    "description" text NOT NULL,
    "long_description" text NOT NULL,
    "data_ai_hint" text NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "category_id" uuid REFERENCES categories(id) ON DELETE SET NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Offers Table
CREATE TABLE "offers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "description" text NOT NULL,
    "image_url" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Testimonials Table
CREATE TABLE "testimonials" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "quote" text NOT NULL,
    "rating" smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
    "image_url" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Blog Posts Table
CREATE TABLE "blog_posts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "content" text NOT NULL,
    "image_url" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Brands Table
CREATE TABLE "brands" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" text NOT NULL,
    "image_url" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Newsletter Subscribers Table
CREATE TABLE "newsletter_subscribers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" text NOT NULL UNIQUE,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);


-- Enable Row Level Security (RLS)
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "offers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "testimonials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blog_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "brands" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_subscribers" ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Allow public read access to most tables
CREATE POLICY "Public read access for categories" ON "categories" FOR SELECT USING (true);
CREATE POLICY "Public read access for products" ON "products" FOR SELECT USING (true);
CREATE POLICY "Public read access for offers" ON "offers" FOR SELECT USING (true);
CREATE POLICY "Public read access for testimonials" ON "testimonials" FOR SELECT USING (true);
CREATE POLICY "Public read access for blog_posts" ON "blog_posts" FOR SELECT USING (true);
CREATE POLICY "Public read access for brands" ON "brands" FOR SELECT USING (true);

-- Allow public insert access for newsletter subscribers
CREATE POLICY "Public insert for newsletter subscribers" ON "newsletter_subscribers" FOR INSERT WITH CHECK (true);


-- Seed Data
-- Seed Categories
INSERT INTO "categories" ("name", "image_url", "data_ai_hint") VALUES
('Vegetables', 'https://placehold.co/400x400.png', 'fresh vegetables'),
('Fruits', 'https://placehold.co/400x400.png', 'assorted fruits'),
('Bakery', 'https://placehold.co/400x400.png', 'artisan bread'),
('Dairy', 'https://placehold.co/400x400.png', 'dairy products'),
('Pantry', 'https://placehold.co/400x400.png', 'pantry staples'),
('Meats', 'https://placehold.co/400x400.png', 'fresh meat');

-- Seed Products
DO $$
DECLARE
    avocado_id uuid := gen_random_uuid();
    strawberry_id uuid := gen_random_uuid();
    sourdough_id uuid := gen_random_uuid();
    eggs_id uuid := gen_random_uuid();
    tomatoes_id uuid := gen_random_uuid();
    olive_oil_id uuid := gen_random_uuid();
    fruits_cat_id uuid;
    vegetables_cat_id uuid;
    bakery_cat_id uuid;
    dairy_cat_id uuid;
    pantry_cat_id uuid;
BEGIN
    SELECT id INTO fruits_cat_id FROM categories WHERE name = 'Fruits';
    SELECT id INTO vegetables_cat_id FROM categories WHERE name = 'Vegetables';
    SELECT id INTO bakery_cat_id FROM categories WHERE name = 'Bakery';
    SELECT id INTO dairy_cat_id FROM categories WHERE name = 'Dairy';
    SELECT id INTO pantry_cat_id FROM categories WHERE name = 'Pantry';

    INSERT INTO "products" ("id", "name", "price", "image_url", "data_ai_hint", "description", "long_description", "is_featured", "category_id", "created_at") VALUES
    (avocado_id, 'Organic Avocados', 4.99, 'https://placehold.co/600x400.png', 'organic avocados', 'Pack of 4 creamy, organic Hass avocados.', 'Our organic Hass avocados are grown in nutrient-rich soil... Perfect for toast, salads, or guacamole.', true, fruits_cat_id, now() - interval '5 day'),
    (strawberry_id, 'Fresh Strawberries', 3.49, 'https://placehold.co/600x400.png', 'fresh strawberries', '1 lb of sweet, juicy strawberries.', 'Hand-picked at peak ripeness, our strawberries are bursting with sweet, natural flavor.', true, fruits_cat_id, now() - interval '4 day'),
    (sourdough_id, 'Artisanal Sourdough', 5.99, 'https://placehold.co/600x400.png', 'sourdough bread', 'A freshly baked loaf of artisanal sourdough bread.', 'Baked daily using a traditional starter, our sourdough has a delightful tangy flavor.', true, bakery_cat_id, now() - interval '1 day'),
    (eggs_id, 'Free-Range Eggs', 6.29, 'https://placehold.co/600x400.png', 'free-range eggs', 'One dozen large brown free-range eggs.', 'Our hens are free to roam on open pastures, resulting in eggs with rich, flavorful yolks.', false, dairy_cat_id, now() - interval '3 day'),
    (tomatoes_id, 'Heirloom Tomatoes', 4.79, 'https://placehold.co/600x400.png', 'heirloom tomatoes', 'A mix of colorful and flavorful heirloom tomatoes.', 'Experience the vibrant colors and diverse flavors of our heirloom tomatoes.', true, vegetables_cat_id, now() - interval '2 day'),
    (olive_oil_id, 'Cold-Pressed Olive Oil', 12.99, 'https://placehold.co/600x400.png', 'olive oil', '500ml bottle of extra virgin olive oil.', 'Our extra virgin olive oil is cold-pressed from the finest olives to preserve its natural antioxidants.', false, pantry_cat_id, now());
END $$;
