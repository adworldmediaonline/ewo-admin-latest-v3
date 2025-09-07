import { ISidebarMenus } from '../types/menu-types';
import { UserRole, hasPermission } from '../utils/rolePermissions';
import sidebar_menu from './sidebar-menus';

// Map menu items to their required permissions
const menuPermissions: Record<string, string> = {
  Dashboard: 'canViewDashboard',
  Products: 'canViewProducts',
  Category: 'canViewCategories',
  Orders: 'canViewOrders',
  // 'Cart Tracking': 'canViewCartTracking',
  Brand: 'canViewBrands',
  Reviews: 'canViewReviews',
  Coupons: 'canViewCoupons',
  'Contact Queries': 'canViewContacts',
  Profile: 'canViewProfile',
  'Our Staff': 'canViewStaff',
  'Blog Category': 'canViewBlogCategories',
  Pages: 'canManageStaff', // Only Admin can access Pages (Register, Login, etc.)
  'Online store': 'canViewProfile', // Allow access to online store for all roles that can view profile
};

// Map submenu items to their required permissions
const submenuPermissions: Record<string, string> = {
  'Add Product': 'canAddProducts',
  'Product List': 'canViewProducts',
  'Product Grid': 'canViewProducts',
};

// Filter sidebar menu based on user role
export const getFilteredSidebarMenu = (
  userRole: UserRole | undefined
): Array<ISidebarMenus> => {
  if (!userRole) {
    return [];
  }

  const filteredMenu = sidebar_menu
    .filter(menu => {
      // Always show Users menu to all roles
      if (menu.title === 'Users') return true;
      // Check if user has permission for this menu item
      const requiredPermission = menuPermissions[menu.title];
      if (!requiredPermission) {
        return false; // If no permission defined, don't show
      }
      const hasMenuPermission = hasPermission(
        userRole,
        requiredPermission as any
      );
      if (!hasMenuPermission) {
        return false;
      }
      // If menu has submenus, check if at least one is accessible
      if (menu.subMenus) {
        const filteredSubMenus = menu.subMenus.filter(submenu => {
          const submenuPermission = submenuPermissions[submenu.title];
          if (!submenuPermission) {
            return hasMenuPermission; // Default to menu permission if no specific submenu permission
          }
          return hasPermission(userRole, submenuPermission as any);
        });
        // Only show menu if it has at least one accessible submenu
        if (filteredSubMenus.length === 0) {
          return false;
        }
      }
      return true;
    })
    .map(menu => {
      // If menu has submenus, return a copy with filtered submenus
      if (menu.subMenus) {
        const filteredSubMenus = menu.subMenus.filter(submenu => {
          const submenuPermission = submenuPermissions[submenu.title];
          if (!submenuPermission) {
            return hasPermission(userRole, menuPermissions[menu.title] as any);
          }
          return hasPermission(userRole, submenuPermission as any);
        });
        return { ...menu, subMenus: filteredSubMenus };
      }
      return menu;
    });

  return filteredMenu;
};

// Helper function to check if user can access a specific route
export const canAccessRoute = (
  userRole: UserRole | undefined,
  routePath: string
): boolean => {
  if (!userRole) {
    return false;
  }

  // Route permission mapping
  const routePermissions: Record<string, string> = {
    '/': 'canViewDashboard', // Root route defaults to dashboard permission
    '/dashboard': 'canViewDashboard',
    '/product-list': 'canViewProducts',
    '/product-grid': 'canViewProducts',
    '/add-product': 'canAddProducts',
    '/category': 'canViewCategories',
    '/orders': 'canViewOrders',
    '/order-details': 'canViewOrders', // Order details should use same permission as orders
    '/cart-tracking': 'canViewCartTracking',
    '/brands': 'canViewBrands',
    '/reviews': 'canViewReviews',
    '/coupon': 'canViewCoupons',
    '/contact-queries': 'canViewContacts',
    '/profile': 'canViewProfile',
    '/our-staff': 'canViewStaff',
    '/blog-category': 'canViewBlogCategories',
    '/register': 'canViewProfile',
    '/login': 'canViewProfile',
    '/forgot-password': 'canViewProfile',
    '/edit-product': 'canEditProducts',
    '/users': 'canViewUsers',
  };

  const requiredPermission = routePermissions[routePath];

  // Handle dynamic routes (like /order-details/[id] or /edit-product/[id] or /users/[id])
  if (!requiredPermission) {
    // Check for dynamic route patterns
    if (routePath.startsWith('/order-details/')) {
      return hasPermission(userRole, 'canViewOrders');
    }
    if (routePath.startsWith('/edit-product/')) {
      return hasPermission(userRole, 'canEditProducts');
    }
    if (routePath.startsWith('/our-staff/')) {
      return hasPermission(userRole, 'canViewStaff');
    }
    if (routePath.startsWith('/coupon/')) {
      return hasPermission(userRole, 'canViewCoupons');
    }
    if (routePath.startsWith('/orders/')) {
      return hasPermission(userRole, 'canViewOrders');
    }
    if (routePath.startsWith('/users/')) {
      return hasPermission(userRole, 'canViewUsers');
    }
    return false;
  }

  return hasPermission(userRole, requiredPermission as any);
};
