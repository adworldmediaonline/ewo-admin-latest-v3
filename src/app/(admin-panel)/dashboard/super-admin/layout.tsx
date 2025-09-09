import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { redirect } from 'next/navigation';
import { AppSidebarSuperAdmin } from '../../../../components/app-sidebar-super-admin';
import { adminProtectedRoute } from '../../../../lib/server-actions';

type fullSessionData = {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    session: {
      id: string;
      createdAt: string;
      expiresAt: string;
    };
  };
  error?: string;
  message?: string;
  status?: number;
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data: fullSessionData = await adminProtectedRoute();

  if (!data?.data?.session) {
    redirect('/sign-in');
  }

  if (data.data.user.role !== 'super-admin') {
    redirect('/sign-in');
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
      <AppSidebarSuperAdmin variant="inset" />
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
