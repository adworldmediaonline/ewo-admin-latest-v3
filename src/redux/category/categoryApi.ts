import { apiSlice } from '../api/apiSlice';
import {
  CategoryResponse,
  IAddCategory,
  IAddCategoryResponse,
  ICategoryDeleteRes,
} from '@/types/category-type';

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // get all categories - Optimized with pagination
    getAllCategories: builder.query<
      CategoryResponse,
      { page?: number; limit?: number; search?: string; status?: string } | void
    >({
      query: (params = {}) => {
        const { page = 1, limit = 10, search = '', status = '' } = params;
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page.toString());
        if (limit) queryParams.append('limit', limit.toString());
        if (search) queryParams.append('search', search);
        if (status) queryParams.append('status', status);
        return `/api/category/all?${queryParams.toString()}`;
      },
      providesTags: ['AllCategory'],
      keepUnusedDataFor: 60, // Keep unused data for 60 seconds only
    }),
    // add category
    addCategory: builder.mutation<IAddCategoryResponse, IAddCategory>({
      query(data: IAddCategory) {
        return {
          url: `/api/category/add`,
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: ['AllCategory'],
    }),
    // delete category
    deleteCategory: builder.mutation<ICategoryDeleteRes, string>({
      query(id: string) {
        return {
          url: `/api/category/delete/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['AllCategory'],
    }),
    // editCategory
    editCategory: builder.mutation<
      IAddCategoryResponse,
      { id: string; data: Partial<IAddCategory> }
    >({
      query({ id, data }) {
        return {
          url: `/api/category/edit/${id}`,
          method: 'PATCH',
          body: data,
        };
      },
      invalidatesTags: ['AllCategory', 'getCategory'],
    }),
    // get single product
    getCategory: builder.query<IAddCategory, string>({
      query: id => `/api/category/get/${id}`,
      providesTags: ['getCategory'],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
  useEditCategoryMutation,
  useGetCategoryQuery,
} = authApi;
