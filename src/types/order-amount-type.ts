import { IOrderProduct } from './product';

// user
interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  imageURL?: string;
  role: string;
  status: string;
  reviews?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  user: IUser;
  cart: IOrderProduct[];
  name: string;
  address: string;
  email: string;
  contact: string;
  city: string;
  state?: string;
  country: string;
  zipCode: string;
  subTotal: number;
  shippingCost: number;
  discount?: number;
  totalAmount: number;
  shippingOption: string;
  paymentMethod: string;
  orderNote?: string;
  invoice: number;
  orderId?: string;
  isGuestOrder?: boolean;
  firstTimeDiscount?: {
    isApplied: boolean;
    percentage: number;
    amount: number;
  };
  firstTimeShippingDiscount?: boolean;
  firstTimeShippingDiscountAmount?: number;
  status: string;
  shippingNotificationSent?: boolean;
  shippingDetails?: {
    // New format: multiple carriers
    carriers?: Array<{
      carrier: string;
      trackingNumber?: string;
      trackingUrl?: string;
    }>;
    // Legacy format: single carrier (for backward compatibility)
    trackingNumber?: string;
    carrier?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
    shippedDate?: string;
  };
  firstTimeDiscountAmount?: {
    isApplied: boolean;
    percentage: number;
    amount: number;
  };
  feedbackEmailSent?: boolean;
  hasReview?: boolean;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IOrderAmounts {
  todayOrderAmount: number;
  yesterdayOrderAmount: number;
  monthlyOrderAmount: number;
  totalOrderAmount: number;
  todayCardPaymentAmount: number;
  todayCashPaymentAmount: number;
  yesterDayCardPaymentAmount: number;
  yesterDayCashPaymentAmount: number;
}

export interface ISalesEntry {
  date: string;
  total: number;
  order: number;
}

export interface ISalesReport {
  salesReport: ISalesEntry[];
}

export interface IMostSellingCategory {
  categoryData: {
    _id: string;
    count: number;
  }[];
}

// I Dashboard Recent Orders
export interface IOrder {
  _id: string;
  user: string;
  name: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  invoice: number;
}

export interface IDashboardRecentOrders {
  orders: IOrder[];
  totalOrder: number;
}

// get all orders type
export interface IGetAllOrdersRes {
  success: boolean;
  data: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// chart data type
export interface IChartDataItem {
  date: string;
  orders: number;
  revenue: number;
  items: number;
}

export interface IChartDataRes {
  success: boolean;
  data: IChartDataItem[];
}
// get all orders type
export interface IUpdateStatusOrderRes {
  success: boolean;
  message: string;
}

// order breakdown types
export interface IOrderBreakdownStatus {
  count: number;
  totalAmount: number;
  percentage: number | string;
}

export interface IOrderBreakdownData {
  delivered: IOrderBreakdownStatus;
  pending: IOrderBreakdownStatus;
  processing: IOrderBreakdownStatus;
  shipped: IOrderBreakdownStatus;
  cancelled: IOrderBreakdownStatus;
  total: {
    orders: number;
    revenue: number;
  };
}

export interface IOrderBreakdownRes {
  success: boolean;
  data: IOrderBreakdownData;
}
