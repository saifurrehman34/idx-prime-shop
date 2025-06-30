
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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
];

const settingsNavItems = [
    { href: "/user/settings", label: "Profile Settings", icon: Settings },
];

export function UserDashboardSidebar({ userName, userEmail, avatarUrl }: UserDashboardSidebarProps) {
    const pathname = usePathname();

    return (
        <div className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm">
            <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-14 w-14">
                    <AvatarImage src={avatarUrl || ''} alt={userName} />
                    <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-lg font-semibold truncate">{userName}</h2>
                    <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
                </div>
            </div>
            <Separator />
            <nav className="flex flex-col gap-1 py-4">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname === item.href && "bg-muted text-primary font-semibold"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>
            <Separator />
             <nav className="flex flex-col gap-1 pt-4">
                 {settingsNavItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                            pathname === item.href && "bg-muted text-primary font-semibold"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
                 <form action={logout}>
                    <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                       <LogOut className="h-4 w-4" />
                       Logout
                    </button>
                </form>
            </nav>
        </div>
    );
}
