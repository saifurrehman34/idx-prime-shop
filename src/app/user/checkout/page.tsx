import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CheckoutForm } from '@/components/checkout-form';

export default async function CheckoutPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login?message=Please log in to proceed to checkout.');
    }

    const { data: addresses, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch addresses:', error);
    }
    
    // The CheckoutForm component can handle an empty or undefined initialAddresses array
    return <CheckoutForm initialAddresses={addresses || []} />
}
