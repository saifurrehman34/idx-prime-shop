-- 1. Add DROP statements for idempotency
-- Drop existing objects to start with a clean slate
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.testimonials CASCADE;

DROP TYPE IF EXISTS public.order_status CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_order_stats(p_user_id uuid) CASCADE;


-- 2. Create Tables, Types, and Functions

-- User Profiles Table
-- This table will store additional user data.
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user'
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public user_profiles are viewable by everyone." ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Function to create a new user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Categories Table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  image_url text NOT NULL,
  data_ai_hint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);


-- Products Table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  long_description text NOT NULL,
  price numeric(10, 2) NOT NULL,
  image_url text NOT NULL,
  data_ai_hint text NOT NULL,
  category_id uuid REFERENCES public.categories(id),
  is_featured boolean NOT NULL DEFAULT false,
  is_best_seller boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);


-- Addresses Table
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
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own addresses." ON public.addresses FOR ALL USING (auth.uid() = user_id);


-- Order Status Enum
CREATE TYPE public.order_status AS ENUM ('pending', 'shipped', 'delivered', 'cancelled');


-- Orders Table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shipping_address_id uuid REFERENCES public.addresses(id),
  total_amount numeric(10, 2) NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own orders." ON public.orders FOR ALL USING (auth.uid() = user_id);


-- Order Items Table
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity integer NOT NULL,
  price numeric(10, 2) NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own order items." ON public.order_items FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM public.orders WHERE id = order_id)
);


-- Wishlists Table
CREATE TABLE public.wishlists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own wishlist." ON public.wishlists FOR ALL USING (auth.uid() = user_id);


-- Reviews Table
CREATE TABLE public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id),
    rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are public." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reviews." ON public.reviews FOR ALL USING (auth.uid() = user_id);


-- Notifications Table
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message text NOT NULL,
    link text,
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications." ON public.notifications FOR ALL USING (auth.uid() = user_id);


-- Newsletter Subscribers Table
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Newsletter subscribers table is public for inserts." ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Other placeholder tables from the prompt
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quote text NOT NULL,
  image_url text NOT NULL,
  rating int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Enable RLS on placeholder tables
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Offers are viewable by everyone." ON public.offers FOR SELECT USING (true);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testimonials are viewable by everyone." ON public.testimonials FOR SELECT USING (true);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog posts are viewable by everyone." ON public.blog_posts FOR SELECT USING (true);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brands are viewable by everyone." ON public.brands FOR SELECT USING (true);


-- 3. Create Functions for stats
CREATE OR REPLACE FUNCTION public.get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent numeric, total_orders bigint, pending_orders bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(SUM(total_amount), 0.00) AS total_spent,
    COUNT(id) AS total_orders,
    COUNT(id) FILTER (WHERE status = 'pending') AS pending_orders
  FROM public.orders
  WHERE user_id = p_user_id;
$$;


-- 4. Insert Sample Data

-- Categories
INSERT INTO public.categories (name, image_url, data_ai_hint) VALUES
('Fruits', 'https://placehold.co/400x400.png', 'assorted fruits'),
('Vegetables', 'https://placehold.co/400x400.png', 'fresh vegetables'),
('Dairy', 'https://placehold.co/400x400.png', 'dairy products'),
('Bakery', 'https://placehold.co/400x400.png', 'artisan bread'),
('Meats', 'https://placehold.co/400x400.png', 'fresh meat'),
('Pantry', 'https://placehold.co/400x400.png', 'pantry staples');

-- Products
-- To avoid errors, we first get the category IDs and then insert into products
DO $$
DECLARE
    fruits_id uuid;
    vegetables_id uuid;
    dairy_id uuid;
    bakery_id uuid;
    pantry_id uuid;
BEGIN
    SELECT id INTO fruits_id FROM public.categories WHERE name = 'Fruits';
    SELECT id INTO vegetables_id FROM public.categories WHERE name = 'Vegetables';
    SELECT id INTO dairy_id FROM public.categories WHERE name = 'Dairy';
    SELECT id INTO bakery_id FROM public.categories WHERE name = 'Bakery';
    SELECT id INTO pantry_id FROM public.categories WHERE name = 'Pantry';

    INSERT INTO public.products (name, description, long_description, price, image_url, data_ai_hint, category_id, is_featured, is_best_seller, created_at)
    VALUES
    ('Organic Avocados', 'Pack of 4 creamy, organic Hass avocados.', 'Our organic Hass avocados are grown in nutrient-rich soil... Perfect for toast, salads, or guacamole.', 4.99, 'https://placehold.co/600x400.png', 'organic avocados', fruits_id, true, true, now() - interval '5 day'),
    ('Fresh Strawberries', '1 lb of sweet, juicy strawberries.', 'Hand-picked at peak ripeness, our strawberries are bursting with sweet, natural flavor.', 3.49, 'https://placehold.co/600x400.png', 'fresh strawberries', fruits_id, true, false, now() - interval '4 day'),
    ('Artisanal Sourdough', 'A freshly baked loaf of artisanal sourdough bread.', 'Baked daily using a traditional starter, our sourdough has a delightful tangy flavor.', 5.99, 'https://placehold.co/600x400.png', 'sourdough bread', bakery_id, true, true, now() - interval '1 day'),
    ('Heirloom Tomatoes', 'A mix of colorful and flavorful heirloom tomatoes.', 'Experience the vibrant colors and diverse flavors of our heirloom tomatoes.', 4.79, 'https://placehold.co/600x400.png', 'heirloom tomatoes', vegetables_id, true, false, now() - interval '2 day'),
    ('Free-Range Eggs', 'One dozen large brown free-range eggs.', 'Our hens are free to roam on open pastures, resulting in eggs with rich, flavorful yolks.', 6.29, 'https://placehold.co/600x400.png', 'free-range eggs', dairy_id, false, true, now() - interval '3 day'),
    ('Cold-Pressed Olive Oil', '500ml bottle of extra virgin olive oil.', 'Our extra virgin olive oil is cold-pressed from the finest olives to preserve its natural antioxidants.', 12.99, 'https://placehold.co/600x400.png', 'olive oil', pantry_id, false, false, now());
END $$;
