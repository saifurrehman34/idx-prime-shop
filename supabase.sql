-- Create the products table
CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  data_ai_hint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for the products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to products
CREATE POLICY "Allow public read access to products"
ON public.products
FOR SELECT
TO anon
USING (true);

-- Insert initial product data
INSERT INTO public.products (name, price, image_url, description, long_description, data_ai_hint)
VALUES
  ('Organic Avocados', 4.99, 'https://placehold.co/600x400.png', 'Pack of 4 creamy, organic Hass avocados.', 'Our organic Hass avocados are grown in nutrient-rich soil without synthetic pesticides. They are known for their creamy texture and rich, nutty flavor. Perfect for toast, salads, or guacamole.', 'organic avocados'),
  ('Fresh Strawberries', 3.49, 'https://placehold.co/600x400.png', '1 lb of sweet, juicy strawberries.', 'Hand-picked at peak ripeness, our strawberries are bursting with sweet, natural flavor. They are a great source of Vitamin C and antioxidants. Enjoy them fresh, in desserts, or as a healthy snack.', 'fresh strawberries'),
  ('Artisanal Sourdough', 5.99, 'https://placehold.co/600x400.png', 'A freshly baked loaf of artisanal sourdough bread.', 'Baked daily using a traditional starter, our sourdough has a delightful tangy flavor, a chewy crumb, and a perfectly crisp crust. It''s made with organic flour and contains no preservatives.', 'sourdough bread'),
  ('Free-Range Eggs', 6.29, 'https://placehold.co/600x400.png', 'One dozen large brown free-range eggs.', 'Our hens are free to roam on open pastures, resulting in eggs with rich, flavorful yolks. These free-range eggs are a testament to our commitment to ethical and sustainable farming.', 'free-range eggs'),
  ('Heirloom Tomatoes', 4.79, 'https://placehold.co/600x400.png', 'A mix of colorful and flavorful heirloom tomatoes.', 'Experience the vibrant colors and diverse flavors of our heirloom tomatoes. Grown from seeds passed down through generations, each variety offers a unique taste, from sweet to tangy. Perfect for salads and sauces.', 'heirloom tomatoes'),
  ('Cold-Pressed Olive Oil', 12.99, 'https://placehold.co/600x400.png', '500ml bottle of extra virgin cold-pressed olive oil.', 'Our extra virgin olive oil is cold-pressed from the finest olives to preserve its natural antioxidants and robust, fruity flavor. It''s perfect for dressings, dipping, or finishing your favorite dishes.', 'olive oil');