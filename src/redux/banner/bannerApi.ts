import { apiSlice } from '../api/apiSlice';
import {
  BannerDelResponse,
  BannerResponse,
  IBannerAddResponse,
  IAddBanner,
  Banner,
} from '@/types/banner-type';

export const bannerApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // get all banners
    getAllBanners: builder.query<BannerResponse, void>({
      query: () => `/api/banner`,
      providesTags: ['AllBanners'],
      keepUnusedDataFor: 600,
    }),
    // add banner
    addBanner: builder.mutation<IBannerAddResponse, IAddBanner>({
      query(data: IAddBanner) {
        return {
          url: `/api/banner`,
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: ['AllBanners'],
    }),
    // edit banner
    editBanner: builder.mutation<
      IBannerAddResponse,
      { id: string; data: Partial<IAddBanner> }
    >({
      query({ id, data }) {
        return {
          url: `/api/banner/${id}`,
          method: 'PATCH',
          body: data,
        };
      },
      invalidatesTags: ['AllBanners', 'getBanner'],
    }),
    // get single banner
    getBanner: builder.query<Banner, string>({
      query: id => `/api/banner/${id}`,
      providesTags: ['getBanner'],
      transformResponse: (response: { success: boolean; data: Banner }) =>
        response.data,
    }),
    // delete banner
    deleteBanner: builder.mutation<BannerDelResponse, string>({
      query(id: string) {
        return {
          url: `/api/banner/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['AllBanners'],
    }),
  }),
});

export const {
  useGetAllBannersQuery,
  useDeleteBannerMutation,
  useAddBannerMutation,
  useEditBannerMutation,
  useGetBannerQuery,
} = bannerApi;

