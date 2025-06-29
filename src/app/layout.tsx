import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TopHeader } from "@/components/top-header";
import { cn } from "@/lib/utils";
import { createClient } from '@/lib/supabase/server';
import type { Category } from '@/types';
import type { User } from '@supabase/supabase-js';
import { PT_Sans } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Prime Shop',
  description: 'Fresh and organic products delivered to you.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: categoriesData } = await supabase.from('categories').select('*').order('name');
  const categories: Category[] = categoriesData || [];

  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background font-sans antialiased", ptSans.variable)}>
        <Providers>
            <div className="relative flex min-h-screen flex-col">
              <TopHeader />
              <Header categories={categories} user={user} />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
        </Providers>
      </body>
    </html>
  );
}
