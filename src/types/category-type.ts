import type { ImageWithMeta } from './image-with-meta';

export interface ICategoryItem {
  _id: string;
  img?: string;
  /** Image with metadata (fileName, title, altText) – preferred over img */
  image?: ImageWithMeta;
  parent: string;
  children: string[];
  products?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  result: ICategoryItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IAddCategory {
  img?: string;
  /** Image with metadata (fileName, title, altText) */
  image?: ImageWithMeta;
  parent: string;
  children?: string[];
  description?: string;
}

export interface IAddCategoryResponse {
  status: string;
  message: string;
  data: {
    parent: string;
    children?: string[];
    products?: any[];
    _id: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ICategoryDeleteRes {
  success?: boolean;
  message?: string;
}
