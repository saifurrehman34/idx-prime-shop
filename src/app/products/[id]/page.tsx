import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createGenericClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { Product, Category } from '@/types';
import { ProductDetailsView } from '@/components/product-details-view';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: productData, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', params.id)
    .single();

  if (error || !productData) {
    notFound();
  }

  let imageUrls: string[] = [];
  try {
    const parsedUrls = JSON.parse(productData.image_url);
    if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
      imageUrls = parsedUrls;
    } else {
        throw new Error("Not an array or empty");
    }
  } catch (e) {
    // Fallback for old single URL format or invalid JSON
    imageUrls = [productData.image_url];
  }
  
  const product: Product = {
    ...productData,
    imageUrl: imageUrls[0], // Main image
    longDescription: productData.long_description,
    dataAiHint: productData.data_ai_hint,
  };

  const category = productData.categories as Category | null;

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            {category && (
                <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/products?category=${category.name}`}>{category.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <ProductDetailsView product={product} imageUrls={imageUrls} />
    </div>
  );
}

export async function generateStaticParams() {
    const supabase = createGenericClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: products, error } = await supabase.from('products').select('id');

    if (error || !products) {
        return [];
    }

    return products.map(product => ({
        id: product.id.toString(),
    }));
}
