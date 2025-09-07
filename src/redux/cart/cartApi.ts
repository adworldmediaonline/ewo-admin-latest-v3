import { apiSlice } from '../api/apiSlice';

export interface CartItem {
  _id: string;
  title: string;
  img: string;
  price: number;
  orderQuantity: number;
  sku?: string;
}

export interface Cart {
  _id: string;
  email: string;
  cartItems: CartItem[];
  isActive: boolean;
  totalItems: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CartResponse {
  success: boolean;
  data: Cart[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCarts: number;
    limit: number;
  };
}

export interface CartQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  isActive?: string;
}

export const cartApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // get all carts
    getAllCarts: builder.query<CartResponse, CartQueryParams | void>({
      query: params => {
        const searchParams = params || {};
        const queryParams = new URLSearchParams({
          page: (searchParams.page || 1).toString(),
          limit: (searchParams.limit || 10).toString(),
          sortBy: searchParams.sortBy || 'createdAt',
          sortOrder: searchParams.sortOrder || 'desc',
          ...(searchParams.search && { search: searchParams.search }),
          ...(searchParams.isActive !== undefined &&
            searchParams.isActive !== '' && {
              isActive: searchParams.isActive,
            }),
        });

        return `/api/cart/admin/all?${queryParams}`;
      },
      providesTags: ['AllCarts'],
      keepUnusedDataFor: 600,
    }),

    // delete cart
    deleteCart: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query(id: string) {
          return {
            url: `/api/cart/admin/${id}`,
            method: 'DELETE',
          };
        },
        invalidatesTags: ['AllCarts'],
      }
    ),
  }),
});

export const { useGetAllCartsQuery, useDeleteCartMutation } = cartApi;
