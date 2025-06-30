import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    const { data: profile } = await supabase.from('user_profiles').select('role, full_name, avatar_url').eq('id', user.id).single();

    if (profile?.role !== 'admin') {
        return redirect('/user/home');
    }

    return (
        <SidebarProvider>
            <AdminSidebar 
                userName={profile.full_name || 'Admin'}
                userEmail={user.email || ''}
                avatarUrl={profile.avatar_url}
            />
            <SidebarInset className="h-svh flex-col overflow-hidden">
                <header className="flex h-[57px] flex-shrink-0 items-center gap-1 border-b bg-background px-4">
                    <div className="md:hidden">
                        <SidebarTrigger />
                    </div>
                    <h1 className="flex-1 text-xl font-semibold">Dashboard</h1>
                    <ThemeToggle />
                </header>
                <main className="flex-1 overflow-y-auto">
                    <div className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
