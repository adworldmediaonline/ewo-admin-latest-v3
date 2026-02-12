import { apiSlice } from '../api/apiSlice';
import type { ImageWithMeta } from '@/types/image-with-meta';
import {
  ICloudinaryDeleteResponse,
  ICloudinaryMultiplePostRes,
  ICloudinaryPostResponse,
  ICloudinaryPostWithMetaResponse,
} from './type';

export const cloudinaryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    uploadImage: builder.mutation<ICloudinaryPostResponse, FormData>({
      query: (data) => ({
        url: '/api/cloudinary/add-img',
        method: 'POST',
        body: data,
      }),
    }),
    uploadImageWithMeta: builder.mutation<
      ICloudinaryPostWithMetaResponse,
      { file: File; fileName?: string; title?: string; altText?: string; folder?: string }
    >({
      query: ({ file, fileName, title, altText, folder }) => {
        const formData = new FormData();
        formData.append('image', file);
        if (fileName) formData.append('fileName', fileName);
        if (title) formData.append('title', title);
        if (altText) formData.append('altText', altText);
        if (folder) formData.append('folder', folder);
        return {
          url: '/api/cloudinary/add-img',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (res: { success: boolean; data: Record<string, unknown> }) => {
        const d = res.data as Record<string, string>;
        return {
          success: res.success,
          message: (res as { message?: string }).message,
          data: {
            url: d.url ?? '',
            fileName: d.fileName ?? d.original_filename ?? 'image',
            title: d.title ?? '',
            altText: d.altText ?? d.title ?? d.fileName ?? '',
          } as ImageWithMeta,
        };
      },
    }),
    uploadImageMultiple: builder.mutation<ICloudinaryMultiplePostRes, FormData>(
      {
        query: data => ({
          url: '/api/cloudinary/add-multiple-img',
          method: 'POST',
          body: data,
        }),
      }
    ),
    deleteCloudinaryImg: builder.mutation<
      ICloudinaryDeleteResponse,
      { folder_name: string; id: string }
    >({
      query({ folder_name, id }) {
        return {
          url: `/api/cloudinary/img-delete?folder_name=${folder_name}&id=${id}`,
          method: 'DELETE',
        };
      },
    }),
  }),
});

export const {
  useDeleteCloudinaryImgMutation,
  useUploadImageMutation,
  useUploadImageWithMetaMutation,
  useUploadImageMultipleMutation,
} = cloudinaryApi;
