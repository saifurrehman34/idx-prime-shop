import { createClient } from '@/lib/supabase/server';
import { ProductFilterSidebar } from '@/components/product-filter-sidebar';
import { ProductCard } from '@/components/product-card';
import type { Product, Category } from '@/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Link from 'next/link';

const PRODUCTS_PER_PAGE = 9;

const parseImageUrl = (url: string | null): string => {
    if (!url) return 'https://placehold.co/600x400.png';
    try {
        const urls = JSON.parse(url);
        return Array.isArray(urls) && urls.length > 0 ? urls[0] : url;
    } catch {
        return url;
    }
};

async function getFilteredProducts({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const categoryName = searchParams.category as string;
  const minPrice = searchParams.min_price ? Number(searchParams.min_price) : null;
  const maxPrice = searchParams.max_price ? Number(searchParams.max_price) : null;
  const page = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;

  const offset = (page - 1) * PRODUCTS_PER_PAGE;

  let categoryId: string | null = null;
  if (categoryName) {
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();
    
    if (categoryError || !categoryData) {
      // Category not found, so return no products
      return { products: [], wishlistedProductIds: new Set(), totalProducts: 0 };
    }
    categoryId = categoryData.id;
  }

  let query = supabase
    .from('products')
    .select('*, categories (name)', { count: 'exact' });
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  if (minPrice !== null) {
    query = query.gte('price', minPrice);
  }
  if (maxPrice !== null) {
    query = query.lte('price', maxPrice);
  }
  
  query = query.order('created_at', { ascending: false }).range(offset, offset + PRODUCTS_PER_PAGE - 1);
  
  const { data: productsData, error: productsError, count: totalProducts } = await query;
  
  if (productsError) {
    console.error('Error fetching filtered products:', productsError);
    return { products: [], wishlistedProductIds: new Set(), totalProducts: 0 };
  }

  const { data: wishlistData } = user
    ? await supabase.from('wishlists').select('product_id').eq('user_id', user.id)
    : { data: [] };
  
  const wishlistedProductIds = new Set(wishlistData?.map(item => item.product_id) || []);
  
  const products: Product[] = productsData?.map(p => ({ ...p, imageUrl: parseImageUrl(p.image_url), longDescription: p.long_description, dataAiHint: p.data_ai_hint })) || [];

  return { products, wishlistedProductIds, totalProducts: totalProducts || 0 };
}


function buildPageLink(searchParams: URLSearchParams, pageNumber: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(pageNumber));
    return `/products?${params.toString()}`;
}


export default async function AllProductsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const { products, wishlistedProductIds, totalProducts } = await getFilteredProducts({ searchParams });
  const supabase = createClient();
  const { data: categoriesData } = await supabase.from('categories').select('*').order('name');
  const categories: Category[] = categoriesData || [];
  
  const page = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const currentParams = new URLSearchParams(searchParams as Record<string, string>);

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
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <ProductFilterSidebar categories={categories} />
        </aside>
        <main className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold tracking-tight">{searchParams.category || 'All Products'}</h1>
                <p className="text-sm text-muted-foreground">Showing {products.length} of {totalProducts} products</p>
            </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} isFavorited={wishlistedProductIds.has(product.id)} />
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center text-center py-20 border rounded-md h-full">
                <h3 className="text-2xl font-semibold">No Products Found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
            </div>
          )}

           {totalPages > 1 && (
            <div className="mt-12">
              <Pagination>
                <PaginationContent>
                    {page > 1 && <PaginationItem><PaginationPrevious href={buildPageLink(currentParams, page - 1)} /></PaginationItem>}
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <PaginationItem key={p}>
                        <PaginationLink href={buildPageLink(currentParams, p)} isActive={p === page}>
                            {p}
                        </PaginationLink>
                        </PaginationItem>
                    ))}

                    {page < totalPages && <PaginationItem><PaginationNext href={buildPageLink(currentParams, page + 1)} /></PaginationItem>}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
