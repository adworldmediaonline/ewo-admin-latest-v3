import {
  IContact,
  IGetAllContactsRes,
  IContactStats,
  IUpdateContactRes,
  IDeleteContactRes,
  IContactQueryParams,
  IContactUpdatePayload,
} from '@/types/contact-type';
import { apiSlice } from '../api/apiSlice';

export const contactApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // Get all contacts with pagination and filters
    getAllContacts: builder.query<IGetAllContactsRes, IContactQueryParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.status) searchParams.append('status', params.status);
        if (params.priority) searchParams.append('priority', params.priority);
        if (params.isRead !== undefined) searchParams.append('isRead', params.isRead.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

        return `/api/contact?${searchParams.toString()}`;
      },
      providesTags: ['AllContacts'],
      keepUnusedDataFor: 300,
    }),

    // Get single contact
    getContact: builder.query<{ status: string; data: IContact }, string>({
      query: id => `/api/contact/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Contact', id }],
      keepUnusedDataFor: 300,
    }),

    // Get contact statistics
    getContactStats: builder.query<IContactStats, void>({
      query: () => `/api/contact/stats`,
      providesTags: ['AllContacts'],
      keepUnusedDataFor: 600,
    }),

    // Update contact
    updateContact: builder.mutation<
      IUpdateContactRes,
      { id: string; data: IContactUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/api/contact/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'AllContacts',
        { type: 'Contact', id },
      ],
    }),

    // Delete contact
    deleteContact: builder.mutation<IDeleteContactRes, string>({
      query: id => ({
        url: `/api/contact/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AllContacts'],
    }),

    // Mark contact as read
    markContactAsRead: builder.mutation<IUpdateContactRes, string>({
      query: id => ({
        url: `/api/contact/${id}`,
        method: 'PATCH',
        body: { isRead: true },
      }),
      invalidatesTags: (_result, _error, id) => [
        'AllContacts',
        { type: 'Contact', id },
      ],
    }),

    // Update contact status
    updateContactStatus: builder.mutation<
      IUpdateContactRes,
      { id: string; status: IContact['status'] }
    >({
      query: ({ id, status }) => ({
        url: `/api/contact/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'AllContacts',
        { type: 'Contact', id },
      ],
    }),

    // Update contact priority
    updateContactPriority: builder.mutation<
      IUpdateContactRes,
      { id: string; priority: IContact['priority'] }
    >({
      query: ({ id, priority }) => ({
        url: `/api/contact/${id}`,
        method: 'PATCH',
        body: { priority },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'AllContacts',
        { type: 'Contact', id },
      ],
    }),
  }),
});

export const {
  useGetAllContactsQuery,
  useGetContactQuery,
  useGetContactStatsQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
  useMarkContactAsReadMutation,
  useUpdateContactStatusMutation,
  useUpdateContactPriorityMutation,
} = contactApi;