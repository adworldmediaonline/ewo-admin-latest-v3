import { apiSlice } from '../api/apiSlice';
import {
  PageMetadata,
  PageMetadataResponse,
  PageMetadataSingleResponse,
  PageMetadataUpsertPayload,
} from '@/types/page-metadata-type';

export const pageMetadataApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllPageMetadata: builder.query<PageMetadataResponse, void>({
      query: () => '/api/cms/page-metadata',
      providesTags: ['AllPageMetadata'],
      keepUnusedDataFor: 300,
    }),
    getPageMetadataBySlug: builder.query<PageMetadata | null, string>({
      query: (slug) => `/api/cms/page-metadata/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'PageMetadata', id: slug }],
      transformResponse: (response: PageMetadataSingleResponse) => response.data,
    }),
    upsertPageMetadata: builder.mutation<
      PageMetadataSingleResponse,
      { slug: string; data: PageMetadataUpsertPayload }
    >({
      query: ({ slug, data }) => ({
        url: `/api/cms/page-metadata/${slug}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AllPageMetadata'],
    }),
  }),
});

export const {
  useGetAllPageMetadataQuery,
  useGetPageMetadataBySlugQuery,
  useUpsertPageMetadataMutation,
} = pageMetadataApi;
