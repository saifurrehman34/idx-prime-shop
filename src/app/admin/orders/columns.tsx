"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'

export type Order = {
  id: string
  created_at: string
  total_amount: number
  status: "pending" | "shipped" | "delivered" | "cancelled"
  user_profiles: {
    full_name: string | null
    email: string | null
  } | null
}

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => <div className="font-medium">#{row.original.id.substring(0, 8)}</div>
  },
  {
    accessorKey: "user_profiles.full_name",
    header: "Customer",
    cell: ({ row }) => {
      const order = row.original
      return (
        <div>
          <div>{order.user_profiles?.full_name || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">{order.user_profiles?.email}</div>
        </div>
      )
    }
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.created_at), "PPP")
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant={row.original.status === 'delivered' ? 'default' : 'secondary'} className="capitalize">{row.original.status}</Badge>,
  },
  {
    accessorKey: "total_amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]
