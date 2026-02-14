export interface IDelReviewsRes {
  success: boolean;
  message: string;
}

export interface IReviewProductRes {
  success: boolean;
  data: IProduct[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: IProduct[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IReview {
  _id: string;
  rating: number;
  userId: string;
}

type Category = {
  name: string;
  id: string;
};

export interface IProduct {
  _id: string;
  sku: string;
  img: string;
  title: string;
  slug: string;
  unit?: string;
  imageURLs: string[];
  parent: string;
  children: string;
  price: number;
  discount: number;
  shipping?: {
    price: number;
    description: string;
  };
  quantity: number;
  orderQuantity?: number;
  brand?: string;
  category: Category;
  status: string;
  publishStatus?: 'draft' | 'published';
  reviews: IReview[];
  description: string;
  faqs?: string;
  moreDetails?: string;
  videoId?: string;
  additionalInformation: Array<{
    key: string;
    value: string;
  }>;
  options?: Array<{
    title: string;
    price: number;
  }>;
  productConfigurations?: Array<{
    title: string;
    options: Array<{
      name: string;
      price: number | string;
      priceType?: 'fixed' | 'percentage';
      percentage?: number;
      isPercentageIncrease?: boolean;
      isSelected: boolean;
      image?: string;
    }>;
    enableCustomNote?: boolean;
    customNotePlaceholder?: string;
  }>;
  tags: string[];
  badges?: string[];
  offerDate?: {
    startDate: string | null;
    endDate: string | null;
  };
  seo?: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  };
  featured?: boolean;
  sellCount?: number;
  finalPriceDiscount?: number;
  updatedPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderProduct extends IProduct {
  orderQuantity: number;
  selectedOption?: {
    title: string;
    price: number;
  };
  basePrice?: number;
}

export interface IAddProduct
  extends Omit<IProduct, '_id' | 'reviews' | 'sellCount'> {
  _id?: string;
  image?: { url?: string; fileName?: string; title?: string; altText?: string };
  imageURLsWithMeta?: Array<{ url?: string; fileName?: string; title?: string; altText?: string }>;
}
