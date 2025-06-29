-- Drop existing tables, functions, and types
DROP TABLE IF EXISTS "public"."wishlists" CASCADE;
DROP TABLE IF EXISTS "public"."reviews" CASCADE;
DROP TABLE IF EXISTS "public"."order_items" CASCADE;
DROP TABLE IF EXISTS "public"."orders" CASCADE;
DROP TABLE IF EXISTS "public"."addresses" CASCADE;
DROP TABLE IF EXISTS "public"."products" CASCADE;
DROP TABLE IF EXISTS "public"."categories" CASCADE;
DROP TABLE IF EXISTS "public"."user_profiles" CASCADE;
DROP TABLE IF EXISTS "public"."newsletter_subscribers" CASCADE;
DROP FUNCTION IF EXISTS "public"."get_user_order_stats" CASCADE;
DROP TYPE IF EXISTS "public"."order_status" CASCADE;

-- Create ENUM types
CREATE TYPE public.order_status AS ENUM (
    'pending',
    'shipped',
    'delivered',
    'cancelled'
);

-- Create Tables
CREATE TABLE "public"."categories" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "name" character varying NOT NULL,
    "image_url" character varying NOT NULL,
    "data_ai_hint" character varying NOT NULL
);
ALTER TABLE "public"."categories" OWNER TO "postgres";
ALTER TABLE ONLY "public"."categories" ADD CONSTRAINT "categories_pkey" PRIMARY KEY (id);

CREATE TABLE "public"."products" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "name" character varying NOT NULL,
    "description" text NOT NULL,
    "long_description" text NOT NULL,
    "price" real NOT NULL,
    "image_url" character varying NOT NULL,
    "data_ai_hint" character varying NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "is_best_seller" boolean DEFAULT false NOT NULL,
    "category_id" uuid
);
ALTER TABLE "public"."products" OWNER TO "postgres";
ALTER TABLE ONLY "public"."products" ADD CONSTRAINT "products_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE TABLE "public"."user_profiles" (
    "id" uuid NOT NULL,
    "full_name" text,
    "avatar_url" text,
    "role" character varying DEFAULT 'user' NOT NULL
);
ALTER TABLE "public"."user_profiles" OWNER TO "postgres";
ALTER TABLE ONLY "public"."user_profiles" ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."addresses" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "user_id" uuid NOT NULL,
    "address_line_1" character varying NOT NULL,
    "address_line_2" character varying,
    "city" character varying NOT NULL,
    "state" character varying NOT NULL,
    "postal_code" character varying NOT NULL,
    "country" character varying DEFAULT 'USA'::character varying NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL
);
ALTER TABLE "public"."addresses" OWNER TO "postgres";
ALTER TABLE ONLY "public"."addresses" ADD CONSTRAINT "addresses_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."orders" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "user_id" uuid NOT NULL,
    "total_amount" real NOT NULL,
    "status" public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    "shipping_address_id" uuid NOT NULL
);
ALTER TABLE "public"."orders" OWNER TO "postgres";
ALTER TABLE ONLY "public"."orders" ADD CONSTRAINT "orders_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY (shipping_address_id) REFERENCES public.addresses(id) ON DELETE RESTRICT;

CREATE TABLE "public"."order_items" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "order_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "quantity" integer NOT NULL,
    "price" real NOT NULL
);
ALTER TABLE "public"."order_items" OWNER TO "postgres";
ALTER TABLE ONLY "public"."order_items" ADD CONSTRAINT "order_items_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

CREATE TABLE "public"."reviews" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "user_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "rating" integer NOT NULL,
    "comment" text,
    CONSTRAINT "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5)))
);
ALTER TABLE "public"."reviews" OWNER TO "postgres";
ALTER TABLE ONLY "public"."reviews" ADD CONSTRAINT "reviews_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

CREATE TABLE "public"."wishlists" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "user_id" uuid NOT NULL,
    "product_id" uuid NOT NULL
);
ALTER TABLE "public"."wishlists" OWNER TO "postgres";
ALTER TABLE ONLY "public"."wishlists" ADD CONSTRAINT "wishlists_pkey" PRIMARY KEY (id);
ALTER TABLE "public"."wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE "public"."wishlists" ADD CONSTRAINT "wishlists_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE ONLY "public"."wishlists" ADD CONSTRAINT "wishlist_user_product_unique" UNIQUE (user_id, product_id);

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "public"."newsletter_subscribers" OWNER TO "postgres";
ALTER TABLE ONLY "public"."newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "public"."newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE (email);


-- Create Functions
CREATE OR REPLACE FUNCTION public.get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent double precision, total_orders bigint, pending_orders bigint)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(o.total_amount), 0)::double precision AS total_spent,
        COUNT(o.id)::bigint AS total_orders,
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END)::bigint AS pending_orders
    FROM
        public.orders o
    WHERE
        o.user_id = p_user_id;
END;
$$;
ALTER FUNCTION "public"."get_user_order_stats"(p_user_id uuid) OWNER TO "postgres";

-- Seed Data
INSERT INTO public.categories (name, image_url, data_ai_hint) VALUES
('Computers', 'https://source.unsplash.com/600x400/?computer,laptop', 'computer laptop'),
('Smartphones', 'https://source.unsplash.com/600x400/?smartphone,iphone', 'smartphone iphone'),
('Cameras', 'https://source.unsplash.com/600x400/?camera,photography', 'camera photography'),
('Headphones', 'https://source.unsplash.com/600x400/?headphones,audio', 'headphones audio'),
('Gaming', 'https://source.unsplash.com/600x400/?gaming,console', 'gaming console'),
('Accessories', 'https://source.unsplash.com/600x400/?tech,accessories', 'tech accessories');

DO $$
DECLARE
    computers_cat_id uuid;
    smartphones_cat_id uuid;
    cameras_cat_id uuid;
    headphones_cat_id uuid;
    gaming_cat_id uuid;
    accessories_cat_id uuid;
BEGIN
    SELECT id INTO computers_cat_id FROM public.categories WHERE name = 'Computers';
    SELECT id INTO smartphones_cat_id FROM public.categories WHERE name = 'Smartphones';
    SELECT id INTO cameras_cat_id FROM public.categories WHERE name = 'Cameras';
    SELECT id INTO headphones_cat_id FROM public.categories WHERE name = 'Headphones';
    SELECT id INTO gaming_cat_id FROM public.categories WHERE name = 'Gaming';
    SELECT id INTO accessories_cat_id FROM public.categories WHERE name = 'Accessories';

    INSERT INTO public.products (name, description, long_description, price, image_url, data_ai_hint, is_featured, is_best_seller, category_id) VALUES
    ('Pro Gaming Laptop', '16-inch high-performance gaming laptop.', 'Equipped with the latest processor and a dedicated graphics card, this laptop is built for competitive gaming. Features a 165Hz display and RGB keyboard.', 1499.99, 'https://source.unsplash.com/600x400/?gaming,laptop', 'gaming laptop', true, true, computers_cat_id),
    ('Ultra-Thin Notebook', 'Sleek and lightweight 13-inch notebook for professionals.', 'With an all-day battery life and a stunning high-resolution display, this notebook is perfect for productivity on the go. Crafted from premium aluminum.', 999.00, 'https://source.unsplash.com/600x400/?ultrabook,notebook', 'ultrabook notebook', true, false, computers_cat_id),
    ('Flagship Smartphone X', 'The latest smartphone with a pro-grade camera system.', 'Capture breathtaking photos and videos with the advanced triple-camera system. The vibrant 6.7-inch OLED display brings content to life.', 1099.00, 'https://source.unsplash.com/600x400/?smartphone,pro', 'smartphone pro', true, true, smartphones_cat_id),
    ('Compact Mirrorless Camera', 'A versatile mirrorless camera for enthusiasts.', 'This camera packs a large sensor into a compact body, delivering exceptional image quality. Perfect for travel and everyday photography.', 850.50, 'https://source.unsplash.com/600x400/?mirrorless,camera', 'mirrorless camera', true, false, cameras_cat_id),
    ('Noise-Cancelling Headphones', 'Immerse yourself in sound with these wireless headphones.', 'Block out distractions and enjoy pure, high-fidelity audio. Features industry-leading noise cancellation and up to 30 hours of battery life.', 349.99, 'https://source.unsplash.com/600x400/?wireless,headphones', 'wireless headphones', true, true, headphones_cat_id),
    ('Next-Gen Gaming Console', 'Experience the future of gaming.', 'Blazing-fast load times and breathtaking 4K graphics make this the ultimate gaming machine. Comes with one innovative wireless controller.', 499.99, 'https://source.unsplash.com/600x400/?gaming,console,controller', 'gaming console', true, false, gaming_cat_id),
    ('Mechanical Keyboard', 'RGB mechanical keyboard with tactile switches.', 'Enjoy a superior typing and gaming experience with satisfying tactile feedback and customizable per-key RGB lighting.', 129.99, 'https://source.unsplash.com/600x400/?mechanical,keyboard', 'mechanical keyboard', false, true, accessories_cat_id),
    ('4K Action Camera', 'Capture all your adventures in stunning 4K.', 'Waterproof, durable, and packed with features like image stabilization and slow-motion recording. Your perfect companion for any adventure.', 399.00, 'https://source.unsplash.com/600x400/?action,camera', 'action camera', false, false, cameras_cat_id),
    ('Smartwatch Series 8', 'Stay connected and track your health.', 'Monitor your workouts, heart rate, and sleep. Receive notifications and reply to messages right from your wrist.', 429.00, 'https://source.unsplash.com/600x400/?smartwatch,wearable', 'smartwatch wearable', false, true, accessories_cat_id),
    ('Wireless Charging Pad', 'Fast wireless charging for all your devices.', 'Simply place your compatible smartphone or earbuds on the pad for fast, convenient charging. Sleek, minimalist design.', 49.99, 'https://source.unsplash.com/600x400/?wireless,charger', 'wireless charger', false, false, accessories_cat_id);
END $$;
