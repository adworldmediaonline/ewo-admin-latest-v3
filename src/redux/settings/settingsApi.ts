import type {
  CouponBehaviorSettings,
  ShippingSettings,
} from '@/types/settings';
import { apiSlice } from '../api/apiSlice';

export const settingsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getCouponSettings: builder.query<CouponBehaviorSettings, void>({
      query: () => '/api/admin/settings/coupon',
      transformResponse: (response: {
        success: boolean;
        data: CouponBehaviorSettings;
      }) => response.data,
      providesTags: ['Settings'],
    }),
    updateCouponSettings: builder.mutation<
      CouponBehaviorSettings,
      CouponBehaviorSettings
    >({
      query: data => ({
        url: '/api/admin/settings/coupon',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    getShippingSettings: builder.query<ShippingSettings, void>({
      query: () => '/api/admin/settings/shipping',
      transformResponse: (response: {
        success: boolean;
        data: ShippingSettings;
      }) => response.data,
      providesTags: ['Settings'],
    }),
    updateShippingSettings: builder.mutation<ShippingSettings, ShippingSettings>(
      {
        query: data => ({
          url: '/api/admin/settings/shipping',
          method: 'PATCH',
          body: data,
        }),
        invalidatesTags: ['Settings'],
      }
    ),
  }),
});

export const {
  useGetCouponSettingsQuery,
  useUpdateCouponSettingsMutation,
  useGetShippingSettingsQuery,
  useUpdateShippingSettingsMutation,
} = settingsApi;
