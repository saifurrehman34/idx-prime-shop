import Image from 'next/image';
import Link from 'next/link';
import { Terminal } from 'lucide-react';

import { ProductCard } from '@/components/product-card';
import { CategoryCard } from '@/components/category-card';
import { NewsletterForm } from '@/components/newsletter-form';
import { createClient } from '@/lib/supabase/server';
import type { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function Home() {
  const supabase = createClient();
  
  const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*').order('name');
  const { data: featuredProductsData, error: featuredError } = await supabase.from('products').select('*').eq('is_featured', true).limit(4);
  const { data: newArrivalsData, error: newArrivalsError } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(4);

  const error = categoriesError || featuredError || newArrivalsError;
  if (error) {
    console.error('Error fetching homepage data:', error);
  }

  const categories: Category[] = categoriesData || [];
  const featuredProducts: Product[] = featuredProductsData?.map(p => ({ ...p, imageUrl: p.image_url, longDescription: p.long_description, dataAiHint: p.data_ai_hint })) || [];
  const newArrivals: Product[] = newArrivalsData?.map(p => ({ ...p, imageUrl: p.image_url, longDescription: p.long_description, dataAiHint: p.data_ai_hint })) || [];

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] max-h-[500px] -mt-16 md:-mt-24">
        <div className="container mx-auto h-full flex items-center">
            <Image
              src="https://placehold.co/1600x900.png"
              alt="Fresh produce on a market stall"
              fill
              className="object-cover"
              data-ai-hint="fresh market stall"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4 w-full">
              <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 drop-shadow-lg">
                Experience Freshness, Delivered.
              </h1>
              <p className="text-lg md:text-xl max-w-2xl mb-8 drop-shadow">
                The best organic produce and artisanal goods, right to your doorstep.
              </p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                <Link href="#featured-products">Shop Now</Link>
              </Button>
            </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 space-y-16 md:space-y-24">
        {/* Error handling */}
        {error && (
           <Alert variant="destructive">
             <Terminal className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>
               Could not fetch homepage data. Please ensure your Supabase project is set up correctly and the database schema is up to date.
             </AlertDescription>
           </Alert>
        )}

        {/* Categories Section */}
        <section id="categories-section">
          <h2 className="text-3xl font-bold font-headline text-center mb-10">Shop by Category</h2>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {categories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : !error && (
            <p className="text-center text-muted-foreground">No categories found.</p>
          )}
        </section>

        {/* Featured Products Section */}
        <section id="featured-products" className="scroll-mt-20">
          <h2 className="text-3xl font-bold font-headline text-center mb-10">Featured Products</h2>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : !error && (
            <p className="text-center text-muted-foreground">No featured products found.</p>
          )}
        </section>

        {/* New Arrivals Section */}
        <section id="new-arrivals">
          <h2 className="text-3xl font-bold font-headline text-center mb-10">New Arrivals</h2>
          {newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {newArrivals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : !error && (
             <p className="text-center text-muted-foreground">No new arrivals found.</p>
          )}
        </section>
        
        {/* Newsletter Section */}
        <section id="newsletter" className="bg-muted/50 rounded-xl p-8 md:p-12">
            <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold font-headline mb-4">Stay in the Loop</h2>
                <p className="text-muted-foreground mb-6">
                    Sign up for our newsletter to get the latest on new products, special offers, and more.
                </p>
                <NewsletterForm />
            </div>
        </section>
      </div>
    </div>
  );
}
