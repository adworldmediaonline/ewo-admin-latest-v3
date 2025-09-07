'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { canAccessRoute } from '@/data/filtered-sidebar-menus';
import { UserRole } from '@/utils/rolePermissions';
import Cookies from 'js-cookie';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, accessToken } = useSelector((state: any) => state.auth);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Debug logging
  console.log('RouteGuard - Auth State:', { user, accessToken });
  console.log('RouteGuard - isAuthLoading:', isAuthLoading);
  console.log('RouteGuard - pathname:', pathname);

  useEffect(() => {
    // Skip route guard for login, register, and forgot-password pages
    const publicRoutes = ['/login', '/register', '/forgot-password'];
    if (publicRoutes.includes(pathname)) {
      setIsAuthLoading(false);
      return;
    }

    // Check if we have cookie-based authentication (for initial load)
    const adminCookie = Cookies.get('admin');

    // If no cookie and no Redux auth, redirect to login
    if (!adminCookie && (!accessToken || !user)) {
      setIsAuthLoading(false);
      router.push('/login');
      return;
    }

    // If we have cookie but no Redux state yet, wait for Redux to hydrate
    if (adminCookie && (!accessToken || !user)) {
      setIsAuthLoading(true);
      return; // Wait for Redux state to load
    }

    // At this point we have both cookie and Redux state
    setIsAuthLoading(false);

    // Check if user has permission to access this route
    const userRole = user.role as UserRole;
    if (!canAccessRoute(userRole, pathname)) {
      // Redirect to first accessible route or profile
      const firstAccessibleRoute = getFirstAccessibleRoute(userRole);
      if (firstAccessibleRoute && firstAccessibleRoute !== pathname) {
        router.push(firstAccessibleRoute);
        return;
      }

      // If no accessible route found, redirect to profile if accessible, else don't redirect
      if (canAccessRoute(userRole, '/profile')) {
        router.push('/profile');
      }
    }
  }, [pathname, accessToken, user, router]);

  // Skip rendering for unauthenticated users or unauthorized access
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Show loading while checking authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-theme mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no authentication at all, this will be handled by useEffect redirect
  if (!accessToken || !user) {
    return null;
  }

  const userRole = user.role as UserRole;
  if (!canAccessRoute(userRole, pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-4">
              You don&apos;t have permission to access this page.
            </p>
            {userRole && (
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">
                  Your current role:{' '}
                  <span className="font-semibold text-theme">{userRole}</span>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {userRole === 'Admin' && (
              <button
                onClick={() => router.push('/dashboard')}
                className="block w-full bg-theme hover:bg-theme-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Go to Dashboard
              </button>
            )}

            {(userRole === 'Super Admin' ||
              userRole === 'Manager' ||
              userRole === 'CEO') && (
              <>
                <button
                  onClick={() => router.push('/orders')}
                  className="block w-full bg-theme hover:bg-theme-dark text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  View Orders
                </button>
                <button
                  onClick={() => router.push('/carts')}
                  className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  View Carts
                </button>
              </>
            )}

            <button
              onClick={() => router.push('/profile')}
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Go to Profile
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact your
              administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Helper function to get the first accessible route for a user role
function getFirstAccessibleRoute(userRole: UserRole): string | null {
  const routesToCheck = [
    '/dashboard',
    '/orders',
    '/carts',
    '/profile',
    '/product-list',
    '/category',
    '/brands',
    '/reviews',
    '/coupon',
    '/our-staff',
    '/blog-category',
  ];

  for (const route of routesToCheck) {
    if (canAccessRoute(userRole, route)) {
      return route;
    }
  }

  return null;
}
