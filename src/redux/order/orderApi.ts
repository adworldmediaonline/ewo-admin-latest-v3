import {
  IChartDataRes,
  IDashboardRecentOrders,
  IGetAllOrdersRes,
  IMostSellingCategory,
  IOrderAmounts,
  IOrderBreakdownRes,
  ISalesReport,
  IUpdateStatusOrderRes,
  Order,
} from '@/types/order-amount-type';
import { apiSlice } from '../api/apiSlice';

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // getUserOrders
    getDashboardAmount: builder.query<IOrderAmounts, void>({
      query: () => `/api/user-order/dashboard-amount`,
      providesTags: ['DashboardAmount'],
      keepUnusedDataFor: 60, // Keep unused data for 60 seconds only
    }),
    // get order breakdown
    getOrderBreakdown: builder.query<IOrderBreakdownRes, void>({
      query: () => `/api/user-order/order-breakdown`,
      providesTags: ['OrderBreakdown'],
      keepUnusedDataFor: 600,
    }),
    // get sales report
    getSalesReport: builder.query<ISalesReport, void>({
      query: () => `/api/user-order/sales-report`,
      providesTags: ['DashboardSalesReport'],
      keepUnusedDataFor: 600,
    }),
    // get selling category
    getMostSellingCategory: builder.query<IMostSellingCategory, void>({
      query: () => `/api/user-order/most-selling-category`,
      providesTags: ['DashboardMostSellingCategory'],
      keepUnusedDataFor: 600,
    }),
    // get recent orders
    getRecentOrders: builder.query<IDashboardRecentOrders, void>({
      query: () => `/api/user-order/dashboard-recent-order`,
      providesTags: ['DashboardRecentOrders'],
      keepUnusedDataFor: 600,
    }),
    // get recent orders - Optimized with pagination
    getAllOrders: builder.query<
      IGetAllOrdersRes,
      { page?: number; limit?: number; search?: string; status?: string; startDate?: string; endDate?: string } | void
    >({
      query: (params) => {
        const { page = 1, limit = 10, search = '', status = '', startDate = '', endDate = '' } = params || {};
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page.toString());
        if (limit) queryParams.append('limit', limit.toString());
        if (search) queryParams.append('search', search);
        if (status) queryParams.append('status', status);
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        return `/api/order/orders?${queryParams.toString()}`;
      },
      providesTags: ['AllOrders'],
      keepUnusedDataFor: 60, // Keep unused data for 60 seconds only
    }),
    // get chart data (optimized)
    getChartData: builder.query<IChartDataRes, number | void>({
      query: (days = 90) => `/api/user-order/chart-data?days=${days}`,
      providesTags: ['ChartData'],
      keepUnusedDataFor: 60, // Keep unused data for 60 seconds only
    }),
    // get recent orders
    getSingleOrder: builder.query<Order, string>({
      query: id => `/api/order/${id}`,
      keepUnusedDataFor: 600,
    }),
    // get recent orders
    updateStatus: builder.mutation<
      IUpdateStatusOrderRes,
      { id: string; status: { status: string } }
    >({
      query({ id, status }) {
        return {
          url: `/api/order/update-status/${id}`,
          method: 'PATCH',
          body: status,
        };
      },
      invalidatesTags: ['AllOrders', 'DashboardRecentOrders', 'OrderBreakdown', 'DashboardAmount'],
    }),
    // ship order with tracking
    shipOrder: builder.mutation<
      any,
      {
        id: string;
        shippingData: {
          // New format: multiple carriers
          carriers?: Array<{
            carrier: string;
            trackingNumber?: string;
          }>;
          // Legacy format: single carrier (for backward compatibility)
          trackingNumber?: string;
          carrier?: string;
          estimatedDelivery?: string;
        };
      }
    >({
      query({ id, shippingData }) {
        return {
          url: `/api/shipping/ship/${id}`,
          method: 'POST',
          body: shippingData,
        };
      },
      invalidatesTags: ['AllOrders', 'DashboardRecentOrders', 'OrderBreakdown'],
    }),
    // send shipping notification
    sendShippingNotification: builder.mutation<
      any,
      {
        id: string;
        shippingData: {
          trackingNumber?: string;
          carrier: string;
          estimatedDelivery?: string;
        };
      }
    >({
      query({ id, shippingData }) {
        return {
          url: `/api/order/send-shipping-notification/${id}`,
          method: 'POST',
          body: shippingData,
        };
      },
      invalidatesTags: ['AllOrders', 'DashboardRecentOrders', 'OrderBreakdown'],
    }),
    // update shipping details
    updateShippingDetails: builder.mutation<
      any,
      {
        id: string;
        shippingData: {
          trackingNumber?: string;
          carrier: string;
          trackingUrl?: string;
          estimatedDelivery?: string;
          sendEmail?: boolean;
        };
      }
    >({
      query({ id, shippingData }) {
        return {
          url: `/api/order/update-shipping/${id}`,
          method: 'PATCH',
          body: shippingData,
        };
      },
      invalidatesTags: ['AllOrders', 'DashboardRecentOrders', 'OrderBreakdown'],
    }),
    // send delivery notification
    sendDeliveryNotification: builder.mutation<
      any,
      {
        id: string;
        deliveryData?: {
          deliveredDate?: string;
        };
      }
    >({
      query({ id, deliveryData = {} }) {
        return {
          url: `/api/order/send-delivery-notification/${id}`,
          method: 'POST',
          body: deliveryData,
        };
      },
      invalidatesTags: ['AllOrders', 'DashboardRecentOrders', 'OrderBreakdown', 'DashboardAmount'],
    }),
    // process refund
    processRefund: builder.mutation<
      any,
      {
        id: string;
        refundData: {
          amount?: number;
          reason?: string;
        };
      }
    >({
      query({ id, refundData }) {
        return {
          url: `/api/order/refund/${id}`,
          method: 'POST',
          body: refundData,
        };
      },
      invalidatesTags: ['AllOrders', 'DashboardRecentOrders', 'OrderBreakdown'],
    }),
    // cancel order
    cancelOrder: builder.mutation<
      any,
      {
        id: string;
        cancelData?: {
          reason?: string;
        };
      }
    >({
      query({ id, cancelData = {} }) {
        return {
          url: `/api/order/cancel/${id}`,
          method: 'POST',
          body: cancelData,
        };
      },
      invalidatesTags: ['AllOrders', 'DashboardRecentOrders', 'OrderBreakdown', 'DashboardAmount'],
    }),
    // get payment details
    getPaymentDetails: builder.query<any, string>({
      query: id => `/api/order/payment-details/${id}`,
      keepUnusedDataFor: 300,
    }),
    // create order (admin)
    createOrder: builder.mutation<
      { success: boolean; message: string; order: Order },
      any
    >({
      query(data) {
        return {
          url: `/api/order/saveOrder`,
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: ['AllOrders', 'DashboardRecentOrders', 'OrderBreakdown', 'DashboardAmount'],
    }),
    // create payment intent (for Stripe card payments)
    createPaymentIntent: builder.mutation<
      { clientSecret: string; paymentIntentId?: string; isFreeOrder?: boolean; totalAmount?: number },
      {
        price: number;
        email: string;
        cart: any[];
        orderData: any;
      }
    >({
      query(data) {
        return {
          url: `/api/order/create-payment-intent`,
          method: 'POST',
          body: data,
        };
      },
    }),
    // Send bulk review request emails
    sendBulkReviewRequestEmails: builder.mutation<
      {
        success: boolean;
        message: string;
        totalOrders: number;
        emailsSent: number;
        emailsFailed: number;
        skipped: number;
        failedOrders?: Array<{ orderId: string; email: string; error?: string }>;
      },
      { startDate?: string; endDate?: string }
    >({
      query: (data) => ({
        url: `/api/order/send-bulk-review-requests`,
        method: 'POST',
        body: data,
      }),
    }),
    // Trigger feedback email for a single order
      triggerFeedbackEmail: builder.mutation<
        {
          success: boolean;
          message: string;
          scheduledAt?: Date;
        },
        string
      >({
        query: (orderId) => ({
          url: `/api/order/trigger-feedback/${orderId}`,
          method: 'POST',
        }),
        invalidatesTags: ['AllOrders'],
      }),
      // Get order email addresses by date range
      getOrderEmails: builder.query<
        {
          success: boolean;
          emails: string[];
          totalOrders: number;
        },
        {
          startDate?: string;
          endDate?: string;
          selectAll?: boolean;
        }
      >({
        query: (params) => {
          const queryParams = new URLSearchParams();
          if (params.startDate) queryParams.append('startDate', params.startDate);
          if (params.endDate) queryParams.append('endDate', params.endDate);
          if (params.selectAll) queryParams.append('selectAll', 'true');
          return `/api/order/emails?${queryParams.toString()}`;
        },
      }),
      // Send promotional email
      sendPromotionalEmail: builder.mutation<
        {
          success: boolean;
          message: string;
          emailsSent: number;
          emailsFailed: number;
        },
        {
          subject: string;
          recipients: string[];
          emailBody: string;
          startDate?: string;
          endDate?: string;
          selectAll?: boolean;
        }
      >({
        query: (data) => ({
          url: `/api/order/send-promotional-email`,
          method: 'POST',
          body: data,
        }),
      }),
    }),
  });

export const {
  useGetDashboardAmountQuery,
  useGetOrderBreakdownQuery,
  useGetSalesReportQuery,
  useGetMostSellingCategoryQuery,
  useGetRecentOrdersQuery,
  useGetAllOrdersQuery,
  useGetChartDataQuery,
  useUpdateStatusMutation,
  useGetSingleOrderQuery,
  useShipOrderMutation,
  useSendShippingNotificationMutation,
  useSendDeliveryNotificationMutation,
  useUpdateShippingDetailsMutation,
  useProcessRefundMutation,
  useCancelOrderMutation,
  useGetPaymentDetailsQuery,
  useCreateOrderMutation,
  useCreatePaymentIntentMutation,
  useSendBulkReviewRequestEmailsMutation,
  useTriggerFeedbackEmailMutation,
  useGetOrderEmailsQuery,
  useSendPromotionalEmailMutation,
} = authApi;
