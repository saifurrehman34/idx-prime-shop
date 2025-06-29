'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updateUserRole } from '@/app/admin/users/actions';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';

type User = {
    id: string;
    email: string | undefined;
    role: string;
}
interface UserRoleFormProps {
  user: User;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export function UserRoleForm({ user }: UserRoleFormProps) {
  const router = useRouter();
  const action = updateUserRole.bind(null, user.id);
  const [state, formAction] = useFormState(action, { message: '', success: false });

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select name="role" defaultValue={user.role} required>
              <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
          </Select>
      </div>
      
      {state?.message && !state.success && (
          <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <SubmitButton />
      </div>
    </form>
  );
}
