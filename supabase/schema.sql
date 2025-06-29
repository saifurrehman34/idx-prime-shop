-- Create a table for user profiles
create table user_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  -- Add a role column with a default value of 'user'
  role text default 'user' not null
);

-- Set up Row Level Security (RLS)
alter table user_profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on user_profiles
  for select using (true);

create policy "Users can insert their own profile." on user_profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on user_profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile for new users.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function after a new user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Drop existing tables if they exist to start fresh
drop table if exists products cascade;
drop table if exists categories cascade;
drop table if exists offers cascade;
drop table if exists testimonials cascade;
drop table if exists blog_posts cascade;
drop table if exists brands cascade;
drop table if exists newsletter_subscribers cascade;
drop table if exists hero_banners cascade;


-- Create Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    data_ai_hint VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    description TEXT,
    long_description TEXT,
    data_ai_hint VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Offers table
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Testimonials table
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    quote TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Blog Posts table
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Brands table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Newsletter Subscribers table
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Hero Banners table
CREATE TABLE hero_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    subtitle TEXT,
    cta_text VARCHAR(100),
    cta_link VARCHAR(255),
    image_url TEXT,
    data_ai_hint VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample data
INSERT INTO categories (name, image_url, data_ai_hint) VALUES
('Fruits', 'https://placehold.co/300x300.png', 'fruits'),
('Vegetables', 'https://placehold.co/300x300.png', 'vegetables'),
('Bakery', 'https://placehold.co/300x300.png', 'bakery bread'),
('Dairy & Eggs', 'https://placehold.co/300x300.png', 'dairy eggs');

INSERT INTO products (name, price, description, long_description, image_url, data_ai_hint, is_featured, is_best_seller, category_id) VALUES
('Organic Avocados', 4.99, 'Pack of 4 creamy, organic Hass avocados.', 'Our organic Hass avocados are grown in nutrient-rich soil without synthetic pesticides. They are known for their creamy texture and rich, nutty flavor. Perfect for toast, salads, or guacamole.', 'https://placehold.co/600x400.png', 'organic avocados', TRUE, TRUE, (SELECT id FROM categories WHERE name = 'Fruits')),
('Fresh Strawberries', 3.49, '1 lb of sweet, juicy strawberries.', 'Hand-picked at peak ripeness, our strawberries are bursting with sweet, natural flavor. They are a great source of Vitamin C and antioxidants. Enjoy them fresh, in desserts, or as a healthy snack.', 'https://placehold.co/600x400.png', 'fresh strawberries', TRUE, FALSE, (SELECT id FROM categories WHERE name = 'Fruits')),
('Artisanal Sourdough', 5.99, 'A freshly baked loaf of artisanal sourdough bread.', 'Baked daily using a traditional starter, our sourdough has a delightful tangy flavor, a chewy crumb, and a perfectly crisp crust. It''s made with organic flour and contains no preservatives.', 'https://placehold.co/600x400.png', 'sourdough bread', TRUE, TRUE, (SELECT id FROM categories WHERE name = 'Bakery')),
('Free-Range Eggs', 6.29, 'One dozen large brown free-range eggs.', 'Our hens are free to roam on open pastures, resulting in eggs with rich, flavorful yolks. These free-range eggs are a testament to our commitment to ethical and sustainable farming.', 'https://placehold.co/600x400.png', 'free range eggs', FALSE, TRUE, (SELECT id FROM categories WHERE name = 'Dairy & Eggs')),
('Heirloom Tomatoes', 4.79, 'A mix of colorful and flavorful heirloom tomatoes.', 'Experience the vibrant colors and diverse flavors of our heirloom tomatoes. Grown from seeds passed down through generations, each variety offers a unique taste, from sweet to tangy. Perfect for salads and sauces.', 'https://placehold.co/600x400.png', 'heirloom tomatoes', TRUE, FALSE, (SELECT id FROM categories WHERE name = 'Vegetables')),
('New Arrival Product 1', 9.99, 'A brand new product.', 'Description for new arrival 1.', 'https://placehold.co/600x400.png', 'new product', FALSE, FALSE, (SELECT id FROM categories WHERE name = 'Bakery')),
('New Arrival Product 2', 19.99, 'Another brand new product.', 'Description for new arrival 2.', 'https://placehold.co/600x400.png', 'another new product', FALSE, FALSE, (SELECT id FROM categories WHERE name = 'Vegetables'));

INSERT INTO hero_banners (title, subtitle, cta_text, cta_link, image_url, data_ai_hint) VALUES
('Experience Freshness, Delivered.', 'The best organic produce and artisanal goods, right to your doorstep.', 'Shop Now', '#featured-products', 'https://placehold.co/1600x900.png', 'fresh market stall');

INSERT INTO testimonials (name, quote, rating, image_url) VALUES
('Sarah L.', 'The produce is always so fresh and the sourdough is to die for! I love that I can get high-quality, organic food delivered right to my door.', 5, 'https://placehold.co/100x100.png'),
('Mike R.', 'Verdant Market has changed the way I shop for groceries. The quality is unmatched and the service is fantastic.', 5, 'https://placehold.co/100x100.png');

INSERT INTO offers (title, description, image_url) VALUES
('Get 10% Off Your First Order', 'Sign up today and receive a discount on your first purchase.', 'https://placehold.co/400x200.png'),
('Free Shipping on Orders Over $50', 'Stock up on your favorites and get them delivered for free.', 'https://placehold.co/400x200.png');
