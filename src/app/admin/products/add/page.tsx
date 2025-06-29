
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductForm } from '@/components/product-form';
import type { Category } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

async function getCategories(): Promise<Category[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
        console.error('Error fetching categories for form:', error);
        return [];
    }
    return data;
}

export default async function AddProductPage() {
    const categories = await getCategories();
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Fill out the form below to add a new product to your store.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProductForm categories={categories} />
            </CardContent>
        </Card>
    );
}
