"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Heart, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCart } from '@/hooks/use-cart';
import { Cart } from '@/components/cart';
import type { Category } from '@/types';
import type { User } from '@supabase/supabase-js';
import { logout } from '@/app/auth/actions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Separator } from './ui/separator';

export function Header({ categories, user }: { categories: Category[]; user: User | null }) {
  const { cartCount } = useCart();

  return (
    <header className="bg-background text-foreground sticky top-0 z-40">
      <div className="container mx-auto flex h-20 items-center justify-between gap-8 px-4 border-b">
        {/* Left Side: Logo */}
        <Link href="/" className="text-2xl font-bold">
          Verdant Market
        </Link>
        
        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="#" className="hover:underline">Contact</Link>
          <Link href="#" className="hover:underline">About</Link>
          {!user && <Link href="/signup" className="hover:underline">Sign Up</Link>}
        </nav>
        
        {/* Right Side: Search and Icons */}
        <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
                <Input placeholder="What are you looking for?" className="bg-secondary pr-10" />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>

            <Button variant="ghost" size="icon" asChild>
                <Link href="/user/wishlist">
                    <Heart className="h-6 w-6" />
                    <span className="sr-only">Wishlist</span>
                </Link>
            </Button>
            
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-6 w-6" />
                    {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        {cartCount}
                    </span>
                    )}
                    <span className="sr-only">View Cart</span>
                </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>Your Cart</SheetTitle>
                </SheetHeader>
                <Cart />
                </SheetContent>
            </Sheet>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name || user.email} />
                       <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/user/home"><UserIcon className="mr-2 h-4 w-4" /> My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href="/user/orders"><ShoppingCart className="mr-2 h-4 w-4" /> My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <form action={logout}>
                    <DropdownMenuItem asChild>
                      <button type="submit" className="w-full">
                         <LogOut className="mr-2 h-4 w-4" /> Logout
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/login">
                        <UserIcon className="h-6 w-6" />
                    </Link>
                </Button>
            )}
        </div>
      </div>
    </header>
  );
}
