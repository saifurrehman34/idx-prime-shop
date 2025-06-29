"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateOrderStatus } from './actions';
import type { Database } from "@/types/database.types";

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

const OrderActions = ({ order }: { order: Order }) => {
    const { toast } = useToast();
    const statuses: Database['public']['Enums']['order_status'][] = ['pending', 'shipped', 'delivered', 'cancelled'];

    const handleStatusChange = async (status: Database['public']['Enums']['order_status']) => {
        const result = await updateOrderStatus(order.id, status);
        if (result.success) {
            toast({ title: "Success", description: result.message });
        } else {
            toast({ variant: 'destructive', title: "Error", description: result.message });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statuses.map((status) => (
                    <DropdownMenuItem 
                        key={status} 
                        onSelect={() => handleStatusChange(status)}
                        disabled={order.status === status}
                        className="capitalize"
                    >
                        {status}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
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
  {
    id: "actions",
    cell: ({ row }) => <OrderActions order={row.original} />,
  },
]
