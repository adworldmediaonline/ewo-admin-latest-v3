/**
 * Processes categories for Category Showcase display.
 * Uses showcaseGroups from each category (configured in Admin) to determine
 * how child categories are grouped or split into separate cards.
 * When showcaseGroups is empty: all children appear in one card (default).
 */

import { toSlug } from '@/lib/slug';

export interface ShowcaseGroupConfig {
  children?: string[];
  image?: { url: string; fileName?: string; title?: string; altText?: string } | null;
}

export interface CategoryItem {
  _id: string;
  parent: string;
  description?: string;
  img?: string;
  image?: { url: string; fileName?: string; title?: string; altText?: string };
  status?: string;
  products?: unknown[];
  children?: string[];
  showcaseGroups?: ShowcaseGroupConfig[];
  parentCategorySlug?: string;
  subcategorySlug?: string;
}

/**
 * Expands a category into one or more showcase cards based on showcaseGroups.
 * - No showcaseGroups: one card with all children
 * - With showcaseGroups: one card per group; unassigned children in a final card
 */
export function processCategoriesForShowcase(categories: CategoryItem[]): CategoryItem[] {
  const result: CategoryItem[] = [];

  for (const cat of categories) {
    const parentSlug = toSlug(cat.parent || '');
    const children = Array.isArray(cat.children) ? cat.children : [];
    const groups = Array.isArray(cat.showcaseGroups) ? cat.showcaseGroups : [];
    const parentImage = cat.image?.url || cat.img;
    const parentImageMeta = cat.image;

    if (children.length === 0) {
      result.push({
        ...cat,
        parentCategorySlug: parentSlug,
      });
      continue;
    }

    const assignedChildren = new Set<string>();

    if (groups.length > 0) {
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const groupChildren = Array.isArray(group?.children) ? group.children : [];
        if (groupChildren.length === 0) continue;

        groupChildren.forEach((c) => assignedChildren.add(c));

        const childSlugs = groupChildren.map((c) => toSlug(c)).filter(Boolean);
        const subcategorySlug = childSlugs.join(',');
        const groupImage = group.image?.url;
        const groupImageMeta = group.image;

        const cardImage = groupImage || parentImage;
        const cardImageMeta = groupImageMeta || parentImageMeta;

        result.push({
          _id: `${cat._id}-group-${i}`,
          parent: cat.parent,
          description: cat.description,
          img: cardImage,
          image: cardImageMeta ? { url: cardImageMeta.url, fileName: cardImageMeta.fileName, title: cardImageMeta.title, altText: cardImageMeta.altText } : undefined,
          status: cat.status,
          products: cat.products,
          children: groupChildren,
          parentCategorySlug: parentSlug,
          subcategorySlug,
        });
      }
    }

    const unassigned = children.filter((c) => !assignedChildren.has(c));
    if (unassigned.length > 0) {
      const childSlugs = unassigned.map((c) => toSlug(c)).filter(Boolean);
      result.push({
        _id: `${cat._id}-group-default`,
        parent: cat.parent,
        description: cat.description,
        img: parentImage,
        image: parentImageMeta,
        status: cat.status,
        products: cat.products,
        children: unassigned,
        parentCategorySlug: parentSlug,
        subcategorySlug: childSlugs.join(','),
      });
    } else if (groups.length === 0) {
      const childSlugs = children.map((c) => toSlug(c)).filter(Boolean);
      result.push({
        ...cat,
        _id: cat._id,
        parentCategorySlug: parentSlug,
        subcategorySlug: childSlugs.join(','),
      });
    }
  }

  return result;
}
