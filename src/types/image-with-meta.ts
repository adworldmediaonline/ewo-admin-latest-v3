/**
 * Image metadata - always managed together for every image.
 * Used consistently across the CMS and admin panel.
 */
export interface ImageWithMeta {
  url: string;
  fileName: string;
  title: string;
  altText: string;
  /** Optional link to navigate when image is clicked (e.g. /shop, /about) */
  link?: string;
}

/**
 * Payload when uploading an image with metadata
 */
export interface ImageUploadMetaPayload {
  fileName?: string;
  title?: string;
  altText?: string;
  link?: string;
}
