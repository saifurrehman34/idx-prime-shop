import { CategoryForm } from '@/components/category-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default async function AddCategoryPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Category</CardTitle>
                <CardDescription>Fill out the form below to add a new category.</CardDescription>
            </CardHeader>
            <CardContent>
                <CategoryForm />
            </CardContent>
        </Card>
    );
}
