/**
 * Converts a label to a URL-safe slug.
 * Matches the logic used in ewo frontend for category/subcategory URLs.
 */
export function toSlug(label: string): string {
  if (!label) return '';
  return label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
