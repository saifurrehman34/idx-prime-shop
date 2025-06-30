
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, ShoppingBag, Heart, Star, MapPin, Settings, LogOut } from "lucide-react";

interface UserDashboardSidebarProps {
    userName: string;
    userEmail: string;
    avatarUrl: string | null;
}

const navItems = [
    { href: "/user/home", label: "Dashboard", icon: LayoutDashboard },
    { href: "/user/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/user/wishlist", label: "My Wishlist", icon: Heart },
    { href: "/user/reviews", label: "My Reviews", icon: Star },
    { href: "/user/addresses", label: "Manage Addresses", icon: MapPin },
    { href: "/user/settings", label: "Profile Settings", icon: Settings },
];

export function UserDashboardSidebar({ userName, userEmail, avatarUrl }: UserDashboardSidebarProps) {
    const pathname = usePathname();

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col items-center text-center mb-6">
                    <Avatar className="h-20 w-20 mb-2">
                        <AvatarImage src={avatarUrl || ''} alt={userName} />
                        <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-lg font-semibold">{userName}</h2>
                    <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
                <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                        <Button
                            key={item.label}
                            asChild
                            variant={pathname === item.href ? "secondary" : "ghost"}
                            className="justify-start"
                        >
                            <Link href={item.href}>
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                     <form action={logout}>
                        <Button variant="ghost" className="w-full justify-start mt-2">
                           <LogOut className="mr-2 h-4 w-4" />
                           Logout
                        </Button>
                    </form>
                </nav>
            </CardContent>
        </Card>
    );
}
