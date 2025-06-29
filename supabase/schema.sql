
-- 1. CLEANUP: Drop existing objects to ensure a clean slate.
-- This makes the script idempotent (runnable multiple times).

-- Drop Triggers first as they depend on functions and tables.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop Functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_order_stats(uuid);
DROP FUNCTION IF EXISTS public.execute_sql(text);

-- Drop Tables. The `CASCADE` keyword automatically removes dependent objects like policies.
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.addresses;
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.wishlists;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.user_profiles;
DROP TABLE IF EXISTS public.newsletter_subscribers;
DROP TABLE IF EXISTS public.brands;
DROP TABLE IF EXISTS public.blog_posts;
DROP TABLE IF EXISTS public.offers;
DROP TABLE IF EXISTS public.testimonials;

-- Drop Types
DROP TYPE IF EXISTS public.order_status;


-- 2. SETUP: Re-create the database schema.

-- Create Enums
CREATE TYPE public.order_status AS ENUM ('pending', 'shipped', 'delivered', 'cancelled');

-- Create Tables
CREATE TABLE public.user_profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user'
);

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    name text NOT NULL,
    image_url text NOT NULL,
    data_ai_hint text NOT NULL
);

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    long_description text NOT NULL,
    price numeric NOT NULL,
    image_url text NOT NULL,
    data_ai_hint text NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_best_seller boolean DEFAULT false NOT NULL,
    category_id uuid REFERENCES public.categories(id)
);

CREATE TABLE public.addresses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text NOT NULL DEFAULT 'USA',
    is_default boolean DEFAULT false NOT NULL
);

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_amount numeric NOT NULL,
    status order_status DEFAULT 'pending'::order_status NOT NULL,
    shipping_address_id uuid NOT NULL REFERENCES public.addresses(id)
);

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id),
    quantity integer NOT NULL,
    price numeric NOT NULL
);

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text
);

CREATE TABLE public.wishlists (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. APPLY ROW LEVEL SECURITY (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES
-- Policies for user_profiles
CREATE POLICY "Public user_profiles are viewable by everyone." ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
-- Policies for categories
CREATE POLICY "Categories are public." ON public.categories FOR SELECT USING (true);
-- Policies for products
CREATE POLICY "Products are public." ON public.products FOR SELECT USING (true);
-- Policies for addresses
CREATE POLICY "Users can view their own addresses." ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own addresses." ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own addresses." ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
-- Policies for orders
CREATE POLICY "Users can view their own orders." ON public.orders FOR SELECT USING (auth.uid() = user_id);
-- Policies for order_items
CREATE POLICY "Users can view items in their own orders." ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())));
-- Policies for reviews
CREATE POLICY "Reviews are public." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews." ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Policies for wishlists
CREATE POLICY "Users can manage their own wishlist." ON public.wishlists FOR ALL USING (auth.uid() = user_id);
-- Policies for newsletter
CREATE POLICY "Allow public access to newsletter subscribers." ON public.newsletter_subscribers FOR ALL USING (true);

-- 5. CREATE FUNCTIONS AND TRIGGERS
-- Function to handle new user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', 'user');
  -- Create a default admin user for demonstration purposes
  IF NEW.email = 'admin@example.com' THEN
    UPDATE public.user_profiles SET role = 'admin' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function for user stats
CREATE OR REPLACE FUNCTION public.get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent numeric, total_orders bigint, pending_orders bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(o.total_amount), 0) AS total_spent,
        COUNT(o.id) AS total_orders,
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END) AS pending_orders
    FROM
        public.orders o
    WHERE
        o.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function for executing arbitrary SQL (for admin)
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql;


-- 6. SEED DATA: Insert sample data into the tables.

-- Insert Categories
INSERT INTO public.categories (name, image_url, data_ai_hint) VALUES
('Smartphones', 'https://source.unsplash.com/random/600x400/?smartphone,iphone', 'smartphone iphone'),
('Laptops', 'https://source.unsplash.com/random/600x400/?laptop,macbook', 'laptop macbook'),
('Cameras', 'https://source.unsplash.com/random/600x400/?camera,photography', 'camera photography'),
('Headphones', 'https://source.unsplash.com/random/600x400/?headphones,audio', 'headphones audio'),
('Gaming', 'https://source.unsplash.com/random/600x400/?gaming,console', 'gaming console'),
('Accessories', 'https://source.unsplash.com/random/600x400/?tech,accessories', 'tech accessories');

-- Insert Products
INSERT INTO public.products (name, description, long_description, price, image_url, data_ai_hint, is_featured, is_best_seller, category_id) VALUES
-- Laptops
('Pro Gaming Laptop', '16-inch high-performance gaming laptop.', 'Equipped with the latest processor and a dedicated graphics card, this laptop is built for competitive gaming. Features a 165Hz display and RGB keyboard.', 1499.99, 'https://source.unsplash.com/random/600x400/?gaming,laptop', 'gaming laptop', true, true, (SELECT id from categories WHERE name = 'Laptops')),
('Ultra-Thin Notebook', 'Sleek and lightweight 13-inch notebook for professionals.', 'With an all-day battery life and a stunning high-resolution display, this notebook is perfect for productivity on the go. Crafted from premium aluminum.', 999.00, 'https://source.unsplash.com/random/600x400/?ultrabook,notebook', 'ultrabook notebook', true, false, (SELECT id from categories WHERE name = 'Laptops')),
-- Smartphones
('Flagship Smartphone X', 'The latest smartphone with a pro-grade camera system.', 'Capture breathtaking photos and videos with the advanced triple-camera system. The vibrant 6.7-inch OLED display brings content to life.', 1099.00, 'https://source.unsplash.com/random/600x400/?smartphone,pro', 'smartphone pro', true, true, (SELECT id from categories WHERE name = 'Smartphones')),
('Mid-Range Smartphone Y', 'A powerful and affordable smartphone for everyone.', 'Get amazing performance and a great camera without breaking the bank. Features a large screen and long-lasting battery.', 450.00, 'https://source.unsplash.com/random/600x400/?smartphone,android', 'smartphone android', false, true, (SELECT id from categories WHERE name = 'Smartphones')),
-- Cameras
('Compact Mirrorless Camera', 'A versatile mirrorless camera for enthusiasts.', 'This camera packs a large sensor into a compact body, delivering exceptional image quality. Perfect for travel and everyday photography.', 850.50, 'https://source.unsplash.com/random/600x400/?mirrorless,camera', 'mirrorless camera', true, false, (SELECT id from categories WHERE name = 'Cameras')),
('4K Action Camera', 'Capture all your adventures in stunning 4K.', 'Waterproof, durable, and packed with features like image stabilization and slow-motion recording. Your perfect companion for any adventure.', 399.00, 'https://source.unsplash.com/random/600x400/?action,camera', 'action camera', false, false, (SELECT id from categories WHERE name = 'Cameras')),
-- Headphones
('Noise-Cancelling Headphones', 'Immerse yourself in sound with these wireless headphones.', 'Block out distractions and enjoy pure, high-fidelity audio. Features industry-leading noise cancellation and up to 30 hours of battery life.', 349.99, 'https://source.unsplash.com/random/600x400/?wireless,headphones', 'wireless headphones', true, true, (SELECT id from categories WHERE name = 'Headphones')),
('True Wireless Earbuds', 'Compact and convenient earbuds with great sound.', 'Enjoy the freedom of true wireless audio. These earbuds offer a secure fit, intuitive controls, and a portable charging case.', 149.00, 'https://source.unsplash.com/random/600x400/?earbuds,audio', 'earbuds audio', false, true, (SELECT id from categories WHERE name = 'Headphones')),
-- Gaming
('Next-Gen Gaming Console', 'Experience the future of gaming.', 'Blazing-fast load times and breathtaking 4K graphics make this the ultimate gaming machine. Comes with one innovative wireless controller.', 499.99, 'https://source.unsplash.com/random/600x400/?gaming,console,controller', 'gaming console', true, false, (SELECT id from categories WHERE name = 'Gaming')),
('Ergonomic Gaming Mouse', 'Precision and comfort for marathon gaming sessions.', 'Features a high-precision optical sensor, programmable buttons, and customizable RGB lighting to match your setup.', 79.99, 'https://source.unsplash.com/random/600x400/?gaming,mouse', 'gaming mouse', false, false, (SELECT id from categories WHERE name = 'Gaming')),
-- Accessories
('Mechanical Keyboard', 'RGB mechanical keyboard with tactile switches.', 'Enjoy a superior typing and gaming experience with satisfying tactile feedback and customizable per-key RGB lighting.', 129.99, 'https://source.unsplash.com/random/600x400/?mechanical,keyboard', 'mechanical keyboard', false, true, (SELECT id from categories WHERE name = 'Accessories')),
('Portable Power Bank', 'Charge your devices on the go.', 'A massive 20,000mAh capacity can charge your smartphone multiple times. Features fast-charging ports for quick power-ups.', 49.99, 'https://source.unsplash.com/random/600x400/?powerbank,tech', 'powerbank tech', false, false, (SELECT id from categories WHERE name = 'Accessories'));
