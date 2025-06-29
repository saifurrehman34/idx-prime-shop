"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type Product = {
  id: string
  name: string
  price: number
  image_url: string
  categories: {
    name: string | null
  } | null
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "image_url",
    header: "",
    cell: ({ row }) => (
        <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={row.original.image_url} alt={row.original.name} className="object-cover"/>
            <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
        </Avatar>
    )
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "categories.name",
    header: "Category",
    cell: ({ row }) => row.original.categories?.name ?? 'N/A'
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]
