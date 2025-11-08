export interface IDelReviewsRes {
  success: boolean;
  message: string;
}

export interface IReviewProductRes {
  success: boolean;
  data: IProduct[];
}

export interface ProductResponse {
  success: boolean;
  data: IProduct[];
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
  reviews: IReview[];
  description: string;
  videoId?: string;
  additionalInformation: Array<{
    key: string;
    value: string;
  }>;
  options?: Array<{
    title: string;
    price: number;
  }>;
  tags: string[];
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
  extends Omit<IProduct, '_id' | 'reviews' | 'sellCount'> { }
