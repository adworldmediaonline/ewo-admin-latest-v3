// 'use client';
// import { Loader2 } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
// import { authClient } from '../../../lib/auth-client';

// export default function DashboardPage() {
//   const { data: session, isPending } = authClient.useSession();
//   const router = useRouter();

//   // Handle role-based redirects
//   useEffect(() => {
//     if (!isPending && session) {
//       if (!session) {
//         router.push('/sign-in');
//       } else if (session.user.role === 'admin') {
//         router.push('/dashboard/admin');
//       } else if (session.user.role === 'super-admin') {
//         router.push('/dashboard/super-admin');
//       } else if (session.user.role === 'user') {
//         router.push('/sign-in');
//       }
//     }
//   }, [session, isPending, router]);

//   if (isPending) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader2 className="animate-spin" />
//       </div>
//     );
//   }

//   // Show loading while redirecting
//   if (!session || !session.user) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader2 className="animate-spin" />
//       </div>
//     );
//   }

//   return null;
// }

import { redirect } from 'next/navigation';
import { adminProtectedRoute } from '../../../lib/server-actions';

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

export default async function DashboardPage() {
  const data: fullSessionData = await adminProtectedRoute();

  if (!data?.data?.session) {
    redirect('/sign-in');
  }

  if (data.data.user.role === 'admin') {
    redirect('/dashboard/admin');
  }

  if (data.data.user.role === 'super-admin') {
    redirect('/dashboard/super-admin');
  }

  return null;
}
