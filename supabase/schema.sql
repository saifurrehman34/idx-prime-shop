-- Drop existing objects to ensure a clean slate
-- Using CASCADE to handle dependencies automatically
DROP FUNCTION IF EXISTS public.execute_sql(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_stats() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_order_stats(uuid) CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.testimonials CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;

DROP TYPE IF EXISTS public.order_status CASCADE;

-- Create Enumerated Type for Order Status
CREATE TYPE public.order_status AS ENUM (
    'pending',
    'shipped',
    'delivered',
    'cancelled'
);

-- Create Tables
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    image_url character varying NOT NULL,
    data_ai_hint character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name character varying NOT NULL,
    description text NOT NULL,
    long_description text NOT NULL,
    price numeric(10, 2) NOT NULL,
    image_url character varying NOT NULL,
    data_ai_hint character varying NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_best_seller boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name character varying,
    avatar_url character varying,
    role character varying DEFAULT 'user'::character varying NOT NULL
);

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    total_amount numeric(10, 2) NOT NULL,
    shipping_address_id uuid
);

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity integer NOT NULL,
    price numeric(10, 2) NOT NULL
);

CREATE TABLE public.wishlists (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT wishlists_user_id_product_id_key UNIQUE (user_id, product_id)
);

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email character varying NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Functions and Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(total_users bigint, total_products bigint, total_orders bigint, total_revenue numeric)
LANGUAGE sql
AS $$
    SELECT
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM public.products) as total_products,
        (SELECT COUNT(*) FROM public.orders) as total_orders,
        (SELECT SUM(total_amount) FROM public.orders WHERE status = 'delivered') as total_revenue;
$$;

CREATE OR REPLACE FUNCTION public.get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent numeric, total_orders bigint, pending_orders bigint)
LANGUAGE sql
AS $$
    SELECT
        (SELECT SUM(total_amount) FROM public.orders WHERE user_id = p_user_id AND status = 'delivered') as total_spent,
        (SELECT COUNT(*) FROM public.orders WHERE user_id = p_user_id) as total_orders,
        (SELECT COUNT(*) FROM public.orders WHERE user_id = p_user_id AND status = 'pending') as pending_orders;
$$;

-- Function to execute arbitrary SQL, owned by postgres to bypass RLS
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS SETOF record
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY EXECUTE sql_query;
END;
$$;
ALTER FUNCTION public.execute_sql(text) OWNER TO postgres;

-- Insert Seed Data
-- Categories
INSERT INTO public.categories (name, image_url, data_ai_hint) VALUES
('Computers', 'https://source.unsplash.com/600x400/?computer,laptop', 'computer laptop'),
('Smartphones', 'https://source.unsplash.com/600x400/?smartphone,iphone', 'smartphone iphone'),
('Cameras', 'https://source.unsplash.com/600x400/?camera,photography', 'camera photography'),
('Headphones', 'https://source.unsplash.com/600x400/?headphones,audio', 'headphones audio'),
('Gaming', 'https://source.unsplash.com/600x400/?gaming,console', 'gaming console'),
('Accessories', 'https://source.unsplash.com/600x400/?tech,accessories', 'tech accessories');

-- Products
WITH category_ids AS (
    SELECT id, name FROM public.categories
)
INSERT INTO public.products (name, description, long_description, price, image_url, data_ai_hint, category_id, is_featured, is_best_seller) VALUES
('Pro Gaming Laptop', '16-inch high-performance gaming laptop.', 'Equipped with the latest processor and a dedicated graphics card, this laptop is built for competitive gaming. Features a 165Hz display and RGB keyboard.', 1499.99, 'https://source.unsplash.com/600x400/?gaming,laptop', 'gaming laptop', (SELECT id FROM category_ids WHERE name = 'Computers'), true, true),
('Ultra-Thin Notebook', 'Sleek and lightweight 13-inch notebook for professionals.', 'With an all-day battery life and a stunning high-resolution display, this notebook is perfect for productivity on the go. Crafted from premium aluminum.', 999.00, 'https://source.unsplash.com/600x400/?ultrabook,notebook', 'ultrabook notebook', (SELECT id FROM category_ids WHERE name = 'Computers'), true, false),
('Flagship Smartphone X', 'The latest smartphone with a pro-grade camera system.', 'Capture breathtaking photos and videos with the advanced triple-camera system. The vibrant 6.7-inch OLED display brings content to life.', 1099.00, 'https://source.unsplash.com/600x400/?smartphone,pro', 'smartphone pro', (SELECT id FROM category_ids WHERE name = 'Smartphones'), true, true),
('Compact Mirrorless Camera', 'A versatile mirrorless camera for enthusiasts.', 'This camera packs a large sensor into a compact body, delivering exceptional image quality. Perfect for travel and everyday photography.', 850.50, 'https://source.unsplash.com/600x400/?mirrorless,camera', 'mirrorless camera', (SELECT id FROM category_ids WHERE name = 'Cameras'), true, false),
('Noise-Cancelling Headphones', 'Immerse yourself in sound with these wireless headphones.', 'Block out distractions and enjoy pure, high-fidelity audio. Features industry-leading noise cancellation and up to 30 hours of battery life.', 349.99, 'https://source.unsplash.com/600x400/?wireless,headphones', 'wireless headphones', (SELECT id FROM category_ids WHERE name = 'Headphones'), true, true),
('Next-Gen Gaming Console', 'Experience the future of gaming.', 'Blazing-fast load times and breathtaking 4K graphics make this the ultimate gaming machine. Comes with one innovative wireless controller.', 499.99, 'https://source.unsplash.com/600x400/?gaming,console,controller', 'gaming console', (SELECT id FROM category_ids WHERE name = 'Gaming'), true, false),
('Mechanical Keyboard', 'RGB mechanical keyboard with tactile switches.', 'Enjoy a superior typing and gaming experience with satisfying tactile feedback and customizable per-key RGB lighting.', 129.99, 'https://source.unsplash.com/600x400/?mechanical,keyboard', 'mechanical keyboard', (SELECT id FROM category_ids WHERE name = 'Accessories'), false, true),
('4K Action Camera', 'Capture all your adventures in stunning 4K.', 'Waterproof, durable, and packed with features like image stabilization and slow-motion recording. Your perfect companion for any adventure.', 399.00, 'https://source.unsplash.com/600x400/?action,camera', 'action camera', (SELECT id FROM category_ids WHERE name = 'Cameras'), false, false);

-- Grant usage on the public schema to the authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
-- Grant select permissions on all tables to the authenticated role
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
