/**
 * Processes categories for Category Showcase display.
 * Mirrors the logic in ewo/src/components/version-tsx/categories/category-showcase-grid.tsx
 * so admin and frontend show the same list (including DANA 60 split).
 */

function toSlug(label: string): string {
  if (!label) return '';
  return label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export interface CategoryItem {
  _id: string;
  parent: string;
  description?: string;
  img?: string;
  status?: string;
  products?: unknown[];
  children?: string[];
  parentCategorySlug?: string;
  subcategorySlug?: string;
}

export function processCategoriesForShowcase(categories: CategoryItem[]): CategoryItem[] {
  const processedCategories = [...categories];
  const dana60SubcategoryName = 'DANA 60';
  const parentCategorySlug = 'crossover-and-high-steer-kits';
  const dana60Slug = 'dana-60';

  const parentCategoryIndex = processedCategories.findIndex((item: CategoryItem) => {
    if (!item.parent) return false;
    const itemSlug = toSlug(item.parent);
    return itemSlug === parentCategorySlug;
  });

  if (parentCategoryIndex === -1) return processedCategories;

  const parentCategory = processedCategories[parentCategoryIndex];
  let dana60Category: CategoryItem | null = null;

  if (parentCategory.children && Array.isArray(parentCategory.children)) {
    const dana60Index = parentCategory.children.findIndex((child: string) => {
      if (!child) return false;
      const childSlug = toSlug(child);
      return childSlug === dana60Slug;
    });

    if (dana60Index !== -1) {
      const updatedChildren = [...parentCategory.children];
      const dana60Name = updatedChildren[dana60Index];
      updatedChildren.splice(dana60Index, 1);

      const updatedParentCategory = {
        ...parentCategory,
        children: updatedChildren,
      };

      const dana60Exists = processedCategories.some((item: CategoryItem) => {
        if (!item.parent) return false;
        const itemSlug = toSlug(item.parent);
        return itemSlug === dana60Slug;
      });

      if (!dana60Exists) {
        dana60Category = {
          _id: `dana-60-standalone-${parentCategory._id}`,
          parent: parentCategory.parent,
          children: [dana60Name || dana60SubcategoryName],
          status: parentCategory.status || 'Show',
          description: parentCategory.description,
          img: 'https://res.cloudinary.com/datdyxl7o/image/upload/v1768978611/dana_60_cybdcn.webp',
          products: parentCategory.products,
          parentCategorySlug: parentCategorySlug,
          subcategorySlug: dana60Slug,
        };
      }

      processedCategories.splice(parentCategoryIndex, 1);

      const existingDana60Index = processedCategories.findIndex((item: CategoryItem) => {
        if (!item.parent) return false;
        const itemSlug = toSlug(item.parent);
        return itemSlug === dana60Slug;
      });

      if (existingDana60Index !== -1) {
        const existingDana60 = processedCategories[existingDana60Index];
        dana60Category = {
          ...existingDana60,
          parent: parentCategory.parent,
          children: [dana60Name || dana60SubcategoryName],
          img: 'https://res.cloudinary.com/datdyxl7o/image/upload/v1768978611/dana_60_cybdcn.webp',
          parentCategorySlug: parentCategorySlug,
          subcategorySlug: dana60Slug,
        };
        processedCategories.splice(existingDana60Index, 1);
      }

      if (dana60Category) {
        processedCategories.unshift(dana60Category);
      }
      processedCategories.unshift(updatedParentCategory);
    }
  }

  return processedCategories;
}
