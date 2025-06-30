import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserDashboardSidebar } from "@/components/user-dashboard-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

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
        <SidebarProvider>
            <UserDashboardSidebar 
                userName={profile?.full_name || 'User'}
                userEmail={user.email || ''}
                avatarUrl={profile?.avatar_url}
            />
            <SidebarInset>
                <header className="flex h-[57px] flex-shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6">
                    <div className="md:hidden">
                        <SidebarTrigger />
                    </div>
                    <h1 className="flex-1 text-xl font-semibold">My Account</h1>
                    <ThemeToggle />
                </header>
                <main className="flex-1 overflow-y-auto">
                    <div className="flex flex-col gap-4 p-4 sm:px-6 sm:py-6 lg:gap-6">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
