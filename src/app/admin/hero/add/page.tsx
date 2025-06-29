import { HeroSlideForm } from '@/components/hero-slide-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default async function AddHeroSlidePage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Hero Slide</CardTitle>
                <CardDescription>Fill out the form below to add a new slide to the homepage carousel.</CardDescription>
            </CardHeader>
            <CardContent>
                <HeroSlideForm />
            </CardContent>
        </Card>
    );
}
