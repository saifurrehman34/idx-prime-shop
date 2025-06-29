import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { Category } from '@/types';

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href="#" className="group block">
      <Card className="overflow-hidden text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-square">
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 15vw"
            data-ai-hint={category.data_ai_hint}
          />
        </div>
        <div className="p-2">
          <p className="text-sm font-semibold truncate group-hover:text-primary">{category.name}</p>
        </div>
      </Card>
    </Link>
  );
}
