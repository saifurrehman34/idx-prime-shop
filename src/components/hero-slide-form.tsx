'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { addHeroSlide, updateHeroSlide } from '@/app/admin/hero/actions';
import type { HeroSlide } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface HeroSlideFormProps {
  slide?: HeroSlide | null;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Slide' : 'Add Slide')}
    </Button>
  );
}

export function HeroSlideForm({ slide }: HeroSlideFormProps) {
  const isEditing = !!slide;
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const action = isEditing ? updateHeroSlide.bind(null, slide.id) : addHeroSlide;

  const [state, formAction] = useFormState(action, {
    message: '',
    success: false,
    errors: {},
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: "Success!", description: state.message });
        router.push('/admin/hero');
      } else {
        toast({ variant: 'destructive', title: "Error", description: state.message });
      }
    }
  }, [state, toast, router]);

  const getError = (field: string) => state.errors?.[field]?.[0];

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={slide?.title} required />
        {getError('title') && <p className="text-sm text-destructive">{getError('title')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" name="subtitle" defaultValue={slide?.subtitle || ''} />
        {getError('subtitle') && <p className="text-sm text-destructive">{getError('subtitle')}</p>}
      </div>

       <div className="space-y-2">
        <Label htmlFor="link">Link URL</Label>
        <Input id="link" name="link" type="url" defaultValue={slide?.link || ''} required placeholder="e.g. /products/some-product" />
        {getError('link') && <p className="text-sm text-destructive">{getError('link')}</p>}
      </div>
      
      <div className="space-y-2">
          <Label htmlFor="image_file">Slide Image</Label>
          <Input id="image_file" name="image_file" type="file" accept=".png,.jpg,.jpeg,.webp" />
          {slide?.image_url && (
              <div className="mt-4 space-y-2">
                  <Label>Current Image</Label>
                  <div className="relative h-24 w-48 rounded-md border">
                      <Image src={slide.image_url} alt={slide.title || 'Slide Image'} fill className="object-cover rounded-md" />
                  </div>
                  <Input type="hidden" name="image_url" value={slide.image_url} />
              </div>
          )}
          {getError('image_file') && <p className="text-sm text-destructive">{getError('image_file')}</p>}
      </div>

       <div className="space-y-2">
            <Label htmlFor="image_ai_hint">Image AI Hint</Label>
            <Input id="image_ai_hint" name="image_ai_hint" defaultValue={slide?.image_ai_hint || ''} placeholder="e.g. smartphone product"/>
            {getError('image_ai_hint') && <p className="text-sm text-destructive">{getError('image_ai_hint')}</p>}
      </div>

      <div className="flex items-center space-x-2">
          <Checkbox id="is_active" name="is_active" defaultChecked={slide?.is_active ?? true} />
          <Label htmlFor="is_active" className="text-sm font-medium">Is Active</Label>
          <p className="text-xs text-muted-foreground">Only active slides will be shown on the homepage.</p>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <SubmitButton isEditing={isEditing} />
      </div>
    </form>
  );
}
