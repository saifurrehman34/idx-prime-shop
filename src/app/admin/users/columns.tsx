"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type User = {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string
  email: string | null
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "full_name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || ''} />
                <AvatarFallback>{(user.full_name || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div>{user.full_name || 'N/A'}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
        </div>
      )
    }
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <Badge variant={row.original.role === 'admin' ? 'destructive' : 'outline'} className="capitalize">{row.original.role}</Badge>,
  },
]
