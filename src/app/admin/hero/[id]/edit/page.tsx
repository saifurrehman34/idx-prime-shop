import { createAdminClient } from '@/lib/supabase/admin';
import { HeroSlideForm } from '@/components/hero-slide-form';
import type { HeroSlide } from '@/types';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

async function getHeroSlideData(id: string) {
    const supabase = createAdminClient();
    
    const { data: slide, error: slideError } = await supabase.from('hero_slides').select('*').eq('id', id).single();

    if (slideError) {
        console.error('Error fetching hero slide for edit:', slideError);
        notFound();
    }
    
    return { slide };
}


export default async function EditHeroSlidePage({ params }: { params: { id: string } }) {
    const { slide } = await getHeroSlideData(params.id);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Hero Slide</CardTitle>
                <CardDescription>Update the details for "{slide.title}".</CardDescription>
            </CardHeader>
            <CardContent>
                <HeroSlideForm slide={slide} />
            </CardContent>
        </Card>
    );
}
