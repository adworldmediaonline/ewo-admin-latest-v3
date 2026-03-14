export interface IReviewProductPopulated {
  _id: string;
  title: string;
  slug: string;
  img?: string;
  sku?: string;
}

export interface IReviewUserPopulated {
  _id: string;
  name: string;
  email: string;
}

export interface IReviewItem {
  _id: string;
  productId: IReviewProductPopulated | string;
  userId?: IReviewUserPopulated | string | null;
  rating: number;
  comment?: string;
  guestName?: string;
  guestEmail?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IReviewListResponse {
  success: boolean;
  data: IReviewItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IAddReviewPayload {
  productId: string;
  rating: number;
  comment?: string;
  userId?: string;
  guestName?: string;
  guestEmail?: string;
}

export interface IUpdateReviewPayload {
  rating?: number;
  comment?: string;
}
