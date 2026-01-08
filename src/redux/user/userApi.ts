import { apiSlice } from '../api/apiSlice';

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

interface GetUsersResponse {
  status: string;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const userApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getUsers: builder.query<GetUsersResponse, GetUsersParams | void>({
      query: (params) => {
        const { page = 1, limit = 10, search = '', role = '' } = params || {};
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page.toString());
        if (limit) queryParams.append('limit', limit.toString());
        if (search) queryParams.append('search', search);
        if (role) queryParams.append('role', role);
        return `/api/user/all?${queryParams.toString()}`;
      },
      providesTags: ['Users'],
      keepUnusedDataFor: 60, // Keep unused data for 60 seconds only
    }),
    getUserById: builder.query<any, string>({
      query: id => `/api/user/${id}`,
      providesTags: ['Users'],
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByIdQuery } = userApi;
