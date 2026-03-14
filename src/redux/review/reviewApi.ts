import { apiSlice } from '../api/apiSlice';
import {
  IAddReviewPayload,
  IReviewItem,
  IReviewListResponse,
  IUpdateReviewPayload,
} from '@/types/review';

interface IReviewListParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: string;
  productId?: string;
}

export const reviewApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getAllReviews: builder.query<IReviewListResponse, IReviewListParams | void>({
      query: (params) => {
        const { page = 1, limit = 10, search = '', rating = '', productId = '' } = params || {};
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        if (search) queryParams.append('search', search);
        if (rating) queryParams.append('rating', rating);
        if (productId) queryParams.append('productId', productId);
        return `/api/review?${queryParams.toString()}`;
      },
      providesTags: ['AllReviews'],
      keepUnusedDataFor: 60,
    }),
    getReview: builder.query<{ success: boolean; data: IReviewItem }, string>({
      query: (id) => `/api/review/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AllReviews', id }],
    }),
    addReviewAsAdmin: builder.mutation<{ success: boolean; data: IReviewItem }, IAddReviewPayload>({
      query: (body) => ({
        url: '/api/review/admin-add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AllReviews', 'ReviewProducts'],
    }),
    updateReview: builder.mutation<
      { success: boolean; data: IReviewItem },
      { id: string; data: IUpdateReviewPayload }
    >({
      query: ({ id, data }) => ({
        url: `/api/review/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AllReviews', 'ReviewProducts'],
    }),
    deleteReview: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/api/review/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AllReviews', 'ReviewProducts'],
    }),
    deleteReviewsByProduct: builder.mutation<{ message: string }, string>({
      query: (productId) => ({
        url: `/api/review/delete/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AllReviews', 'ReviewProducts'],
    }),
  }),
});

export const {
  useGetAllReviewsQuery,
  useGetReviewQuery,
  useAddReviewAsAdminMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useDeleteReviewsByProductMutation,
} = reviewApi;
