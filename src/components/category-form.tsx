'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { addCategory, updateCategory } from '@/app/admin/categories/actions';
import type { Category } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CategoryFormProps {
  category?: Category | null;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Category' : 'Add Category')}
    </Button>
  );
}

export function CategoryForm({ category }: CategoryFormProps) {
  const isEditing = !!category;
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const action = isEditing ? updateCategory.bind(null, category.id) : addCategory;

  const [state, formAction] = useFormState(action, {
    message: '',
    success: false,
    errors: {},
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: "Success!", description: state.message });
      } else {
        toast({ variant: 'destructive', title: "Error", description: state.message });
      }
    }
  }, [state, toast]);

  const getError = (field: string) => state.errors?.[field]?.[0];

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" name="name" defaultValue={category?.name} required />
        {getError('name') && <p className="text-sm text-destructive">{getError('name')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input id="image_url" name="image_url" type="url" defaultValue={category?.image_url || 'https://placehold.co/100x100.png'} required />
        {getError('image_url') && <p className="text-sm text-destructive">{getError('image_url')}</p>}
        <p className="text-xs text-muted-foreground">Provide a URL for the category image. Use a placeholder if needed.</p>
      </div>
      
       <div className="space-y-2">
            <Label htmlFor="data_ai_hint">Image AI Hint</Label>
            <Input id="data_ai_hint" name="data_ai_hint" defaultValue={category?.data_ai_hint || ''} required placeholder="e.g. fresh vegetables"/>
            {getError('data_ai_hint') && <p className="text-sm text-destructive">{getError('data_ai_hint')}</p>}
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <SubmitButton isEditing={isEditing} />
      </div>
    </form>
  );
}
