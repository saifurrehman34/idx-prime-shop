import { createAdminClient } from '@/lib/supabase/admin';
import { CategoryForm } from '@/components/category-form';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Category } from '@/types';

async function getCategoryData(id: string) {
    const supabase = createAdminClient();
    const { data: category, error } = await supabase.from('categories').select('*').eq('id', id).single();

    if (error) {
        console.error('Error fetching category for edit:', error);
        notFound();
    }
    
    return { category };
}

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
    const { category } = await getCategoryData(params.id);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Category</CardTitle>
                <CardDescription>Update the details for "{category.name}".</CardDescription>
            </CardHeader>
            <CardContent>
                <CategoryForm category={category} />
            </CardContent>
        </Card>
    );
}
