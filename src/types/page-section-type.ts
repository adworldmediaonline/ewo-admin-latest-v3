import type { ImageWithMeta } from './image-with-meta';

export type HeroVariant = 'image_only' | 'image_content' | 'content_only';

export interface HeroSectionContent {
  variant: HeroVariant;
  image?: ImageWithMeta;
  heading?: string;
  description?: string;
  smallSubDescription?: string;
  cta?: { text: string; link: string };
}

export interface PageSection {
  _id: string;
  pageSlug: string;
  sectionKey: string;
  sectionType: string;
  config: Record<string, unknown>;
  content: Record<string, unknown>;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageSectionUpsertPayload {
  sectionType: string;
  config?: Record<string, unknown>;
  content?: Record<string, unknown>;
  order?: number;
  isActive?: boolean;
}
