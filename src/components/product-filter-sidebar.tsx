'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function ProductFilterSidebar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get('min_price')) || 0,
    Number(searchParams.get('max_price')) || 5000,
  ]);

  const handlePriceCommit = (newRange: [number, number]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('min_price', String(newRange[0]));
    params.set('max_price', String(newRange[1]));
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };
  
  const buildCategoryLink = (categoryName: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (categoryName) {
          params.set('category', categoryName);
      } else {
          params.delete('category');
      }
      params.set('page', '1');
      return `/products?${params.toString()}`;
  }

  const clearFilters = () => {
    router.push('/products');
  }

  return (
    <Card className="sticky top-24">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Filters</CardTitle>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="-mr-2">Clear all</Button>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['categories', 'price']} className="w-full">
          <AccordionItem value="categories">
            <AccordionTrigger className="text-base font-semibold">Categories</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <Link href={buildCategoryLink(null)} className={cn("block text-sm py-1 hover:text-primary", !currentCategory && "text-primary font-semibold")}>All Products</Link>
                {categories.map(category => (
                  <Link 
                    key={category.id} 
                    href={buildCategoryLink(category.name)}
                    className={cn("block text-sm py-1 hover:text-primary", currentCategory === category.name && "text-primary font-semibold")}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="price">
            <AccordionTrigger className="text-base font-semibold">Price Range</AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4 pt-2">
                    <Slider
                        defaultValue={[0, 5000]}
                        max={5000}
                        step={50}
                        value={priceRange}
                        onValueChange={(range) => setPriceRange(range as [number, number])}
                        onValueCommit={(range) => handlePriceCommit(range as [number, number])}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                    </div>
                </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
