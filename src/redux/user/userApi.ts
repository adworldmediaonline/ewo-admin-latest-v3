import { apiSlice } from '../api/apiSlice';

export const userApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getUsers: builder.query<any, void>({
      query: () => '/api/user/all ',
      providesTags: ['Users'],
      keepUnusedDataFor: 600,
    }),
    getUserById: builder.query<any, string>({
      query: id => `/api/user/${id}`,
      providesTags: ['Users'],
    }),
  }),
});

export const { useGetUsersQuery, useGetUserByIdQuery } = userApi;
