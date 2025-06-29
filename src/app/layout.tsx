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
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Verdant Market',
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background antialiased", inter.className)}>
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
