import type { ImageWithMeta } from './image-with-meta';

export type BannerDisplayScope =
  | 'all'
  | 'parent_only'
  | 'children_only'
  | 'parent_and_children';

/** Heading tag for banner title (H1–H3) */
export type BannerTitleHeadingTag = 'h1' | 'h2' | 'h3';

/** Per-scope Tailwind classes and options for banner title and description */
export interface BannerScopeClasses {
  titleClasses?: string;
  descriptionClasses?: string;
  /** Heading tag for the title (H1, H2, or H3) */
  headingTag?: BannerTitleHeadingTag;
  /** Tailwind classes for the product count span */
  productCountClasses?: string;
}

/** Classes by scope: parent and per-child (keyed by child slug) */
export interface BannerContentClassesByScope {
  parent?: BannerScopeClasses | null;
  children?: Record<string, BannerScopeClasses>;
}

export interface ICategoryItem {
  _id: string;
  img?: string;
  /** Image with metadata (fileName, title, altText) – preferred over img */
  image?: ImageWithMeta;
  /** Category banner for shop page */
  banner?: ImageWithMeta;
  bannerDisplayScope?: BannerDisplayScope;
  bannerDisplayChildren?: string[];
  bannerContentActive?: boolean;
  bannerContentDisplayScope?: BannerDisplayScope;
  bannerContentDisplayChildren?: string[];
  bannerTitle?: string;
  bannerDescription?: string;
  bannerTitleClasses?: string;
  bannerDescriptionClasses?: string;
  bannerContentClassesByScope?: BannerContentClassesByScope;
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
  /** Category banner for shop page */
  banner?: ImageWithMeta;
  bannerDisplayScope?: BannerDisplayScope;
  bannerDisplayChildren?: string[];
  bannerContentActive?: boolean;
  bannerContentDisplayScope?: BannerDisplayScope;
  bannerContentDisplayChildren?: string[];
  bannerTitle?: string;
  bannerDescription?: string;
  bannerTitleClasses?: string;
  bannerDescriptionClasses?: string;
  bannerContentClassesByScope?: BannerContentClassesByScope;
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
