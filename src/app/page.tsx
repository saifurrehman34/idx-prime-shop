import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Eye, Heart, Star, Ship, Headset, ShieldCheck, Headphones } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { CategoryCard } from '@/components/category-card';
import { Countdown } from '@/components/countdown';
import { createClient } from '@/lib/supabase/server';
import type { Product, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('*').order('name');
  const { data: featuredProductsData, error: featuredError } = await supabase.from('products').select('*').eq('is_featured', true).limit(8);
  const { data: bestSellersData, error: bestSellersError } = await supabase.from('products').select('*').eq('is_best_seller', true).limit(4);
  const { data: allProductsData, error: allProductsError } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(8);

  const { data: wishlistData } = user
    ? await supabase.from('wishlists').select('product_id').eq('user_id', user.id)
    : { data: [] };
  const wishlistedProductIds = new Set(wishlistData?.map(item => item.product_id) || []);

  const error = categoriesError || featuredError || allProductsError || bestSellersError;
  if (error) {
    console.error('Error fetching homepage data:', error);
  }

  const categories: Category[] = categoriesData || [];
  const featuredProducts: Product[] = featuredProductsData?.map(p => ({ ...p, imageUrl: p.image_url, longDescription: p.long_description, dataAiHint: p.data_ai_hint })) || [];
  const bestSellers: Product[] = bestSellersData?.map(p => ({ ...p, imageUrl: p.image_url, longDescription: p.long_description, dataAiHint: p.data_ai_hint })) || [];
  const allProducts: Product[] = allProductsData?.map(p => ({ ...p, imageUrl: p.image_url, longDescription: p.long_description, dataAiHint: p.data_ai_hint })) || [];

  const fourDaysFromNow = new Date();
  fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);

  return (
    <div className="flex flex-col">
      <div className="container mx-auto px-4 pt-8">
        <div className="bg-primary/10 rounded-lg p-8 md:p-12 lg:p-16 grid md:grid-cols-2 items-center gap-8">
            <div className="flex flex-col items-start text-left">
                <p className="font-semibold text-primary mb-2">Discover Freshness</p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-4">
                    The Best Organic Products, Online
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-md">
                    From farm to table, we deliver the freshest organic produce and pantry staples right to your doorstep.
                </p>
                <Button size="lg" asChild>
                    <Link href="#">
                        Shop All Products <ArrowRight className="ml-2"/>
                    </Link>
                </Button>
            </div>
            <div className="relative h-64 md:h-full w-full rounded-lg overflow-hidden">
                <Image
                    src="https://source.unsplash.com/featured/800x600/?grocery,organic"
                    alt="Fresh organic vegetables"
                    fill
                    className="object-cover"
                    data-ai-hint="fresh vegetables"
                />
            </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-16 md:mt-32 space-y-16 md:space-y-24">
        {/* Flash Sales Section */}
        <section id="flash-sales">
          <div className="flex items-end gap-8 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-5 h-10 bg-primary rounded"></div>
                <p className="text-primary font-semibold">Today's</p>
              </div>
              <h2 className="text-3xl font-bold">Flash Sales</h2>
            </div>
            <Countdown targetDate={fourDaysFromNow} />
          </div>
           <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent className="-ml-4">
              {featuredProducts.map((product) => (
                <CarouselItem key={product.id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
                  <ProductCard product={product} isFavorited={wishlistedProductIds.has(product.id)} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -top-14 right-14" />
            <CarouselNext className="absolute -top-14 right-2" />
          </Carousel>
        </section>
        <Separator />

        {/* Categories Section */}
        <section id="categories-section">
           <div className="flex items-center gap-4 mb-6">
            <div className="w-5 h-10 bg-primary rounded"></div>
            <p className="text-primary font-semibold">Categories</p>
          </div>
          <h2 className="text-3xl font-bold mb-10">Browse By Category</h2>
          <Carousel opts={{ align: "start", slidesToScroll: "auto" }} className="w-full">
            <CarouselContent className="-ml-4">
              {categories.map(category => (
                <CarouselItem key={category.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                  <CategoryCard category={category} />
                </CarouselItem>
              ))}
            </CarouselContent>
             <CarouselPrevious className="absolute -top-16 right-14" />
            <CarouselNext className="absolute -top-16 right-2" />
          </Carousel>
        </section>
        <Separator />

        {/* Best Sellers Section */}
        <section id="best-sellers">
           <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-5 h-10 bg-primary rounded"></div>
                <p className="text-primary font-semibold">This Month</p>
              </div>
              <h2 className="text-3xl font-bold">Best Selling Products</h2>
            </div>
            <Button>View All</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} isFavorited={wishlistedProductIds.has(product.id)} />
            ))}
          </div>
        </section>

        {/* Our Products Section */}
        <section id="our-products">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-5 h-10 bg-primary rounded"></div>
            <p className="text-primary font-semibold">Our Products</p>
          </div>
          <h2 className="text-3xl font-bold mb-10">Explore Our Products</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {allProducts.map(product => (
                <ProductCard key={product.id} product={product} isFavorited={wishlistedProductIds.has(product.id)} />
              ))}
            </div>
          <div className="text-center mt-12">
            <Button>View All Products</Button>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 text-center">
            <div className="flex flex-col items-center gap-4">
                <div className="bg-secondary p-3 rounded-full border-8 border-muted">
                    <Ship className="h-8 w-8 text-white bg-black rounded-full p-1"/>
                </div>
                <h3 className="font-semibold text-xl">FREE AND FAST DELIVERY</h3>
                <p className="text-sm">Free delivery for all orders over $140</p>
            </div>
            <div className="flex flex-col items-center gap-4">
                <div className="bg-secondary p-3 rounded-full border-8 border-muted">
                    <Headset className="h-8 w-8 text-white bg-black rounded-full p-1"/>
                </div>
                <h3 className="font-semibold text-xl">24/7 CUSTOMER SERVICE</h3>
                <p className="text-sm">Friendly 24/7 customer support</p>
            </div>
            <div className="flex flex-col items-center gap-4">
                <div className="bg-secondary p-3 rounded-full border-8 border-muted">
                    <ShieldCheck className="h-8 w-8 text-white bg-black rounded-full p-1"/>
                </div>
                <h3 className="font-semibold text-xl">MONEY BACK GUARANTEE</h3>
                <p className="text-sm">We return money within 30 days</p>
            </div>
        </section>
      </div>
    </div>
  );
}
