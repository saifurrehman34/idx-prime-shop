import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from './data-table';
import { columns } from './columns';
import type { HeroSlide } from '@/types';

async function getHeroSlides(): Promise<HeroSlide[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('hero_slides')
        .select(`*`)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching hero slides:', error);
        return [];
    }

    return data as HeroSlide[];
}

export default async function AdminHeroSlidesPage() {
    const slides = await getHeroSlides();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Hero Slides</CardTitle>
                    <CardDescription>Manage your homepage hero slides.</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/admin/hero/add">Add Slide</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={slides} />
            </CardContent>
        </Card>
    );
}
