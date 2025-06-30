-- To prevent issues with dependencies, drop existing objects in reverse order.
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.hero_slides CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Drop functions and types if they exist
DROP FUNCTION IF EXISTS public.get_admin_stats();
DROP FUNCTION IF EXISTS public.get_user_order_stats(uuid);
DROP FUNCTION IF EXISTS public.user_has_purchased_product(uuid, uuid);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TYPE IF EXISTS public.order_status;

-- Create the order_status enum type for order status management.
CREATE TYPE public.order_status AS ENUM ('pending', 'shipped', 'delivered', 'cancelled');

-- Create a table for public user profiles
CREATE TABLE public.user_profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    role text NOT NULL DEFAULT 'user'
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create a table for product categories
CREATE TABLE public.categories (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    name text NOT NULL,
    image_url text NOT NULL,
    data_ai_hint text NOT NULL
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create a table for products
CREATE TABLE public.products (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    name text NOT NULL,
    description text NOT NULL,
    long_description text NOT NULL,
    price numeric NOT NULL,
    image_url text NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    is_featured boolean NOT NULL DEFAULT false,
    is_best_seller boolean NOT NULL DEFAULT false,
    data_ai_hint text NOT NULL
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create a table for product reviews
CREATE TABLE public.reviews (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    CONSTRAINT unique_user_product_review UNIQUE (user_id, product_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create a table for user wishlists
CREATE TABLE public.wishlists (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_product_wishlist UNIQUE (user_id, product_id)
);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create a table for user addresses
CREATE TABLE public.addresses (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text NOT NULL DEFAULT 'USA',
    is_default boolean NOT NULL DEFAULT false
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Create a table for orders
CREATE TABLE public.orders (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount numeric NOT NULL,
    status public.order_status NOT NULL DEFAULT 'pending',
    shipping_address_id uuid REFERENCES public.addresses(id) ON DELETE SET NULL,
    payment_method text NOT NULL
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create a table for order items
CREATE TABLE public.order_items (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity int NOT NULL,
    price numeric NOT NULL
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create a table for hero carousel slides
CREATE TABLE public.hero_slides (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    title text NOT NULL,
    subtitle text,
    image_url text NOT NULL,
    image_ai_hint text,
    link text,
    is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Create a table for newsletter subscribers
CREATE TABLE public.newsletter_subscribers (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Function to automatically create a user profile on new user signup.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function after a new user is created in auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get statistics for the admin dashboard.
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(total_users bigint, total_products bigint, total_orders bigint, total_revenue numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT count(*) FROM auth.users) AS total_users,
        (SELECT count(*) FROM public.products) AS total_products,
        (SELECT count(*) FROM public.orders) AS total_orders,
        (SELECT sum(total_amount) FROM public.orders WHERE status = 'delivered') AS total_revenue;
END;
$$ LANGUAGE plpgsql;

-- Function to get order statistics for a specific user.
CREATE OR REPLACE FUNCTION public.get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent numeric, total_orders bigint, pending_orders bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(sum(o.total_amount), 0) as total_spent,
        count(o.id) as total_orders,
        count(o.id) FILTER (WHERE o.status = 'pending' OR o.status = 'shipped') as pending_orders
    FROM public.orders o
    WHERE o.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a user has purchased a specific product.
CREATE OR REPLACE FUNCTION public.user_has_purchased_product(p_user_id uuid, p_product_id uuid)
RETURNS boolean AS $$
DECLARE
    has_purchased boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.orders o
        JOIN public.order_items oi ON o.id = oi.order_id
        WHERE o.user_id = p_user_id
          AND oi.product_id = p_product_id
          AND o.status = 'delivered'
    ) INTO has_purchased;
    RETURN has_purchased;
END;
$$ LANGUAGE plpgsql;

-- POLICIES
-- Define access rules for the user_profiles table.
CREATE POLICY "Users can view their own profile." ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles." ON public.user_profiles FOR ALL USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- Define access rules for public tables.
CREATE POLICY "Anyone can view categories." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories." ON public.categories FOR ALL USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Anyone can view products." ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products." ON public.products FOR ALL USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Anyone can view reviews." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create and update their own reviews." ON public.reviews FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active hero slides." ON public.hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage hero slides." ON public.hero_slides FOR ALL USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Anyone can subscribe to the newsletter." ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscribers." ON public.newsletter_subscribers FOR SELECT USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

-- Define access rules for user-specific data.
CREATE POLICY "Users can manage their own wishlist items." ON public.wishlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own addresses." ON public.addresses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view and create their own orders." ON public.orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders." ON public.orders FOR ALL USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can view items of their own orders." ON public.order_items FOR SELECT USING ((SELECT user_id FROM public.orders WHERE id = order_id) = auth.uid());
CREATE POLICY "Users can create items for their own orders." ON public.order_items FOR INSERT WITH CHECK ((SELECT user_id FROM public.orders WHERE id = order_id) = auth.uid());
CREATE POLICY "Admins can manage all order items." ON public.order_items FOR ALL USING ((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin');
