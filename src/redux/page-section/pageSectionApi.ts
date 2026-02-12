import { apiSlice } from '../api/apiSlice';
import type { PageSection, PageSectionUpsertPayload } from '@/types/page-section-type';

export const pageSectionApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getSectionsByPage: builder.query<{ success: boolean; data: PageSection[] }, string>({
      query: (pageSlug) => `/api/cms/page-sections/page/${pageSlug}`,
      providesTags: (_result, _error, pageSlug) => [
        { type: 'PageSections', id: pageSlug },
      ],
    }),
    getActiveSectionsByPage: builder.query<{ success: boolean; data: PageSection[] }, string>({
      query: (pageSlug) => `/api/cms/page-sections/page/${pageSlug}/active`,
      providesTags: (_result, _error, pageSlug) => [
        { type: 'PageSections', id: `${pageSlug}-active` },
      ],
    }),
    upsertSection: builder.mutation<
      { success: boolean; data: PageSection },
      { pageSlug: string; sectionKey: string; data: PageSectionUpsertPayload }
    >({
      query: ({ pageSlug, sectionKey, data }) => ({
        url: `/api/cms/page-sections/page/${pageSlug}/section/${encodeURIComponent(sectionKey)}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { pageSlug }) => [
        { type: 'PageSections', id: pageSlug },
        { type: 'PageSections', id: `${pageSlug}-active` },
      ],
    }),
    deleteSection: builder.mutation<
      { success: boolean },
      { pageSlug: string; sectionKey: string }
    >({
      query: ({ pageSlug, sectionKey }) => ({
        url: `/api/cms/page-sections/page/${pageSlug}/section/${encodeURIComponent(sectionKey)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { pageSlug }) => [
        { type: 'PageSections', id: pageSlug },
        { type: 'PageSections', id: `${pageSlug}-active` },
      ],
    }),
  }),
});

export const {
  useGetSectionsByPageQuery,
  useGetActiveSectionsByPageQuery,
  useUpsertSectionMutation,
  useDeleteSectionMutation,
} = pageSectionApi;
