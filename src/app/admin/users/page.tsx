import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from './data-table';
import { columns, type User } from './columns';

async function getUsers(): Promise<User[]> {
    const supabase = createAdminClient();
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
        console.error('Error fetching auth users:', authError);
        return [];
    }

    const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');
    
    if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        return [];
    }

    const profilesMap = new Map(profiles.map(p => [p.id, p]));

    const users: User[] = authUsers.users.map(user => {
        const profile = profilesMap.get(user.id);
        return {
            id: user.id,
            full_name: profile?.full_name || user.user_metadata?.full_name || 'N/A',
            avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
            role: profile?.role || 'user',
            email: user.email || 'N/A',
        };
    });

    return users;
}

export default async function AdminUsersPage() {
    const users = await getUsers();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage all registered users.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={users} />
            </CardContent>
        </Card>
    );
}
