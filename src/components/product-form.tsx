'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { addProduct, updateProduct } from '@/app/admin/products/actions';
import type { Category, Product } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductFormProps {
  categories: Category[];
  product?: Product | null;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Product' : 'Add Product')}
    </Button>
  );
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const isEditing = !!product;
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const action = isEditing ? updateProduct.bind(null, product.id) : addProduct;

  const [state, formAction] = useFormState(action, {
    message: '',
    success: false,
    errors: {},
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: "Success!", description: state.message });
        if (!isEditing) {
           router.push('/admin/products');
        }
      } else {
        toast({ variant: 'destructive', title: "Error", description: state.message });
      }
    }
  }, [state, toast, isEditing, router]);

  const getError = (field: string) => state.errors?.[field]?.[0];

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
          {getError('name') && <p className="text-sm text-destructive">{getError('name')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required />
          {getError('price') && <p className="text-sm text-destructive">{getError('price')}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Textarea id="description" name="description" defaultValue={product?.description} required />
        {getError('description') && <p className="text-sm text-destructive">{getError('description')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="long_description">Long Description</Label>
        <Textarea id="long_description" name="long_description" rows={5} defaultValue={product?.long_description} required />
        {getError('long_description') && <p className="text-sm text-destructive">{getError('long_description')}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <Select name="category_id" defaultValue={product?.category_id || undefined} required>
                <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {getError('category_id') && <p className="text-sm text-destructive">{getError('category_id')}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" name="image_url" defaultValue={product?.image_url} required />
            {getError('image_url') && <p className="text-sm text-destructive">{getError('image_url')}</p>}
        </div>
      </div>

       <div className="space-y-2">
            <Label htmlFor="data_ai_hint">Image AI Hint</Label>
            <Input id="data_ai_hint" name="data_ai_hint" defaultValue={product?.data_ai_hint} required placeholder="e.g. gaming laptop"/>
            {getError('data_ai_hint') && <p className="text-sm text-destructive">{getError('data_ai_hint')}</p>}
      </div>

      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
            <Checkbox id="is_featured" name="is_featured" defaultChecked={product?.is_featured} />
            <Label htmlFor="is_featured" className="text-sm font-medium">Featured Product</Label>
        </div>
        <div className="flex items-center space-x-2">
            <Checkbox id="is_best_seller" name="is_best_seller" defaultChecked={product?.is_best_seller} />
            <Label htmlFor="is_best_seller" className="text-sm font-medium">Best Seller</Label>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <SubmitButton isEditing={isEditing} />
      </div>
    </form>
  );
}
