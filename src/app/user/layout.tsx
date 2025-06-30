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
            <div className="flex flex-col md:flex-row md:gap-8">
                <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 mb-8 md:mb-0">
                    <div className="md:sticky md:top-28">
                        <UserDashboardSidebar 
                            userName={profile?.full_name || 'User'} 
                            userEmail={user.email || ''} 
                            avatarUrl={profile?.avatar_url}
                        />
                    </div>
                </aside>
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
