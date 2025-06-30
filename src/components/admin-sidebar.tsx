
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, Package, ShoppingCart, Users, LogOut, GalleryHorizontalEnd, LayoutGrid, LifeBuoy, Settings } from "lucide-react";
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

interface AdminSidebarProps {
    userName: string;
    userEmail: string;
    avatarUrl: string | null;
}

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: LayoutGrid },
    { href: "/admin/users", label: "Customers", icon: Users },
    { href: "/admin/hero", label: "Hero Slides", icon: GalleryHorizontalEnd },
];

export function AdminSidebar({ userName, userEmail, avatarUrl }: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                    <Package />
                    <span className="group-data-[collapsible=icon]:hidden">Prime Shop</span>
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
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Settings">
                            <Settings />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Support">
                            <LifeBuoy />
                            <span>Support</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
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
