-- Drop functions to avoid conflicts
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.user_has_purchased_product(uuid, uuid);

-- Drop existing tables in reverse order of dependency
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.hero_slides CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;


-- Drop existing enums if they exist
DROP TYPE IF EXISTS public.order_status;

-- Recreate user_profiles table
CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    full_name text,
    avatar_url text,
    role text NOT NULL DEFAULT 'user'::text,
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

-- Trigger to call handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper function to check for admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO user_role FROM public.user_profiles WHERE id = auth.uid();
  RETURN user_role = 'admin';
END;
$$;


-- Create categories table
CREATE TABLE public.categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    image_url text NOT NULL,
    data_ai_hint text NOT NULL,
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_name_key UNIQUE (name)
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories." ON public.categories FOR ALL USING (public.is_admin());

-- Create products table
CREATE TABLE public.products (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    name text NOT NULL,
    description text NOT NULL,
    price numeric NOT NULL,
    image_url text NOT NULL,
    category_id uuid,
    is_featured boolean NOT NULL DEFAULT false,
    long_description text NOT NULL,
    data_ai_hint text NOT NULL,
    is_best_seller boolean NOT NULL DEFAULT false,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL,
    CONSTRAINT products_price_check CHECK ((price >= (0)::numeric))
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products." ON public.products FOR ALL USING (public.is_admin());

-- Create addresses table
CREATE TABLE public.addresses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text NOT NULL DEFAULT 'USA'::text,
    is_default boolean NOT NULL DEFAULT false,
    CONSTRAINT addresses_pkey PRIMARY KEY (id),
    CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own addresses." ON public.addresses FOR ALL USING (auth.uid() = user_id);

-- Create order_status enum
CREATE TYPE public.order_status AS ENUM (
    'pending',
    'shipped',
    'delivered',
    'cancelled'
);

-- Create orders table
CREATE TABLE public.orders (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL,
    total_amount numeric NOT NULL,
    status public.order_status NOT NULL DEFAULT 'pending'::public.order_status,
    shipping_address_id uuid,
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES public.addresses(id) ON DELETE SET NULL,
    CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders." ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders." ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can create orders." ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create order_items table
CREATE TABLE public.order_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    price numeric NOT NULL,
    CONSTRAINT order_items_pkey PRIMARY KEY (id),
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
    CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own order items." ON public.order_items FOR SELECT USING ((SELECT auth.uid() = user_id FROM public.orders WHERE id = order_id));
CREATE POLICY "Admins can view all order items." ON public.order_items FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can create order items." ON public.order_items FOR INSERT WITH CHECK (true);

-- Create wishlists table
CREATE TABLE public.wishlists (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT wishlists_pkey PRIMARY KEY (id),
    CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
    CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT wishlists_user_id_product_id_key UNIQUE (user_id, product_id)
);
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own wishlist." ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- Create reviews table
CREATE TABLE public.reviews (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL,
    user_id uuid NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT reviews_pkey PRIMARY KEY (id),
    CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
    CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT reviews_user_id_product_id_key UNIQUE (user_id, product_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are public." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reviews." ON public.reviews FOR ALL USING (auth.uid() = user_id);


-- Create hero_slides table
CREATE TABLE public.hero_slides (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    title text NOT NULL,
    subtitle text,
    image_url text NOT NULL,
    image_ai_hint text,
    link text,
    is_active boolean NOT NULL DEFAULT true,
    CONSTRAINT hero_slides_pkey PRIMARY KEY (id)
);
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hero slides are public." ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Admins can manage hero slides." ON public.hero_slides FOR ALL USING (public.is_admin());

-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id),
    CONSTRAINT newsletter_subscribers_email_key UNIQUE (email)
);

-- RPC functions
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can execute SQL.';
  END IF;
  
  EXECUTE sql_query;
END;
$$;


CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(total_users bigint, total_products bigint, total_orders bigint, total_revenue numeric)
LANGUAGE sql
AS $$
  SELECT
    (SELECT count(*) FROM auth.users) as total_users,
    (SELECT count(*) FROM public.products) as total_products,
    (SELECT count(*) FROM public.orders) as total_orders,
    (SELECT sum(total_amount) FROM public.orders WHERE status = 'delivered') as total_revenue
$$;

CREATE OR REPLACE FUNCTION public.get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent numeric, total_orders bigint, pending_orders bigint)
LANGUAGE sql
AS $$
  SELECT
    COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as total_spent,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
  FROM public.orders
  WHERE user_id = p_user_id;
$$;

-- Function to check if a user has purchased a product
CREATE OR REPLACE FUNCTION public.user_has_purchased_product(p_user_id uuid, p_product_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    WHERE o.user_id = p_user_id
      AND oi.product_id = p_product_id
      AND o.status = 'delivered'
  );
$$;

-- Storage bucket policies
-- Make sure to create a 'product-images' bucket in Supabase Storage.
DELETE FROM storage.policies WHERE name = 'Product images are publicly accessible.';
DELETE FROM storage.policies WHERE name = 'Anyone can upload a product image.';
DELETE FROM storage.policies WHERE name = 'Admins can update product images.';
DELETE FROM storage.policies WHERE name = 'Admins can delete product images.';

CREATE POLICY "Product images are publicly accessible." ON storage.objects FOR SELECT USING ( bucket_id = 'product-images' );
CREATE POLICY "Anyone can upload a product image." ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'product-images' );
CREATE POLICY "Admins can update product images." ON storage.objects FOR UPDATE USING ( public.is_admin() AND bucket_id = 'product-images' );
CREATE POLICY "Admins can delete product images." ON storage.objects FOR DELETE USING ( public.is_admin() AND bucket_id = 'product-images' );
