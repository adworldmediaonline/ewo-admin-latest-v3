import type { ImageWithMeta } from './image-with-meta';

export type HeroVariant = 'image_only' | 'image_content' | 'content_only';

export interface HeroSectionContent {
  variant: HeroVariant;
  image?: ImageWithMeta;
  heading?: string;
  description?: string;
  smallSubDescription?: string;
  cta?: { text: string; link: string };
  /** Mobile variant – separate image and content optimized for mobile */
  mobileImage?: ImageWithMeta;
  mobileHeading?: string;
  mobileDescription?: string;
  mobileSmallSubDescription?: string;
  mobileCta?: { text: string; link: string };
}

/** Custom section block types */
export type CustomBlockType = 'text' | 'image' | 'button' | 'spacer' | 'columns' | 'video';

export interface CustomBlockBase {
  id: string;
  type: CustomBlockType;
  /** Optional Tailwind classes applied to the block wrapper (e.g. text-center, flex justify-center) */
  className?: string;
}

export interface CustomTextBlock extends CustomBlockBase {
  type: 'text';
  heading?: string;
  body?: string;
}

export interface CustomImageBlock extends CustomBlockBase {
  type: 'image';
  image?: ImageWithMeta;
}

export interface CustomButtonBlock extends CustomBlockBase {
  type: 'button';
  text: string;
  link: string;
}

export interface CustomSpacerBlock extends CustomBlockBase {
  type: 'spacer';
  height?: number; // px
}

export interface CustomColumnItem {
  heading?: string;
  body?: string;
}

export interface CustomColumnsBlock extends CustomBlockBase {
  type: 'columns';
  columnCount?: 2 | 3 | 4;
  items: CustomColumnItem[];
}

export interface CustomVideoBlock extends CustomBlockBase {
  type: 'video';
  url: string;
  title?: string;
}

export type CustomBlock =
  | CustomTextBlock
  | CustomImageBlock
  | CustomButtonBlock
  | CustomSpacerBlock
  | CustomColumnsBlock
  | CustomVideoBlock;

export interface CustomSectionLayout {
  width?: 'full' | 'contained';
  backgroundColor?: string;
  backgroundImage?: ImageWithMeta;
}

export interface CustomSectionContent {
  layout?: CustomSectionLayout;
  blocks: CustomBlock[];
}

/** Category Showcase section – displays categories from DB with configurable heading/CTA */
export interface CategoryShowcaseContent {
  heading?: string;
  showExploreAll?: boolean;
  exploreAllLink?: string;
  exploreAllLabel?: string;
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
