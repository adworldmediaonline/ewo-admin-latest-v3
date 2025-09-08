'use client';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { authClient } from '../../../lib/auth-client';

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect('/sign-in');
  }

  if (session.user.role === 'admin') {
    redirect('/dashboard/admin');
  }
  if (session.user.role === 'super-admin') {
    redirect('/dashboard/super-admin');
  }

  if (session.user.role === 'user') {
    redirect('/sign-in');
  }

  return null;
}
