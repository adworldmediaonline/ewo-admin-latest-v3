import { apiSlice } from '../api/apiSlice';
import {
  BlogCategoryResponse,
  IAddBlogCategory,
  IAddBlogCategoryResponse,
  IBlogCategoryDeleteRes,
} from '@/types/blog-category-type';

export const blogCategoryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    // get all blog categories
    getAllBlogCategories: builder.query<BlogCategoryResponse, void>({
      query: () => `/api/blog-category/all`,
      providesTags: ['AllBlogCategory'],
      keepUnusedDataFor: 600,
    }),

    // add blog category
    addBlogCategory: builder.mutation<
      IAddBlogCategoryResponse,
      IAddBlogCategory
    >({
      query(data: IAddBlogCategory) {
        return {
          url: `/api/blog-category/add`,
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: ['AllBlogCategory'],
    }),

    // delete blog category
    deleteBlogCategory: builder.mutation<IBlogCategoryDeleteRes, string>({
      query(id: string) {
        return {
          url: `/api/blog-category/delete/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['AllBlogCategory'],
    }),

    // edit blog category
    editBlogCategory: builder.mutation<
      IAddBlogCategoryResponse,
      { id: string; data: Partial<IAddBlogCategory> }
    >({
      query({ id, data }) {
        return {
          url: `/api/blog-category/edit/${id}`,
          method: 'PATCH',
          body: data,
        };
      },
      invalidatesTags: ['AllBlogCategory', 'getBlogCategory'],
    }),

    // get single blog category
    getBlogCategory: builder.query<IAddBlogCategory, string>({
      query: id => `/api/blog-category/get/${id}`,
      providesTags: ['getBlogCategory'],
    }),
  }),
});

export const {
  useGetAllBlogCategoriesQuery,
  useAddBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
  useEditBlogCategoryMutation,
  useGetBlogCategoryQuery,
} = blogCategoryApi;
