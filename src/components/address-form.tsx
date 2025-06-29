'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addAddress, updateAddress } from '@/app/user/addresses/actions';
import type { Address } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { DialogFooter, DialogClose } from './ui/dialog';

interface AddressFormProps {
  address?: Address | null;
  onSuccess: () => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Address')}
    </Button>
  );
}

export function AddressForm({ address, onSuccess }: AddressFormProps) {
  const isEditing = !!address;
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const action = isEditing ? updateAddress.bind(null, address.id) : addAddress;

  const [state, formAction] = useFormState(action, {
    message: '',
    success: false,
    errors: {},
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: "Success!", description: state.message });
        onSuccess();
      } else {
        toast({ variant: 'destructive', title: "Error", description: state.message });
      }
    }
  }, [state, toast, onSuccess]);
  
  useEffect(() => {
    if (!state.success && formRef.current) {
        // This keeps the form data on server-side validation failure
    } else {
        formRef.current?.reset();
    }
  }, [state.success]);

  const getError = (field: string) => state.errors?.[field]?.[0];

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address_line_1">Address</Label>
        <Input id="address_line_1" name="address_line_1" defaultValue={address?.address_line_1} required />
        {getError('address_line_1') && <p className="text-sm text-destructive">{getError('address_line_1')}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="address_line_2">Apartment, suite, etc. (optional)</Label>
        <Input id="address_line_2" name="address_line_2" defaultValue={address?.address_line_2 || ''} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={address?.city} required />
          {getError('city') && <p className="text-sm text-destructive">{getError('city')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State / Province</Label>
          <Input id="state" name="state" defaultValue={address?.state} required />
          {getError('state') && <p className="text-sm text-destructive">{getError('state')}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input id="postal_code" name="postal_code" defaultValue={address?.postal_code} required />
          {getError('postal_code') && <p className="text-sm text-destructive">{getError('postal_code')}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={address?.country || 'USA'} required />
          {getError('country') && <p className="text-sm text-destructive">{getError('country')}</p>}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <SubmitButton isEditing={isEditing} />
      </DialogFooter>
    </form>
  );
}
