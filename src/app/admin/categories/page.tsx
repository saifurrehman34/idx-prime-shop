import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from './data-table';
import { columns } from './columns';
import type { Category } from '@/types';

async function getCategories(): Promise<Category[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data as Category[];
}

export default async function AdminCategoriesPage() {
    const categories = await getCategories();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Manage your product categories.</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/admin/categories/add">Add Category</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={categories} />
            </CardContent>
        </Card>
    );
}
