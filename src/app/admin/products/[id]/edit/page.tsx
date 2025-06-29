import { createAdminClient } from '@/lib/supabase/admin';
import { ProductForm } from '@/components/product-form';
import type { Category, Product } from '@/types';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

async function getProductData(id: string) {
    const supabase = createAdminClient();
    
    const productPromise = supabase.from('products').select('*').eq('id', id).single();
    const categoriesPromise = supabase.from('categories').select('*').order('name');

    const [{ data: product, error: productError }, { data: categories, error: categoriesError }] = await Promise.all([
        productPromise,
        categoriesPromise
    ]);

    if (productError) {
        console.error('Error fetching product for edit:', productError);
        notFound();
    }
    
    if (categoriesError) {
        console.error('Error fetching categories for form:', categoriesError);
    }
    
    return { product, categories: categories || [] };
}


export default async function EditProductPage({ params }: { params: { id: string } }) {
    const { product, categories } = await getProductData(params.id);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Product</CardTitle>
                <CardDescription>Update the details for "{product.name}".</CardDescription>
            </CardHeader>
            <CardContent>
                <ProductForm categories={categories} product={product} />
            </CardContent>
        </Card>
    );
}
