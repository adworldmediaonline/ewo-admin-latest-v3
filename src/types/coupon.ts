export interface ICoupon {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  couponCode: string;
  startTime: string;
  endTime: string;
  
  // Discount Configuration
  discountType: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
  discountPercentage?: number;
  discountAmount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  
  // Usage Restrictions
  minimumAmount: number;
  maximumAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  usageCount: number;
  
  // Product/Category Restrictions
  applicableType: 'all' | 'category' | 'product' | 'brand';
  productType?: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  applicableBrands?: string[];
  excludedProducts?: string[];
  
  // User Restrictions
  userRestrictions: {
    newUsersOnly: boolean;
    allowedUsers?: string[];
    excludedUsers?: string[];
  };
  
  // Advanced Settings
  stackable: boolean;
  priority: number;
  
  // Status and Metadata
  status: 'active' | 'inactive' | 'expired' | 'exhausted';
  isPublic: boolean;
  createdBy?: string;
  
  // Analytics
  analytics: {
    totalUsage: number;
    totalDiscount: number;
    totalRevenue: number;
    lastUsed?: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface IAddCoupon {
  title: string;
  description?: string;
  logo?: string;
  couponCode: string;
  startTime?: string;
  endTime: string;
  
  // Discount Configuration
  discountType?: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
  discountPercentage?: number;
  discountAmount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  
  // Usage Restrictions
  minimumAmount: number;
  maximumAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  
  // Product/Category Restrictions
  applicableType?: 'all' | 'category' | 'product' | 'brand';
  productType?: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  applicableBrands?: string[];
  excludedProducts?: string[];
  
  // User Restrictions
  userRestrictions?: {
    newUsersOnly?: boolean;
    allowedUsers?: string[];
    excludedUsers?: string[];
  };
  
  // Advanced Settings
  stackable?: boolean;
  priority?: number;
  
  // Status
  status?: 'active' | 'inactive' | 'expired' | 'exhausted';
  isPublic?: boolean;
}

export interface ICouponAnalytics {
  coupon: {
    _id: string;
    title: string;
    couponCode: string;
    status: string;
    usageCount: number;
    usageLimit?: number;
  };
  analytics: {
    totalUsage: number;
    totalDiscount: number;
    totalRevenue: number;
    avgOrderValue: number;
    avgDiscount: number;
    uniqueUsers: number;
  };
}

export interface ICouponValidation {
  couponId: string;
  couponCode: string;
  discountType: string;
  discount: number;
  applicableItems: number;
  title: string;
  description?: string;
}
