"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Home, LineChart, Package, ShoppingCart, Users, LogOut, GalleryHorizontalEnd } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
    userName: string;
    userEmail: string;
    avatarUrl: string | null;
}

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/users", label: "Customers", icon: Users },
    { href: "/admin/hero", label: "Hero Slides", icon: GalleryHorizontalEnd },
];

export function AdminSidebar({ userName, userEmail, avatarUrl }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Package className="h-6 w-6" />
                        <span className="">Prime Shop</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {navItems.map((item) => (
                             <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    pathname.startsWith(item.href) && "bg-muted text-primary"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-4">
                    <div className="flex items-center gap-3">
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={avatarUrl || ''} alt={userName} />
                            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 truncate">
                            <div className="font-medium truncate">{userName}</div>
                            <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
                        </div>
                        <form action={logout}>
                            <Button variant="ghost" size="icon">
                                <LogOut className="h-4 w-4"/>
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
