'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { subscribeToNewsletter } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="icon" className="absolute right-1 top-1 h-8 w-8">
      {pending ? '...' : <Send className="h-4 w-4" />}
    </Button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useFormState(subscribeToNewsletter, {
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
    <form ref={formRef} action={formAction} className="relative">
      <Input
        type="email"
        name="email"
        placeholder="Enter your email"
        required
        className="bg-transparent border-white text-white placeholder:text-gray-400 pr-12"
      />
      <SubmitButton />
    </form>
  );
}
