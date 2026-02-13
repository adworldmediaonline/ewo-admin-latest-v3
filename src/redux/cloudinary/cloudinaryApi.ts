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
        // Append metadata first so backend receives it reliably with multipart
        const safeFileName = fileName?.trim() || file.name || 'image';
        formData.append('fileName', safeFileName);
        formData.append('title', title?.trim() ?? '');
        formData.append('altText', altText?.trim() ?? '');
        formData.append('folder', folder?.trim() ?? 'ewo-assets');
        formData.append('image', file);
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
          message: (res as { message?: string }).message ?? 'Upload successful',
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
