export interface PageMetadata {
  _id: string | null;
  slug: string;
  displayName?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PageMetadataResponse {
  success: boolean;
  data: PageMetadata[];
}

export interface PageMetadataSingleResponse {
  success: boolean;
  data: PageMetadata | null;
}

export interface PageMetadataUpsertPayload {
  displayName?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  isActive?: boolean;
}
