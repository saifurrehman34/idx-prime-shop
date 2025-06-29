-- Drop existing tables to start fresh
DROP TABLE IF EXISTS "reviews", "wishlists", "order_items", "orders", "products", "categories", "user_profiles", "addresses", "newsletter_subscribers", "notifications" CASCADE;

-- Drop custom types and functions if they exist
DROP TYPE IF EXISTS "public"."order_status";
DROP FUNCTION IF EXISTS "public"."handle_new_user"(), "public"."get_user_order_stats"(p_user_id uuid);

-- Create custom types
CREATE TYPE "public"."order_status" AS ENUM ('pending', 'shipped', 'delivered', 'cancelled');

-- Create Tables
CREATE TABLE "public"."categories" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "name" text NOT NULL,
    "image_url" text NOT NULL,
    "data_ai_hint" text NOT NULL
);
ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX categories_pkey ON public.categories USING btree (id);
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_pkey" PRIMARY KEY USING INDEX "categories_pkey";

CREATE TABLE "public"."products" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "name" text NOT NULL,
    "description" text NOT NULL,
    "price" numeric NOT NULL,
    "image_url" text NOT NULL,
    "category_id" uuid,
    "is_featured" boolean NOT NULL DEFAULT false,
    "is_best_seller" boolean NOT NULL DEFAULT false,
    "long_description" text NOT NULL,
    "data_ai_hint" text NOT NULL
);
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);
ALTER TABLE "public"."products" ADD CONSTRAINT "products_pkey" PRIMARY KEY USING INDEX "products_pkey";
ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE TABLE "public"."user_profiles" (
    "id" uuid NOT NULL,
    "full_name" text,
    "avatar_url" text,
    "role" text NOT NULL DEFAULT 'user'
);
ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY USING INDEX "user_profiles_pkey";
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."addresses" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "address_line_1" text NOT NULL,
    "address_line_2" text,
    "city" text NOT NULL,
    "state" text NOT NULL,
    "postal_code" text NOT NULL,
    "country" text NOT NULL DEFAULT 'USA',
    "is_default" boolean NOT NULL DEFAULT false
);
ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (id);
ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_pkey" PRIMARY KEY USING INDEX "addresses_pkey";
ALTER TABLE "public"."addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."orders" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "total_amount" numeric NOT NULL,
    "status" public.order_status NOT NULL DEFAULT 'pending',
    "shipping_address_id" uuid NOT NULL
);
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_pkey" PRIMARY KEY USING INDEX "orders_pkey";
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY (shipping_address_id) REFERENCES public.addresses(id) ON DELETE RESTRICT;
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."order_items" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "order_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "quantity" integer NOT NULL,
    "price" numeric NOT NULL
);
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_pkey" PRIMARY KEY USING INDEX "order_items_pkey";
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;

CREATE TABLE "public"."reviews" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "user_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "rating" integer NOT NULL,
    "comment" text,
    CONSTRAINT "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5)))
);
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id);
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_pkey" PRIMARY KEY USING INDEX "reviews_pkey";
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TABLE "public"."wishlists" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "product_id" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE "public"."wishlists" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX wishlists_pkey ON public.wishlists USING btree (id);
ALTER TABLE "public"."wishlists" ADD CONSTRAINT "wishlists_pkey" PRIMARY KEY USING INDEX "wishlists_pkey";
ALTER TABLE "public"."wishlists" ADD CONSTRAINT "wishlists_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE "public"."wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE "public"."wishlists" ADD CONSTRAINT "wishlists_user_id_product_id_key" UNIQUE (user_id, product_id);

CREATE TABLE "public"."newsletter_subscribers" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "email" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE "public"."newsletter_subscribers" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX newsletter_subscribers_email_key ON public.newsletter_subscribers USING btree (email);
CREATE UNIQUE INDEX newsletter_subscribers_pkey ON public.newsletter_subscribers USING btree (id);
ALTER TABLE "public"."newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY USING INDEX "newsletter_subscribers_pkey";
ALTER TABLE "public"."newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_email_key" UNIQUE USING INDEX "newsletter_subscribers_email_key";

-- Stored Procedures
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  -- Create a default address for the new user
  INSERT INTO public.addresses (user_id, address_line_1, city, state, postal_code, is_default)
  VALUES (new.id, '123 Main St', 'Anytown', 'CA', '12345', true);
  
  RETURN new;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to get user order statistics
CREATE OR REPLACE FUNCTION public.get_user_order_stats(p_user_id uuid)
RETURNS TABLE(total_spent numeric, total_orders bigint, pending_orders bigint)
LANGUAGE plpgsql
AS $$
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
$$;

-- RLS Policies
ALTER TABLE public.categories OWNER TO postgres;
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;
CREATE POLICY "Enable read access for all users" ON "public"."categories" FOR SELECT USING (true);

ALTER TABLE public.products OWNER TO postgres;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
CREATE POLICY "Enable read access for all users" ON "public"."products" FOR SELECT USING (true);

ALTER TABLE public.user_profiles OWNER TO postgres;
GRANT ALL ON TABLE public.user_profiles TO anon, authenticated, service_role;
CREATE POLICY "Allow users to view their own profile" ON "public"."user_profiles" FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON "public"."user_profiles" FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE public.addresses OWNER TO postgres;
GRANT ALL ON TABLE public.addresses TO anon, authenticated, service_role;
CREATE POLICY "Allow users to manage their own addresses" ON "public"."addresses" FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.orders OWNER TO postgres;
GRANT ALL ON TABLE public.orders TO anon, authenticated, service_role;
CREATE POLICY "Allow users to manage their own orders" ON "public"."orders" FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.order_items OWNER TO postgres;
GRANT ALL ON TABLE public.order_items TO anon, authenticated, service_role;
CREATE POLICY "Allow users to manage their own order items" ON "public"."order_items" FOR ALL USING (
  (SELECT user_id FROM public.orders WHERE id = order_id) = auth.uid()
);

ALTER TABLE public.reviews OWNER TO postgres;
GRANT ALL ON TABLE public.reviews TO anon, authenticated, service_role;
CREATE POLICY "Enable read access for all users" ON "public"."reviews" FOR SELECT USING (true);
CREATE POLICY "Allow users to manage their own reviews" ON "public"."reviews" FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.wishlists OWNER TO postgres;
GRANT ALL ON TABLE public.wishlists TO anon, authenticated, service_role;
CREATE POLICY "Allow users to manage their own wishlists" ON "public"."wishlists" FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.newsletter_subscribers OWNER TO postgres;
GRANT ALL ON TABLE public.newsletter_subscribers TO anon, authenticated, service_role;
CREATE POLICY "Enable insert for all users" ON "public"."newsletter_subscribers" FOR INSERT WITH CHECK (true);


-- Seed Data
DO $$
DECLARE
    electronics_category_id uuid := gen_random_uuid();
    fashion_category_id uuid := gen_random_uuid();
    home_category_id uuid := gen_random_uuid();
    books_category_id uuid := gen_random_uuid();
    sports_category_id uuid := gen_random_uuid();
    toys_category_id uuid := gen_random_uuid();
BEGIN
-- Seed Categories
INSERT INTO "public"."categories" (id, name, image_url, data_ai_hint) VALUES
(electronics_category_id, 'Electronics', 'https://source.unsplash.com/featured/400x400/?electronics', 'electronics'),
(fashion_category_id, 'Fashion', 'https://source.unsplash.com/featured/400x400/?fashion', 'fashion'),
(home_category_id, 'Home & Kitchen', 'https://source.unsplash.com/featured/400x400/?kitchen', 'kitchen'),
(books_category_id, 'Books', 'https://source.unsplash.com/featured/400x400/?books', 'books'),
(sports_category_id, 'Sports & Outdoors', 'https://source.unsplash.com/featured/400x400/?sports', 'sports'),
(toys_category_id, 'Toys & Games', 'https://source.unsplash.com/featured/400x400/?toys', 'toys');

-- Seed Products
INSERT INTO "public"."products" (name, description, price, category_id, is_featured, is_best_seller, image_url, long_description, data_ai_hint) VALUES
('Gaming Laptop', 'High-performance gaming laptop with RGB keyboard.', 1499.99, electronics_category_id, true, true, 'https://source.unsplash.com/featured/600x400/?laptop', 'A powerful gaming laptop for immersive gameplay and multitasking, featuring a high-refresh-rate display and dedicated graphics card.', 'gaming laptop'),
('Wireless Headset', 'Noise-cancelling wireless headset with 20-hour battery life.', 199.99, electronics_category_id, true, false, 'https://source.unsplash.com/featured/600x400/?headset', 'Experience crystal-clear audio and communication with this comfortable, long-lasting wireless headset.', 'headset'),
('Mechanical Keyboard', 'RGB mechanical keyboard with customizable keys.', 129.99, electronics_category_id, true, true, 'https://source.unsplash.com/featured/600x400/?keyboard', 'Enhance your typing and gaming with satisfying tactile feedback and vibrant RGB lighting.', 'mechanical keyboard'),
('Gaming Mouse', 'Ergonomic gaming mouse with adjustable DPI.', 79.99, electronics_category_id, true, false, 'https://source.unsplash.com/featured/600x400/?mouse', 'Gain a competitive edge with this high-precision ergonomic mouse, designed for comfort and control.', 'gaming mouse'),
('4K Webcam', '4K Ultra HD webcam for streaming and video calls.', 159.99, electronics_category_id, true, true, 'https://source.unsplash.com/featured/600x400/?webcam', 'Look your best on every call with a stunning 4K webcam that delivers professional-quality video.', 'webcam'),
('27-inch 4K Monitor', 'Ultra-sharp 27" 4K monitor with HDR support.', 449.99, electronics_category_id, true, false, 'https://source.unsplash.com/featured/600x400/?monitor', 'Immerse yourself in breathtaking detail and vibrant colors with this 27-inch 4K HDR monitor.', '4k monitor'),
('DSLR Camera Kit', 'Professional DSLR camera with 18-55mm lens.', 799.99, electronics_category_id, true, true, 'https://source.unsplash.com/featured/600x400/?camera', 'Capture life''s moments in stunning quality with this versatile and powerful DSLR camera kit.', 'dslr camera'),
('Camera Tripod', 'Sturdy and lightweight tripod for cameras.', 89.99, electronics_category_id, true, false, 'https://source.unsplash.com/featured/600x400/?tripod', 'Achieve perfectly stable shots and creative angles with this durable and portable camera tripod.', 'camera tripod'),
('Men''s Classic T-Shirt', 'Comfortable 100% cotton t-shirt.', 24.99, fashion_category_id, false, true, 'https://source.unsplash.com/featured/600x400/?tshirt', 'A timeless wardrobe staple, this classic t-shirt offers unbeatable comfort and versatile style.', 'mens tshirt'),
('Women''s Denim Jeans', 'High-waisted skinny fit denim jeans.', 89.99, fashion_category_id, false, false, 'https://source.unsplash.com/featured/600x400/?jeans', 'Flatter your figure with these stylish and comfortable high-waisted skinny jeans.', 'womens jeans'),
('Leather Wallet', 'Genuine leather bifold wallet.', 49.99, fashion_category_id, false, true, 'https://source.unsplash.com/featured/600x400/?wallet', 'A sophisticated and durable wallet crafted from genuine leather, designed to hold all your essentials.', 'leather wallet'),
('Running Shoes', 'Lightweight and breathable running shoes.', 129.99, fashion_category_id, false, false, 'https://source.unsplash.com/featured/600x400/?running-shoes', 'Go the distance with these lightweight running shoes, engineered for maximum comfort and performance.', 'running shoes'),
('Non-Stick Cookware Set', '10-piece non-stick cookware set.', 149.99, home_category_id, false, true, 'https://source.unsplash.com/featured/600x400/?cookware', 'Equip your kitchen with this complete non-stick cookware set, perfect for any recipe.', 'cookware set'),
('Espresso Machine', 'Automatic espresso machine with milk frother.', 599.99, home_category_id, false, false, 'https://source.unsplash.com/featured/600x400/?espresso-machine', 'Become your own barista and craft delicious coffeehouse-style drinks at home with this premium espresso machine.', 'espresso machine'),
('Robot Vacuum', 'Smart robot vacuum with app control.', 349.99, home_category_id, false, true, 'https://source.unsplash.com/featured/600x400/?robot-vacuum', 'Keep your floors spotless with minimal effort using this intelligent, self-navigating robot vacuum.', 'robot vacuum'),
('Air Fryer', '5.8-quart air fryer for healthy cooking.', 99.99, home_category_id, false, false, 'https://source.unsplash.com/featured/600x400/?air-fryer', 'Enjoy your favorite fried foods with less oil. This air fryer makes cooking crispy, delicious meals easy and healthy.', 'air fryer');
END $$;
