import type { ImageWithMeta } from '@/types/image-with-meta';

export interface ICloudinaryDeleteResponse {
  status: string;
  message: string;
  data: unknown;
}

export interface ICloudinaryPostResponse {
  status?: string;
  success?: boolean;
  message?: string;
  data: {
    url: string;
    id: string;
    fileName?: string;
    title?: string;
    altText?: string;
  };
}

export interface ICloudinaryPostWithMetaResponse {
  success: boolean;
  message: string;
  data: ImageWithMeta;
}

export interface ICloudinaryMultiplePostRes {
  success: boolean;
  message: string;
  data: Array<{ url: string; id: string } | ImageWithMeta>;
}