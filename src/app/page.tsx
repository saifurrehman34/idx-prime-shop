import { ProductCard } from '@/components/product-card';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types';

export default async function Home() {
  const supabase = createClient();
  const { data: productsData, error } = await supabase.from('products').select('*');

  if (error) {
    console.error('Error fetching products:', error);
    return <p className="text-center text-muted-foreground">Could not fetch products. Please ensure your Supabase project is set up correctly.</p>;
  }
  
  if (!productsData || productsData.length === 0) {
    return <p className="text-center text-muted-foreground">No products found. You might want to seed your database.</p>;
  }

  const products: Product[] = productsData.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.image_url,
    description: p.description,
    longDescription: p.long_description,
    dataAiHint: p.data_ai_hint,
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
