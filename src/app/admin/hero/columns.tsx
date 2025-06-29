"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { deleteHeroSlide } from './actions';
import type { HeroSlide } from "@/types";

const SlideActions = ({ slide }: { slide: HeroSlide }) => {
    const { toast } = useToast();

    const handleDelete = async () => {
        const result = await deleteHeroSlide(slide.id);
        if (result.success) {
            toast({ title: "Success", description: "Hero slide deleted successfully." });
        } else {
            toast({ variant: 'destructive', title: "Error", description: result.message });
        }
    };

    return (
        <AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/admin/hero/${slide.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/90 focus:text-white">
                            Delete
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the hero slide "{slide.title}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export const columns: ColumnDef<HeroSlide>[] = [
  {
    accessorKey: "image_url",
    header: "",
    cell: ({ row }) => (
        <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={row.original.image_url} alt={row.original.title} className="object-cover"/>
            <AvatarFallback>{row.original.title.charAt(0)}</AvatarFallback>
        </Avatar>
    )
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "subtitle",
    header: "Subtitle",
  },
   {
    accessorKey: "link",
    header: "Link",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => row.original.is_active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>,
  },
  {
    id: "actions",
    cell: ({ row }) => <SlideActions slide={row.original} />,
  },
]
