
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Package, LayoutDashboard, ShoppingBag, Heart, Star, MapPin, Settings, LogOut } from "lucide-react";

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
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                    <Package />
                    <span className="group-data-[collapsible=icon]:hidden">Verdant Market</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <Link href={item.href}>
                                <SidebarMenuButton
                                    isActive={pathname.startsWith(item.href)}
                                    tooltip={item.label}
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter>
                <SidebarMenu>
                    {settingsNavItems.map((item) => (
                         <SidebarMenuItem key={item.href}>
                            <Link href={item.href}>
                                <SidebarMenuButton
                                    isActive={pathname.startsWith(item.href)}
                                    tooltip={item.label}
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>
                    ))}
                    <SidebarMenuItem>
                         <form action={logout} className="w-full">
                            <SidebarMenuButton tooltip="Log out">
                                <LogOut />
                                <span>Log out</span>
                            </SidebarMenuButton>
                        </form>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarSeparator />
                 <div className="flex items-center gap-3 p-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={avatarUrl || ''} alt={userName} />
                        <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate group-data-[collapsible=icon]:hidden">
                        <div className="font-medium truncate">{userName}</div>
                        <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
