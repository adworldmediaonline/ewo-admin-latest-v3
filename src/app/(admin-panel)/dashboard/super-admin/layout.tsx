'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppSidebarAdmin } from '../../../../components/app-sidebar-admin';
import { authClient } from '../../../../lib/auth-client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // Handle role-based redirect
  useEffect(() => {
    if (!isPending && session?.user.role !== 'super-admin') {
      router.push('/sign-in');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // Don't render anything if user doesn't have super-admin role
  if (session?.user.role !== 'super-admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebarAdmin variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}{' '}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
