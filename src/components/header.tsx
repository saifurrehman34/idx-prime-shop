
"use client";

import React from 'react';
import Link from 'next/link';
import { Leaf, ShoppingCart, Search, Menu, LogOut, User as UserIcon, LayoutDashboard, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
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
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';
import { logout } from '@/app/auth/actions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function Header({ categories, user }: { categories: Category[]; user: User | null }) {
  const { cartCount } = useCart();

  return (
    <header className="bg-header text-header-foreground border-b border-header/80 sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left Side: Logo and Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-header-foreground">
            <Leaf className="h-6 w-6" />
            <span className="font-headline">Verdant Market</span>
          </Link>
          <nav className="hidden md:flex gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-white/10 focus:bg-white/10">Shop</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                      {categories.map((category) => (
                        <ListItem key={category.id} href="#" title={category.name}>
                          Explore our fresh {category.name.toLowerCase()}.
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="#new-arrivals" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-white/10 focus:bg-white/10")}>
                      New Arrivals
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>

        {/* Right Side: Icons and Mobile Menu */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-white/20 hover:text-header-foreground">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/20">
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
                    <Link href="/user/home"><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href="/user/wishlist"><Heart className="mr-2 h-4 w-4" /> Wishlist</Link>
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
                <Button variant="ghost" size="sm" asChild className="text-header-foreground hover:bg-white/20 hover:text-header-foreground">
                    <Link href="/login">
                        Login
                    </Link>
                </Button>
            )}
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-header-foreground hover:bg-white/20 hover:text-header-foreground">
                <ShoppingCart className="h-5 w-5" />
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

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-header-foreground hover:bg-white/20 hover:text-header-foreground">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-3/4">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-4">
                  <SheetClose asChild>
                     <Link href="#" className="text-lg font-medium hover:text-primary">Shop</Link>
                  </SheetClose>
                  {categories.map((category) => (
                    <SheetClose asChild key={category.id}>
                      <Link href="#" className="text-muted-foreground hover:text-primary pl-4">{category.name}</Link>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Link href="#new-arrivals" className="text-lg font-medium hover:text-primary">New Arrivals</Link>
                  </SheetClose>
                  <hr className="my-4"/>
                   {user ? (
                    <>
                      <SheetClose asChild>
                         <Link href="/user/home" className="flex items-center gap-2 text-lg font-medium hover:text-primary">
                            <LayoutDashboard className="h-5 w-5" /> Dashboard
                         </Link>
                      </SheetClose>
                      <form action={logout}>
                        <Button variant="ghost" type="submit" className="w-full justify-start gap-2 text-lg font-medium hover:text-primary">
                           <LogOut className="h-5 w-5" /> Logout
                        </Button>
                      </form>
                    </>
                   ) : (
                    <>
                      <SheetClose asChild>
                         <Link href="/login" className="flex items-center gap-2 text-lg font-medium hover:text-primary">
                            <UserIcon className="h-5 w-5" /> Login
                         </Link>
                      </SheetClose>
                    </>
                   )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
