import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createGenericClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import { Product, Category, ReviewWithAuthor } from '@/types';
import { ProductDetailsView } from '@/components/product-details-view';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const productPromise = supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', params.id)
    .single();

  const reviewsPromise = supabase
    .from('reviews')
    .select('*, user_profiles(full_name, avatar_url)')
    .eq('product_id', params.id)
    .order('created_at', { ascending: false });

  const { data: { user } } = await supabase.auth.getUser();
  const hasPurchasedPromise = user ? supabase.rpc('user_has_purchased_product', { p_user_id: user.id, p_product_id: params.id }) : Promise.resolve({ data: false });


  const [{ data: productData, error }, { data: reviewsData }, { data: hasPurchased }] = await Promise.all([productPromise, reviewsPromise, hasPurchasedPromise]);

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
  const reviews = (reviewsData as ReviewWithAuthor[]) || [];

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
      <ProductDetailsView 
        product={product} 
        imageUrls={imageUrls} 
        reviews={reviews}
        hasPurchased={!!hasPurchased}
        isUserLoggedIn={!!user}
        />
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
