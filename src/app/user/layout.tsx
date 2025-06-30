import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserDashboardSidebar } from "@/components/user-dashboard-sidebar";

export default async function UserDashboardLayout({ children }: { children: ReactNode }) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    const { data: profile } = await supabase.from('user_profiles').select('full_name, avatar_url, role').eq('id', user.id).single();

    // If the user is an admin, redirect them to the admin dashboard.
    // This handles the role-based redirect after login.
    if (profile?.role === 'admin') {
        return redirect('/admin/dashboard');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <UserDashboardSidebar 
                        userName={profile?.full_name || 'User'} 
                        userEmail={user.email || ''} 
                        avatarUrl={profile?.avatar_url}
                    />
                </div>
                <main className="md:col-span-3">
                    {children}
                </main>
            </div>
        </div>
    );
}
