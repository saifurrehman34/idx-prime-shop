'use client';

import { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { subscribeToNewsletter } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Subscribing...' : 'Subscribe'}
    </Button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useActionState(subscribeToNewsletter, {
    message: '',
    success: false,
  });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
            title: "Success!",
            description: state.message,
        });
        formRef.current?.reset();
      } else {
        toast({
            title: "Error",
            description: state.message,
            variant: "destructive",
        });
      }
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
      <Input
        type="email"
        name="email"
        placeholder="Enter your email"
        required
        className="flex-grow bg-background"
      />
      <SubmitButton />
    </form>
  );
}
