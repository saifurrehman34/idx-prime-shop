import Image from 'next/image';
import Link from 'next/link';
import { Terminal } from 'lucide-react';

import { ProductCard } from '@/components/product-card';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function Home() {
  const supabase = createClient();
  const { data: productsData, error } = await supabase.from('products').select('*');

  if (error) {
    console.error('Error fetching products:', error);
  }

  const products: Product[] = productsData?.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.image_url,
    description: p.description,
    longDescription: p.long_description,
    dataAiHint: p.data_ai_hint,
  })) || [];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] max-h-[500px] rounded-xl overflow-hidden -mt-8">
        <Image
          src="https://placehold.co/1600x900.png"
          alt="Fresh produce on a market stall"
          fill
          className="object-cover"
          data-ai-hint="fresh market stall"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 drop-shadow-lg">
            Experience Freshness, Delivered.
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8 drop-shadow">
            The best organic produce and artisanal goods, right to your doorstep.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
            <Link href="#products-section">Shop Now</Link>
          </Button>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="scroll-mt-20">
        <h2 className="text-3xl font-bold font-headline text-center mb-10">Our Featured Products</h2>
        
        {error && (
           <Alert variant="destructive">
             <Terminal className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>
               Could not fetch products. Please ensure your Supabase project is set up correctly.
             </AlertDescription>
           </Alert>
        )}
        
        {!error && products.length === 0 && (
          <p className="text-center text-muted-foreground">No products found. You might want to seed your database.</p>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
