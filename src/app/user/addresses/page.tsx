import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AddressManager } from '@/components/address-manager';
import type { Address } from '@/types';

async function getAddresses() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }

  return data as Address[];
}

export default async function AddressesPage() {
  const addresses = await getAddresses();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Addresses</CardTitle>
        <CardDescription>
          Add, edit, or remove your shipping addresses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AddressManager initialAddresses={addresses} />
      </CardContent>
    </Card>
  );
}
