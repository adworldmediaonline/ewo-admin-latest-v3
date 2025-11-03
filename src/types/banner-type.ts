export interface Banner {
  _id: string;
  desktopImg: string;
  mobileImg: string;
  heading: string;
  description: string;
  smallSubDescription?: string;
  cta: {
    text: string;
    link: string;
  };
  status: 'active' | 'inactive';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BannerResponse {
  success: boolean;
  data: Banner[];
}

export interface BannerDelResponse {
  success: boolean;
  message: string;
}

export interface IAddBanner {
  desktopImg: string;
  mobileImg: string;
  heading: string;
  description: string;
  smallSubDescription?: string;
  cta: {
    text: string;
    link: string;
  };
  status?: 'active' | 'inactive';
  order?: number;
}

export interface IBannerAddResponse {
  success: boolean;
  message: string;
  data: Banner;
}

