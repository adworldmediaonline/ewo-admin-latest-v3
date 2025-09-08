'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from 'next/navigation';
import { AppSidebarAdmin } from '../../../../components/app-sidebar-admin';
import { authClient } from '../../../../lib/auth-client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();

  // if (isPending) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <Loader2 className="animate-spin" />
  //     </div>
  //   );
  // }

  if (session?.user.role !== 'super-admin') {
    return redirect('/sign-in');
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
