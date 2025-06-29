-- Drop existing tables, types, and functions in reverse order of dependency
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP FUNCTION IF EXISTS public.get_user_order_stats;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.wishlists;
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.orders;
DROP TABLE IF EXISTS public.addresses;
DROP TABLE IF EXISTS public.user_profiles;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.newsletter_subscribers;
DROP TABLE IF EXISTS public.brands;
DROP TABLE IF EXISTS public.blog_posts;
DROP TABLE IF EXISTS public.offers;
DROP TABLE IF EXISTS public.testimonials;
DROP TYPE IF EXISTS public.order_status;

-- USERS
-- Create a table for public user profiles
CREATE TABLE public.user_profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user',
  PRIMARY KEY (id)
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  RETURN new;
END;
$$;
-- trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    image_url text NOT NULL,
    data_ai_hint text NOT NULL,
    created_at timestamptz DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories." ON public.categories FOR ALL USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);
-- Seed Categories
INSERT INTO public.categories (name, image_url, data_ai_hint) VALUES
('Fruits', 'https://placehold.co/400x400.png', 'assorted fruits'),
('Vegetables', 'https://placehold.co/400x400.png', 'fresh vegetables'),
('Dairy', 'https://placehold.co/400x400.png', 'dairy products'),
('Bakery', 'https://placehold.co/400x400.png', 'artisan bread'),
('Meats', 'https://placehold.co/400x400.png', 'fresh meat'),
('Pantry', 'https://placehold.co/400x400.png', 'pantry staples');

-- PRODUCTS
CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    price numeric NOT NULL,
    image_url text NOT NULL,
    description text NOT NULL,
    long_description text NOT NULL,
    data_ai_hint text NOT NULL,
    is_featured boolean DEFAULT false,
    is_best_seller boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    category_id uuid REFERENCES public.categories(id)
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products." ON public.products FOR ALL USING (
  (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
);
-- Seed Products
INSERT INTO public.products (name, price, image_url, description, long_description, data_ai_hint, is_featured, is_best_seller, category_id, created_at)
VALUES
  ('Organic Avocados', 4.99, 'https://placehold.co/600x400.png', 'Pack of 4 creamy, organic Hass avocados.', 'Our organic Hass avocados are grown in nutrient-rich soil... Perfect for toast, salads, or guacamole.', 'organic avocados', true, true, (SELECT id from categories where name = 'Fruits'), NOW() - interval '5 days'),
  ('Fresh Strawberries', 3.49, 'https://placehold.co/600x400.png', '1 lb of sweet, juicy strawberries.', 'Hand-picked at peak ripeness, our strawberries are bursting with sweet, natural flavor.', 'fresh strawberries', true, false, (SELECT id from categories where name = 'Fruits'), NOW() - interval '4 days'),
  ('Free-Range Eggs', 6.29, 'https://placehold.co/600x400.png', 'One dozen large brown free-range eggs.', 'Our hens are free to roam on open pastures, resulting in eggs with rich, flavorful yolks.', 'free-range eggs', false, true, (SELECT id from categories where name = 'Dairy'), NOW() - interval '3 days'),
  ('Heirloom Tomatoes', 4.79, 'https://placehold.co/600x400.png', 'A mix of colorful and flavorful heirloom tomatoes.', 'Experience the vibrant colors and diverse flavors of our heirloom tomatoes.', 'heirloom tomatoes', true, false, (SELECT id from categories where name = 'Vegetables'), NOW() - interval '2 days'),
  ('Artisanal Sourdough', 5.99, 'https://placehold.co/600x400.png', 'A freshly baked loaf of artisanal sourdough bread.', 'Baked daily using a traditional starter, our sourdough has a delightful tangy flavor.', 'sourdough bread', true, true, (SELECT id from categories where name = 'Bakery'), NOW() - interval '1 day'),
  ('Cold-Pressed Olive Oil', 12.99, 'https://placehold.co/600x400.png', '500ml bottle of extra virgin olive oil.', 'Our extra virgin olive oil is cold-pressed from the finest olives to preserve its natural antioxidants.', 'olive oil', false, false, (SELECT id from categories where name = 'Pantry'), NOW());

-- ADDRESSES
CREATE TABLE public.addresses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'USA',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own addresses." ON public.addresses FOR ALL
USING ( auth.uid() = user_id );

-- ORDERS
CREATE TYPE public.order_status AS ENUM ('pending', 'shipped', 'delivered', 'cancelled');
CREATE TABLE public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  status public.order_status NOT NULL DEFAULT 'pending',
  total_amount numeric NOT NULL,
  shipping_address_id uuid NOT NULL REFERENCES public.addresses(id)
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders." ON public.orders FOR SELECT
USING ( auth.uid() = user_id );
CREATE POLICY "Users can create their own orders." ON public.orders FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- ORDER ITEMS
CREATE TABLE public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity integer NOT NULL,
  price numeric NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view items in their own orders." ON public.order_items FOR SELECT
USING ( (SELECT user_id FROM public.orders WHERE id = order_id) = auth.uid() );
CREATE POLICY "Users can create items for their own orders." ON public.order_items FOR INSERT
WITH CHECK ( (SELECT user_id FROM public.orders WHERE id = order_id) = auth.uid() );

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are public." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reviews." ON public.reviews FOR ALL
USING ( auth.uid() = user_id );

-- WISHLISTS
CREATE TABLE public.wishlists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own wishlist." ON public.wishlists FOR ALL
USING ( auth.uid() = user_id );

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  message text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications." ON public.notifications FOR ALL
USING ( auth.uid() = user_id );

-- NEWSLETTER
CREATE TABLE public.newsletter_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Newsletter subscribers are public." ON public.newsletter_subscribers FOR SELECT USING (true);
CREATE POLICY "Anyone can subscribe to the newsletter." ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- MISC. Other tables from user prompt, adding as empty tables for now.
CREATE TABLE public.brands ( id uuid DEFAULT gen_random_uuid() PRIMARY KEY, name text NOT NULL, image_url text NOT NULL, created_at timestamptz DEFAULT now());
CREATE TABLE public.blog_posts ( id uuid DEFAULT gen_random_uuid() PRIMARY KEY, title text NOT NULL, content text NOT NULL, image_url text NOT NULL, created_at timestamptz DEFAULT now());
CREATE TABLE public.offers ( id uuid DEFAULT gen_random_uuid() PRIMARY KEY, title text NOT NULL, description text NOT NULL, image_url text NOT NULL, created_at timestamptz DEFAULT now());
CREATE TABLE public.testimonials ( id uuid DEFAULT gen_random_uuid() PRIMARY KEY, name text NOT NULL, quote text NOT NULL, rating int NOT NULL, image_url text NOT NULL, created_at timestamptz DEFAULT now());

-- Database Function for user stats
CREATE OR REPLACE FUNCTION get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent numeric, total_orders bigint, pending_orders bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(o.total_amount), 0.00)::numeric AS total_spent,
    COUNT(o.id)::bigint AS total_orders,
    COUNT(CASE WHEN o.status = 'pending' THEN 1 END)::bigint AS pending_orders
  FROM
    public.orders o
  WHERE
    o.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Set up storage
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true);
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Sample User Data (replace with your own test users)
-- Note: Manually create users via the Supabase Auth dashboard or your app's signup form.
-- Then, you can use their IDs to seed data.
-- Example: UPDATE public.user_profiles SET role = 'admin' WHERE id = '...user-id-here...';
