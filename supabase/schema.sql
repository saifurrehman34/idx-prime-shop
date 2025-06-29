-- 1. Create Tables
-- Note: Supabase automatically creates the `auth.users` table.

-- Create user_profiles table
create table if not exists public.user_profiles (
  id uuid not null primary key,
  full_name text,
  avatar_url text,
  role text not null default 'user',
  constraint fk_user foreign key (id) references auth.users (id) on delete cascade
);
comment on table public.user_profiles is 'Profile data for each user.';

-- Create categories table
create table if not exists public.categories (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  image_url text not null,
  data_ai_hint text not null,
  created_at timestamp with time zone not null default now()
);
comment on table public.categories is 'Product categories for the store.';

-- Create products table
create table if not exists public.products (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  price numeric(10, 2) not null,
  image_url text not null,
  description text not null,
  long_description text not null,
  data_ai_hint text not null,
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamp with time zone not null default now()
);
comment on table public.products is 'Products available in the store.';

-- Create newsletter_subscribers table
create table if not exists public.newsletter_subscribers (
  id uuid not null default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone not null default now()
);
comment on table public.newsletter_subscribers is 'List of users subscribed to the newsletter.';


-- 2. Set up Row Level Security (RLS)
-- Enable RLS for all tables
alter table public.user_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view their own profile." on public.user_profiles;
drop policy if exists "Users can update their own profile." on public.user_profiles;
drop policy if exists "Allow public read access to categories" on public.categories;
drop policy if exists "Allow public read access to products" on public.products;
drop policy if exists "Allow public insert access" on public.newsletter_subscribers;


-- Policies for user_profiles
-- Users can view their own profile.
create policy "Users can view their own profile." on public.user_profiles for select
  using ( auth.uid() = id );
-- Users can update their own profile.
create policy "Users can update their own profile." on public.user_profiles for update
  using ( auth.uid() = id );

-- Policies for categories
-- Anyone can view categories.
create policy "Allow public read access to categories" on public.categories for select
  using ( true );

-- Policies for products
-- Anyone can view products.
create policy "Allow public read access to products" on public.products for select
  using ( true );

-- Policies for newsletter_subscribers
-- Allow public insert access for anyone.
create policy "Allow public insert access" on public.newsletter_subscribers for insert
  with check ( true );


-- 3. Create Functions and Triggers

-- Function to create a user profile when a new user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$;

-- Trigger to call the function after a new user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. Seed Data (Optional, but recommended for development)

-- To create an admin user:
-- 1. Sign up a new user through the app.
-- 2. Get their user ID from the `auth.users` table in your Supabase dashboard.
-- 3. Run the following command, replacing the user ID.
--    UPDATE public.user_profiles SET role = 'admin' WHERE id = '...your-new-user-id...';

-- Insert sample categories
insert into public.categories (name, image_url, data_ai_hint) values
  ('Fruits', 'https://placehold.co/400x400.png', 'assorted fruits'),
  ('Vegetables', 'https://placehold.co/400x400.png', 'fresh vegetables'),
  ('Dairy', 'https://placehold.co/400x400.png', 'dairy products'),
  ('Bakery', 'https://placehold.co/400x400.png', 'artisan bread'),
  ('Meats', 'https://placehold.co/400x400.png', 'fresh meat'),
  ('Pantry', 'https://placehold.co/400x400.png', 'pantry staples')
on conflict (name) do nothing;

-- Insert sample products
-- Note: on conflict is on (name) assuming names are unique for sample data
insert into public.products (name, price, image_url, description, long_description, data_ai_hint, is_featured, is_best_seller, category_id) values
  ('Organic Avocados', 4.99, 'https://placehold.co/600x400.png', 'Pack of 4 creamy, organic Hass avocados.', 'Our organic Hass avocados are grown in nutrient-rich soil... Perfect for toast, salads, or guacamole.', 'organic avocados', true, true, (select id from categories where name = 'Fruits')),
  ('Fresh Strawberries', 3.49, 'https://placehold.co/600x400.png', '1 lb of sweet, juicy strawberries.', 'Hand-picked at peak ripeness, our strawberries are bursting with sweet, natural flavor.', 'fresh strawberries', true, false, (select id from categories where name = 'Fruits')),
  ('Artisanal Sourdough', 5.99, 'https://placehold.co/600x400.png', 'A freshly baked loaf of artisanal sourdough bread.', 'Baked daily using a traditional starter, our sourdough has a delightful tangy flavor.', 'sourdough bread', true, true, (select id from categories where name = 'Bakery')),
  ('Heirloom Tomatoes', 4.79, 'https://placehold.co/600x400.png', 'A mix of colorful and flavorful heirloom tomatoes.', 'Experience the vibrant colors and diverse flavors of our heirloom tomatoes.', 'heirloom tomatoes', true, false, (select id from categories where name = 'Vegetables')),
  ('Free-Range Eggs', 6.29, 'https://placehold.co/600x400.png', 'One dozen large brown free-range eggs.', 'Our hens are free to roam on open pastures, resulting in eggs with rich, flavorful yolks.', 'free-range eggs', false, true, (select id from categories where name = 'Dairy')),
  ('Cold-Pressed Olive Oil', 12.99, 'https://placehold.co/600x400.png', '500ml bottle of extra virgin olive oil.', 'Our extra virgin olive oil is cold-pressed from the finest olives to preserve its natural antioxidants.', 'olive oil', false, false, (select id from categories where name = 'Pantry')),
  ('Ribeye Steak', 18.50, 'https://placehold.co/600x400.png', '12oz grass-fed ribeye steak.', 'A well-marbled, tender, and flavorful cut, perfect for grilling or pan-searing.', 'ribeye steak', false, true, (select id from categories where name = 'Meats')),
  ('Organic Kale', 2.99, 'https://placehold.co/600x400.png', 'A fresh bunch of organic kale.', 'Nutrient-dense and versatile, great for salads, smoothies, or sautés.', 'fresh kale', false, false, (select id from categories where name = 'Vegetables'))
on conflict (name) do nothing;
