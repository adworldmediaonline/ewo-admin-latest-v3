// Role-based access control configuration
export type UserRole = 'Admin' | 'Super Admin' | 'Manager' | 'CEO';

export interface RolePermissions {
  canViewDashboard: boolean;
  canViewProducts: boolean;
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canViewCategories: boolean;
  canManageCategories: boolean;
  canViewOrders: boolean;
  canManageOrders: boolean;

  canViewCartTracking: boolean;
  canViewBrands: boolean;
  canManageBrands: boolean;
  canViewReviews: boolean;
  canManageReviews: boolean;
  canViewCoupons: boolean;
  canManageCoupons: boolean;
  canViewContacts: boolean;
  canManageContacts: boolean;
  canViewProfile: boolean;
  canViewStaff: boolean;
  canManageStaff: boolean;
  canViewBlogCategories: boolean;
  canManageBlogCategories: boolean;
  canViewUsers: boolean;
}

// Define permissions for each role
export const rolePermissions: Record<UserRole, RolePermissions> = {
  Admin: {
    // Admin has full access to everything
    canViewDashboard: true,
    canViewProducts: true,
    canAddProducts: true,
    canEditProducts: true,
    canDeleteProducts: true,
    canViewCategories: true,
    canManageCategories: true,
    canViewOrders: true,
    canManageOrders: true,

    canViewCartTracking: true,
    canViewBrands: true,
    canManageBrands: true,
    canViewReviews: true,
    canManageReviews: true,
    canViewCoupons: true,
    canManageCoupons: true,
    canViewContacts: true,
    canManageContacts: true,
    canViewProfile: true,
    canViewStaff: true,
    canManageStaff: true,
    canViewBlogCategories: true,
    canManageBlogCategories: true,
    canViewUsers: true,
  },
  'Super Admin': {
    // Super Admin has limited access - only Orders and Carts
    canViewDashboard: false,
    canViewProducts: false,
    canAddProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canViewCategories: false,
    canManageCategories: false,
    canViewOrders: true,
    canManageOrders: true,

    canViewCartTracking: false,
    canViewBrands: false,
    canManageBrands: false,
    canViewReviews: false,
    canManageReviews: false,
    canViewCoupons: false,
    canManageCoupons: false,
    canViewContacts: true,
    canManageContacts: true,
    canViewProfile: true,
    canViewStaff: false,
    canManageStaff: false,
    canViewBlogCategories: false,
    canManageBlogCategories: false,
    canViewUsers: true,
  },
  Manager: {
    // Manager has similar limited access as Super Admin
    canViewDashboard: false,
    canViewProducts: false,
    canAddProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canViewCategories: false,
    canManageCategories: false,
    canViewOrders: true,
    canManageOrders: true,

    canViewCartTracking: false,
    canViewBrands: false,
    canManageBrands: false,
    canViewReviews: false,
    canManageReviews: false,
    canViewCoupons: false,
    canManageCoupons: false,
    canViewContacts: true,
    canManageContacts: true,
    canViewProfile: true,
    canViewStaff: false,
    canManageStaff: false,
    canViewBlogCategories: false,
    canManageBlogCategories: false,
    canViewUsers: true,
  },
  CEO: {
    // CEO has similar limited access as Super Admin
    canViewDashboard: false,
    canViewProducts: false,
    canAddProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canViewCategories: false,
    canManageCategories: false,
    canViewOrders: true,
    canManageOrders: true,

    canViewCartTracking: false,
    canViewBrands: false,
    canManageBrands: false,
    canViewReviews: false,
    canManageReviews: false,
    canViewCoupons: false,
    canManageCoupons: false,
    canViewContacts: true,
    canManageContacts: true,
    canViewProfile: true,
    canViewStaff: false,
    canManageStaff: false,
    canViewBlogCategories: false,
    canManageBlogCategories: false,
    canViewUsers: true,
  },
};

// Helper function to check if user has specific permission
export const hasPermission = (
  userRole: UserRole | undefined,
  permission: keyof RolePermissions
): boolean => {
  if (!userRole || !rolePermissions[userRole]) {
    return false;
  }

  return rolePermissions[userRole][permission];
};

// Helper function to get permissions for a role
export const getRolePermissions = (
  userRole: UserRole | undefined
): RolePermissions | null => {
  if (!userRole || !rolePermissions[userRole]) {
    return null;
  }
  return rolePermissions[userRole];
};
