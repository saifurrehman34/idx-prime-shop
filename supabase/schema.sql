-- Drop existing objects if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user;

-- Drop tables in reverse order of dependency
drop table if exists public.products;
drop table if exists public.categories;
drop table if exists public.user_profiles;
drop table if exists public.newsletter_subscribers;
drop table if exists public.brands;
drop table if exists public.blog_posts;
drop table if exists public.offers;
drop table if exists public.testimonials;

-- Create table for user profiles
create table public.user_profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'user',
  primary key (id)
);

-- RLS for user_profiles
alter table public.user_profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.user_profiles for select using (true);
create policy "Users can insert their own profile." on public.user_profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.user_profiles for update using (auth.uid() = id);

-- Function and Trigger for new user
create function public.handle_new_user()
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Create Categories table
create table public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    image_url text not null,
    data_ai_hint text not null,
    created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "Categories are viewable by everyone." on public.categories for select using (true);


-- Create Products table
create table public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    price float8 not null,
    image_url text not null,
    description text not null,
    long_description text not null,
    data_ai_hint text not null,
    is_featured boolean not null default false,
    is_best_seller boolean not null default false,
    category_id uuid references public.categories(id),
    created_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Products are viewable by everyone." on public.products for select using (true);

-- Create other tables
create table public.newsletter_subscribers (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
create policy "Newsletter subscribers can be inserted." on public.newsletter_subscribers for insert with check (true);

create table public.brands (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    image_url text not null,
    created_at timestamptz not null default now()
);
alter table public.brands enable row level security;
create policy "Brands are viewable by everyone." on public.brands for select using (true);

create table public.blog_posts (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    content text not null,
    image_url text not null,
    created_at timestamptz not null default now()
);
alter table public.blog_posts enable row level security;
create policy "Blog posts are viewable by everyone." on public.blog_posts for select using (true);

create table public.offers (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    image_url text not null,
    created_at timestamptz not null default now()
);
alter table public.offers enable row level security;
create policy "Offers are viewable by everyone." on public.offers for select using (true);

create table public.testimonials (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    quote text not null,
    rating int not null,
    image_url text not null,
    created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
create policy "Testimonials are viewable by everyone." on public.testimonials for select using (true);

-- Insert sample data
insert into public.categories (name, image_url, data_ai_hint) values
('Vegetables', 'https://placehold.co/400x400.png', 'fresh vegetables'),
('Fruits', 'https://placehold.co/400x400.png', 'assorted fruits'),
('Bakery', 'https://placehold.co/400x400.png', 'artisan bread'),
('Dairy', 'https://placehold.co/400x400.png', 'dairy products'),
('Meats', 'https://placehold.co/400x400.png', 'fresh meat'),
('Pantry', 'https://placehold.co/400x400.png', 'pantry staples');

insert into public.products (name, price, description, long_description, image_url, data_ai_hint, is_featured, is_best_seller, category_id)
select
    'Organic Avocados', 4.99, 'Pack of 4 creamy, organic Hass avocados.', 'Our organic Hass avocados are grown in nutrient-rich soil... Perfect for toast, salads, or guacamole.', 'https://placehold.co/600x400.png', 'organic avocados', true, true, id
from public.categories where name = 'Fruits';

insert into public.products (name, price, description, long_description, image_url, data_ai_hint, is_featured, is_best_seller, category_id)
select
    'Fresh Strawberries', 3.49, '1 lb of sweet, juicy strawberries.', 'Hand-picked at peak ripeness, our strawberries are bursting with sweet, natural flavor.', 'https://placehold.co/600x400.png', 'fresh strawberries', true, true, id
from public.categories where name = 'Fruits';

insert into public.products (name, price, description, long_description, image_url, data_ai_hint, is_featured, category_id)
select
    'Artisanal Sourdough', 5.99, 'A freshly baked loaf of artisanal sourdough bread.', 'Baked daily using a traditional starter, our sourdough has a delightful tangy flavor.', 'https://placehold.co/600x400.png', 'sourdough bread', true, id
from public.categories where name = 'Bakery';

insert into public.products (name, price, description, long_description, image_url, data_ai_hint, is_featured, category_id)
select
    'Heirloom Tomatoes', 4.79, 'A mix of colorful and flavorful heirloom tomatoes.', 'Experience the vibrant colors and diverse flavors of our heirloom tomatoes.', 'https://placehold.co/600x400.png', 'heirloom tomatoes', true, id
from public.categories where name = 'Vegetables';

insert into public.products (name, price, description, long_description, image_url, data_ai_hint, is_best_seller, category_id)
select
    'Free-Range Eggs', 6.29, 'One dozen large brown free-range eggs.', 'Our hens are free to roam on open pastures, resulting in eggs with rich, flavorful yolks.', 'https://placehold.co/600x400.png', 'free-range eggs', true, id
from public.categories where name = 'Dairy';

insert into public.products (name, price, description, long_description, image_url, data_ai_hint, category_id)
select
    'Cold-Pressed Olive Oil', 12.99, '500ml bottle of extra virgin olive oil.', 'Our extra virgin olive oil is cold-pressed from the finest olives to preserve its natural antioxidants.', 'https://placehold.co/600x400.png', 'olive oil', id
from public.categories where name = 'Pantry';
