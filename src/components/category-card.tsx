import Link from 'next/link';
import type { Category } from '@/types';
import { Sandwich, Apple, Carrot, Beef, Archive, GlassWater } from 'lucide-react';
import { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<{className: string}>> = {
  'Bakery': Sandwich,
  'Fruits': Apple,
  'Vegetables': Carrot,
  'Meats': Beef,
  'Pantry': Archive,
  'Dairy': GlassWater,
};

export function CategoryCard({ category }: { category: Category }) {
  const Icon = iconMap[category.name] || Sandwich;

  return (
    <Link href="#" className="group block">
      <div className="border rounded-md flex flex-col items-center justify-center gap-4 h-36 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-14 w-14" />
        <p className="text-sm font-medium truncate">{category.name}</p>
      </div>
    </Link>
  );
}
