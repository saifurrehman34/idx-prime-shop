'use client';

import { usePathname } from 'next/navigation';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TopHeader } from "@/components/top-header";
import type { Category } from '@/types';
import type { User } from '@supabase/supabase-js';

export function MainLayoutWrapper({
  children,
  categories,
  user
}: {
  children: React.ReactNode;
  categories: Category[];
  user: User | null;
}) {
  const pathname = usePathname();
  
  const isAdminPage = pathname.startsWith('/admin');
  const isUserPage = pathname.startsWith('/user');
  
  const noHeaderFooterRoutes = ['/login', '/signup'];
  const showHeaderFooter = !isAdminPage && !isUserPage && !noHeaderFooterRoutes.includes(pathname);

  if (showHeaderFooter) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopHeader />
        <Header categories={categories} user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  // For admin, user, and auth pages, just render children
  // as they have their own specific layouts.
  return <>{children}</>;
}
