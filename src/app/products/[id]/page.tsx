import Image from 'next/image';
import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-2 gap-0 md:gap-8">
        <div className="relative aspect-square">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={product.dataAiHint}
          />
        </div>
        <div className="p-8 flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-bold font-headline mb-2">{product.name}</h1>
          <p className="text-muted-foreground text-lg mb-4">{product.description}</p>
          <Separator className="my-4" />
          <p className="mb-6">{product.longDescription}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-auto gap-4">
            <span className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</span>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export async function generateStaticParams() {
    return products.map(product => ({
        id: product.id,
    }));
}
