import {
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
      keepUnusedDataFor: 600,
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
    // get recent orders
    getAllOrders: builder.query<IGetAllOrdersRes, void>({
      query: () => `/api/order/orders`,
      providesTags: ['AllOrders'],
      keepUnusedDataFor: 600,
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
  }),
});

export const {
  useGetDashboardAmountQuery,
  useGetOrderBreakdownQuery,
  useGetSalesReportQuery,
  useGetMostSellingCategoryQuery,
  useGetRecentOrdersQuery,
  useGetAllOrdersQuery,
  useUpdateStatusMutation,
  useGetSingleOrderQuery,
  useShipOrderMutation,
  useSendShippingNotificationMutation,
  useSendDeliveryNotificationMutation,
  useUpdateShippingDetailsMutation,
  useProcessRefundMutation,
  useCancelOrderMutation,
  useGetPaymentDetailsQuery,
} = authApi;
