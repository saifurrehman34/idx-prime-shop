'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddressForm } from './address-form';
import type { Address } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { deleteAddress, setDefaultAddress } from '@/app/user/addresses/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from './ui/badge';

interface AddressManagerProps {
  initialAddresses: Address[];
}

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const { toast } = useToast();

  const openFormForEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const openFormForNew = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteAddress(id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } else {
      toast({ variant: 'destructive', title: "Error", description: result.message });
    }
  };

  const handleSetDefault = async (id: string) => {
    const result = await setDefaultAddress(id);
     if (result.success) {
      toast({ title: "Success", description: result.message });
      // The revalidation should handle the state update, but we can do it client-side for faster feedback
      setAddresses(prev => prev.map(addr => ({ ...addr, is_default: addr.id === id })));
    } else {
      toast({ variant: 'destructive', title: "Error", description: result.message });
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <div className="flex justify-end">
            <Button onClick={openFormForNew}>
                <Plus className="mr-2 h-4 w-4" /> Add New Address
            </Button>
        </div>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <AddressForm
            address={editingAddress}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
      
      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div key={address.id} className="border p-4 rounded-md flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold">{address.address_line_1}</p>
                    {address.is_default && <Badge>Default</Badge>}
                </div>
                <address className="not-italic text-muted-foreground text-sm">
                  {address.address_line_2 && <>{address.address_line_2}<br /></>}
                  {address.city}, {address.state} {address.postal_code}<br />
                  {address.country}
                </address>
              </div>
              <div className="flex items-center gap-2">
                 {!address.is_default && (
                    <Button variant="ghost" size="sm" onClick={() => handleSetDefault(address.id)}>Set as Default</Button>
                 )}
                <Button variant="outline" size="icon" onClick={() => openFormForEdit(address)}><Edit className="h-4 w-4" /></Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this address. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(address.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>You haven't added any addresses yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
