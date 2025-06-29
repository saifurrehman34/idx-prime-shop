"use client";

import React from 'react';
import Link from 'next/link';
import { Leaf, ShoppingCart, Heart, Search, User as UserIcon, Menu, LogOut } from 'lucide-react';
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
import { useCart } from '@/hooks/use-cart';
import { Cart } from '@/components/cart';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';
import { logout } from '@/app/auth/actions';

export function Header({ categories, user }: { categories: Category[]; user: User | null }) {
  const { cartCount } = useCart();

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left Side: Logo and Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Leaf className="h-6 w-6" />
            <span className="font-headline">Verdant Market</span>
          </Link>
          <nav className="hidden md:flex gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
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
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
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
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            {user ? (
              <>
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Wishlist</span>
                </Button>
                <form action={logout}>
                    <Button variant="ghost" size="icon" type="submit">
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Logout</span>
                    </Button>
                </form>
              </>
            ) : (
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/login">
                        <UserIcon className="h-5 w-5" />
                        <span className="sr-only">Login</span>
                    </Link>
                </Button>
            )}
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
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
                <Button variant="ghost" size="icon">
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
                     <form action={logout}>
                       <Button variant="ghost" type="submit" className="w-full justify-start gap-2 text-lg font-medium hover:text-primary">
                          <LogOut className="h-5 w-5" /> Logout
                       </Button>
                     </form>
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
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
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
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
