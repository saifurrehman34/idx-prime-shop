import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import type { ReviewWithAuthor } from '@/types';

async function getMyReviews() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            products (id, name, image_url, data_ai_hint)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user reviews:', error);
        return [];
    }
    return data;
}

export default async function ReviewsPage() {
  const reviews = await getMyReviews();

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reviews</CardTitle>
        <CardDescription>
          View and manage your product reviews.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-4 border-b pb-6 last:border-b-0">
                <Link href={`/products/${review.products?.id}`}>
                    <Image 
                        src={review.products?.image_url || 'https://placehold.co/100x100.png'}
                        alt={review.products?.name || 'Product image'}
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                        data-ai-hint={review.products?.data_ai_hint || ''}
                    />
                </Link>
                <div className="flex-1">
                    <h3 className="font-semibold text-lg hover:underline">
                        <Link href={`/products/${review.products?.id}`}>{review.products?.name}</Link>
                    </h3>
                    <div className="flex items-center gap-1 my-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/40'}`} />
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-2">Reviewed on {format(new Date(review.created_at), 'PPP')}</p>
                    <p className="text-sm">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>You haven't written any reviews yet.</p>
            <Button asChild className="mt-4">
                <Link href="/products">Find a product to review</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
