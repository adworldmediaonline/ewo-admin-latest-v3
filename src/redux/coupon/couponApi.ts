import { IAddCoupon, ICoupon, ICouponAnalytics } from '@/types/coupon';
import { apiSlice } from '../api/apiSlice';

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // add coupon
    addCoupon: builder.mutation<{ message: string }, IAddCoupon>({
      query(data: IAddCoupon) {
        return {
          url: `/api/coupon/add`,
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: ['AllCoupons'],
    }),
    // getUserOrders
    getAllCoupons: builder.query<ICoupon[], void>({
      query: () => `/api/coupon`,
      transformResponse: (response: { success: boolean; data: ICoupon[] }) => {
        return response.data || [];
      },
      providesTags: ['AllCoupons'],
      keepUnusedDataFor: 600,
    }),
    // get single coupon
    getCoupon: builder.query<ICoupon, string>({
      query: id => `/api/coupon/${id}`,
      transformResponse: (response: { success: boolean; data: ICoupon }) => {
        return response.data;
      },
      providesTags: ['Coupon'],
    }),
    // editCategory
    editCoupon: builder.mutation<
      { message: string },
      { id: string; data: Partial<IAddCoupon> }
    >({
      query({ id, data }) {
        return {
          url: `/api/coupon/${id}`,
          method: 'PATCH',
          body: data,
        };
      },
      invalidatesTags: ['AllCoupons', 'Coupon'],
    }),
    // delete coupon
    deleteCoupon: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query(id: string) {
        return {
          url: `/api/coupon/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['AllCoupons'],
    }),

    // validate coupon
    validateCoupon: builder.mutation<
      { success: boolean; message: string; data: any },
      {
        couponCode: string;
        cartItems?: any[];
        cartTotal?: number;
        userId?: string;
      }
    >({
      query(data) {
        return {
          url: `/api/coupon/validate`,
          method: 'POST',
          body: data,
        };
      },
    }),

    // get coupon analytics
    getCouponAnalytics: builder.query<
      { success: boolean; data: ICouponAnalytics },
      { id: string; startDate?: string; endDate?: string }
    >({
      query({ id, startDate, endDate }) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/api/coupon/${id}/analytics?${params.toString()}`;
      },
      providesTags: ['Coupon'],
    }),

    // get overall analytics
    getOverallAnalytics: builder.query<
      { success: boolean; data: any },
      { startDate?: string; endDate?: string }
    >({
      query({ startDate, endDate }) {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/api/coupon/analytics/overview?${params.toString()}`;
      },
      providesTags: ['AllCoupons'],
    }),

    // bulk update coupons
    bulkUpdateCoupons: builder.mutation<
      { success: boolean; message: string; data: any },
      { couponIds: string[]; updateData: Partial<ICoupon> }
    >({
      query(data) {
        return {
          url: `/api/coupon/bulk/update`,
          method: 'PATCH',
          body: data,
        };
      },
      invalidatesTags: ['AllCoupons'],
    }),

    // duplicate coupon
    duplicateCoupon: builder.mutation<
      { success: boolean; message: string; data: ICoupon },
      { id: string; newCouponCode: string }
    >({
      query({ id, newCouponCode }) {
        return {
          url: `/api/coupon/${id}/duplicate`,
          method: 'POST',
          body: { newCouponCode },
        };
      },
      invalidatesTags: ['AllCoupons'],
    }),

    // get valid coupons
    getValidCoupons: builder.query<
      { success: boolean; data: ICoupon[] },
      { userId?: string }
    >({
      query({ userId }) {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        return `/api/coupon/valid/list?${params.toString()}`;
      },
      providesTags: ['AllCoupons'],
    }),
  }),
});

export const {
  useGetAllCouponsQuery,
  useDeleteCouponMutation,
  useAddCouponMutation,
  useGetCouponQuery,
  useEditCouponMutation,
  useValidateCouponMutation,
  useGetCouponAnalyticsQuery,
  useGetOverallAnalyticsQuery,
  useBulkUpdateCouponsMutation,
  useDuplicateCouponMutation,
  useGetValidCouponsQuery,
} = authApi;
