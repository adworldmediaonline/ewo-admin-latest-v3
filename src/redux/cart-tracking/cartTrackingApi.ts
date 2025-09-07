import { apiSlice } from '../api/apiSlice';

export interface CartTrackingEvent {
  _id: string;
  sessionId: string;
  userId?: string;
  userEmail?: string;
  productId: string;
  productTitle: string;
  productCategory: string;
  productBrand: string;
  originalPrice: number;
  markedUpPrice: number;
  finalPrice: number;
  discountPercentage: number;
  quantity: number;
  source: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
  };
  isFirstTimeUser: boolean;
  eventType:
    | 'add_to_cart'
    | 'cart_viewed'
    | 'checkout_started'
    | 'purchase_completed';
  createdAt: string;
  updatedAt: string;
}

export const cartTrackingApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // Get cart tracking statistics for dashboard cards
    getCartTrackingStats: builder.query<
      {
        todayEvents: number;
        weekEvents: number;
        monthEvents: number;
        totalEvents: number;
        averageCartValue: number;
        topConvertingSource: string;
        conversionRate: number;
      },
      void
    >({
      query: () => '/api/cart-tracking/analytics/stats',
      transformResponse: (response: any) => response.data,
      providesTags: ['CartAnalytics'],
    }),

    // Get all cart tracking events with pagination
    getCartTrackingEvents: builder.query<
      {
        events: CartTrackingEvent[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      },
      {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        productId?: string;
        userId?: string;
        source?: string;
        eventType?: string;
      }
    >({
      query: params => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value) searchParams.append(key, value.toString());
        });
        return `/api/cart-tracking/events?${searchParams.toString()}`;
      },
      transformResponse: (response: any) => response.data,
      providesTags: ['CartTrackingEvents'],
    }),
  }),
});

export const { useGetCartTrackingEventsQuery, useGetCartTrackingStatsQuery } =
  cartTrackingApi;
