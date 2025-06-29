-- Reassign ownership of all tables to postgres role to allow dropping
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO postgres;';
    END LOOP;
END $$;

-- Drop existing tables
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

-- Drop existing types
DROP TYPE IF EXISTS public.order_status;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_order_stats(p_user_id uuid) CASCADE;
DROP FUNCTION IF EXISTS public.execute_sql(sql_query text) CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_stats() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create ENUM types
CREATE TYPE public.order_status AS ENUM (
    'pending',
    'shipped',
    'delivered',
    'cancelled'
);

-- Create Tables
CREATE TABLE public.user_profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    role text NOT NULL DEFAULT 'user'
);

CREATE TABLE public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name character varying(255) NOT NULL,
    image_url text NOT NULL,
    data_ai_hint text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name character varying(255) NOT NULL,
    description text NOT NULL,
    long_description text NOT NULL,
    price numeric(10, 2) NOT NULL,
    image_url text NOT NULL,
    data_ai_hint text NOT NULL,
    category_id uuid REFERENCES public.categories(id),
    is_featured boolean DEFAULT false NOT NULL,
    is_best_seller boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount numeric(10, 2) NOT NULL,
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    shipping_address_id uuid REFERENCES public.addresses(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id),
    quantity integer NOT NULL,
    price numeric(10, 2) NOT NULL
);

CREATE TABLE public.addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text NOT NULL DEFAULT 'USA',
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.wishlists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (user_id, product_id)
);

CREATE TABLE public.newsletter_subscribers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


-- Functions and Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent numeric, total_orders bigint, pending_orders bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(o.total_amount), 0.00) AS total_spent,
        COUNT(o.id) AS total_orders,
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END) AS pending_orders
    FROM
        public.orders o
    WHERE
        o.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS SETOF record
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY EXECUTE sql_query;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(total_users bigint, total_products bigint, total_orders bigint, total_revenue numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM auth.users) AS total_users,
        (SELECT COUNT(*) FROM public.products) AS total_products,
        (SELECT COUNT(*) FROM public.orders) AS total_orders,
        COALESCE((SELECT SUM(total_amount) FROM public.orders WHERE status = 'delivered'), 0.00) AS total_revenue;
END;
$$ LANGUAGE plpgsql;

-- Insert data
INSERT INTO public.categories (name, image_url, data_ai_hint) VALUES
('Computers', 'https://source.unsplash.com/random/600x400/?computer,laptop', 'computer laptop'),
('Smartphones', 'https://source.unsplash.com/random/600x400/?smartphone,iphone', 'smartphone iphone'),
('Cameras', 'https://source.unsplash.com/random/600x400/?camera,photography', 'camera photography'),
('Headphones', 'https://source.unsplash.com/random/600x400/?headphones,audio', 'headphones audio'),
('Gaming', 'https://source.unsplash.com/random/600x400/?gaming,console', 'gaming console'),
('Accessories', 'https://source.unsplash.com/random/600x400/?tech,accessories', 'tech accessories');

INSERT INTO public.products (name, description, long_description, price, image_url, data_ai_hint, category_id, is_featured, is_best_seller) VALUES
('Pro Gaming Laptop', '16-inch high-performance gaming laptop.', 'Equipped with the latest processor and a dedicated graphics card, this laptop is built for competitive gaming. Features a 165Hz display and RGB keyboard.', 1499.99, 'https://source.unsplash.com/random/600x400/?gaming,laptop', 'gaming laptop', (SELECT id from categories WHERE name = 'Computers'), true, true),
('Ultra-Thin Notebook', 'Sleek and lightweight 13-inch notebook for professionals.', 'With an all-day battery life and a stunning high-resolution display, this notebook is perfect for productivity on the go. Crafted from premium aluminum.', 999.00, 'https://source.unsplash.com/random/600x400/?ultrabook,notebook', 'ultrabook notebook', (SELECT id from categories WHERE name = 'Computers'), true, false),
('Flagship Smartphone X', 'The latest smartphone with a pro-grade camera system.', 'Capture breathtaking photos and videos with the advanced triple-camera system. The vibrant 6.7-inch OLED display brings content to life.', 1099.00, 'https://source.unsplash.com/random/600x400/?smartphone,pro', 'smartphone pro', (SELECT id from categories WHERE name = 'Smartphones'), true, true),
('Compact Mirrorless Camera', 'A versatile mirrorless camera for enthusiasts.', 'This camera packs a large sensor into a compact body, delivering exceptional image quality. Perfect for travel and everyday photography.', 850.50, 'https://source.unsplash.com/random/600x400/?mirrorless,camera', 'mirrorless camera', (SELECT id from categories WHERE name = 'Cameras'), true, false),
('Noise-Cancelling Headphones', 'Immerse yourself in sound with these wireless headphones.', 'Block out distractions and enjoy pure, high-fidelity audio. Features industry-leading noise cancellation and up to 30 hours of battery life.', 349.99, 'https://source.unsplash.com/random/600x400/?wireless,headphones', 'wireless headphones', (SELECT id from categories WHERE name = 'Headphones'), true, true),
('Next-Gen Gaming Console', 'Experience the future of gaming.', 'Blazing-fast load times and breathtaking 4K graphics make this the ultimate gaming machine. Comes with one innovative wireless controller.', 499.99, 'https://source.unsplash.com/random/600x400/?gaming,console,controller', 'gaming console', (SELECT id from categories WHERE name = 'Gaming'), true, false),
('Mechanical Keyboard', 'RGB mechanical keyboard with tactile switches.', 'Enjoy a superior typing and gaming experience with satisfying tactile feedback and customizable per-key RGB lighting.', 129.99, 'https://source.unsplash.com/random/600x400/?mechanical,keyboard', 'mechanical keyboard', (SELECT id from categories WHERE name = 'Accessories'), false, true),
('4K Action Camera', 'Capture all your adventures in stunning 4K.', 'Waterproof, durable, and packed with features like image stabilization and slow-motion recording. Your perfect companion for any adventure.', 399.00, 'https://source.unsplash.com/random/600x400/?action,camera', 'action camera', (SELECT id from categories WHERE name = 'Cameras'), false, false);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
