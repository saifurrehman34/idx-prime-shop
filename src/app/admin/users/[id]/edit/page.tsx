import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { UserRoleForm } from '@/components/user-role-form';

async function getUser(id: string) {
    const supabase = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(id);

    if (authError || !user) {
        console.error("Error fetching user:", authError);
        notFound();
    }

    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', id)
        .single();
    
    if (profileError) {
        // A profile might not exist, so we can treat it as a 'user' role by default
        console.warn("Could not fetch user profile, assuming 'user' role.", profileError.message);
    }
    
    return {
        id: user.id,
        email: user.email,
        role: profile?.role || 'user',
    };
}

export default async function EditUserPage({ params }: { params: { id: string } }) {
    const user = await getUser(params.id);
    
    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle>Edit User Role</CardTitle>
                <CardDescription>Change the role for the user: {user.email}</CardDescription>
            </CardHeader>
            <CardContent>
                <UserRoleForm user={user} />
            </CardContent>
        </Card>
    );
}
