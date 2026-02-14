'use client';

import React from 'react';
import type { Tag } from 'react-tag-input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import BannerStyleControls from './banner-style-controls';
import CategoryBannerDisplaySettings, {
  type BannerDisplayScope,
} from './category-banner-display-settings';
import { toSlug } from '@/lib/slug';
import type {
  BannerContentClassesByScope,
  BannerTitleHeadingTag,
} from '@/types/category-type';

interface CategoryBannerContentProps {
  bannerContentActive: boolean;
  onBannerContentActiveChange: (active: boolean) => void;
  bannerTitle: string;
  onBannerTitleChange: (title: string) => void;
  bannerDescription: string;
  onBannerDescriptionChange: (description: string) => void;
  bannerContentClassesByScope: BannerContentClassesByScope;
  onBannerContentClassesByScopeChange: (
    value: BannerContentClassesByScope
  ) => void;
  bannerContentDisplayScope: BannerDisplayScope;
  onBannerContentDisplayScopeChange: (scope: BannerDisplayScope) => void;
  bannerContentDisplayChildren: string[];
  onBannerContentDisplayChildrenChange: (slugs: string[]) => void;
  categoryChildren: Tag[];
  parentName: string;
  productCount: number;
  disabled?: boolean;
}

const CategoryBannerContent = ({
  bannerContentActive,
  onBannerContentActiveChange,
  bannerTitle,
  onBannerTitleChange,
  bannerDescription,
  onBannerDescriptionChange,
  bannerContentClassesByScope,
  onBannerContentClassesByScopeChange,
  bannerContentDisplayScope,
  onBannerContentDisplayScopeChange,
  bannerContentDisplayChildren,
  onBannerContentDisplayChildrenChange,
  categoryChildren,
  parentName,
  productCount,
  disabled = false,
}: CategoryBannerContentProps) => {
  const handleAutoFillTitle = () => {
    const count = productCount ?? 0;
    const productLabel = count === 1 ? 'product' : 'products';
    onBannerTitleChange(
      `${parentName || 'Category'} (${count} ${productLabel})`
    );
  };

  const childSlugs = categoryChildren
    .map((t) => t.text)
    .filter(Boolean)
    .map((c) => toSlug(c));

  type ParentField =
    | 'titleClasses'
    | 'descriptionClasses'
    | 'headingTag'
    | 'productCountClasses';
  type ChildField = ParentField;

  const updateParentClasses = (
    field: ParentField,
    value: string | BannerTitleHeadingTag | undefined
  ) => {
    const parent = bannerContentClassesByScope?.parent ?? {};
    const trimmed =
      typeof value === 'string' ? value.trim() || undefined : value;
    onBannerContentClassesByScopeChange({
      ...bannerContentClassesByScope,
      parent: { ...parent, [field]: trimmed },
    });
  };

  const updateChildClasses = (
    childSlug: string,
    field: ChildField,
    value: string | BannerTitleHeadingTag | undefined
  ) => {
    const children = { ...(bannerContentClassesByScope?.children ?? {}) };
    const current = children[childSlug] ?? {};
    const trimmed =
      typeof value === 'string' ? value.trim() || undefined : value;
    const updated = { ...current, [field]: trimmed };
    const hasAny =
      updated.titleClasses ||
      updated.descriptionClasses ||
      updated.headingTag ||
      updated.productCountClasses;
    if (hasAny) {
      children[childSlug] = updated;
    } else {
      delete children[childSlug];
    }
    onBannerContentClassesByScopeChange({
      ...bannerContentClassesByScope,
      children,
    });
  };

  const parentTitleClasses =
    bannerContentClassesByScope?.parent?.titleClasses ?? '';
  const parentDescriptionClasses =
    bannerContentClassesByScope?.parent?.descriptionClasses ?? '';
  const parentHeadingTag =
    bannerContentClassesByScope?.parent?.headingTag ?? 'h2';
  const parentProductCountClasses =
    bannerContentClassesByScope?.parent?.productCountClasses ?? '';

  return (
    <div className="space-y-4 rounded-md border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="banner-content-active" className="text-sm font-medium">
          Show banner title and description
        </Label>
        <Switch
          id="banner-content-active"
          checked={bannerContentActive}
          onCheckedChange={onBannerContentActiveChange}
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        When active, the title and description appear on the shop page. With a
        banner image, they show above and below it; without an image, they
        display on their own.
      </p>

      {bannerContentActive && (
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="banner-title" className="text-sm font-medium">
              Banner title
            </Label>
            <div className="flex gap-2">
              <Input
                id="banner-title"
                value={bannerTitle}
                onChange={(e) => onBannerTitleChange(e.target.value)}
                placeholder="e.g. Steering Knuckles (24 products)"
                disabled={disabled}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoFillTitle}
                disabled={disabled}
                className="shrink-0"
                title="Auto-fill with category name + product count"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              On the shop page, the title is always dynamic: category name +
              live product count. The count updates automatically when products
              are added or removed—no manual regeneration needed. Use auto-fill
              here as a preview only.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-description" className="text-sm font-medium">
              Banner description
            </Label>
            <Textarea
              id="banner-description"
              value={bannerDescription}
              onChange={(e) => onBannerDescriptionChange(e.target.value)}
              placeholder="Add a description for the banner..."
              rows={3}
              disabled={disabled}
              className="resize-none"
            />
          </div>

          <CategoryBannerDisplaySettings
            scope={bannerContentDisplayScope}
            onScopeChange={onBannerContentDisplayScopeChange}
            selectedChildren={bannerContentDisplayChildren}
            onSelectedChildrenChange={onBannerContentDisplayChildrenChange}
            categoryChildren={categoryChildren}
            disabled={disabled}
            label="Banner content display scope"
            childrenLabel="Select child categories for banner content"
          />

          {/* Per-scope styling - user-friendly controls */}
          <div className="space-y-4 rounded-md border border-border bg-background p-4">
            <Label className="text-sm font-medium">
              Per-scope styling
            </Label>
            <p className="text-xs text-muted-foreground">
              Configure alignment, font size, weight, spacing, and color for
              parent vs child category views. Selections apply Tailwind classes
              automatically.
            </p>

            {/* Parent scope */}
            <div className="space-y-4 rounded-md border border-border/50 bg-muted/20 p-4">
              <Label className="text-sm font-medium text-foreground">
                Parent scope
              </Label>
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <BannerStyleControls
                    value={parentTitleClasses}
                    onChange={(v) => updateParentClasses('titleClasses', v)}
                    variant="title"
                    disabled={disabled}
                    label="Title styling"
                  />
                  <BannerStyleControls
                    value={parentDescriptionClasses}
                    onChange={(v) =>
                      updateParentClasses('descriptionClasses', v)
                    }
                    variant="description"
                    disabled={disabled}
                    label="Description styling"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      Heading tag
                    </Label>
                              <select
                                value={parentHeadingTag}
                                onChange={(e) =>
                                  updateParentClasses(
                                    'headingTag',
                                    e.target.value as BannerTitleHeadingTag
                                  )
                                }
                                disabled={disabled}
                                aria-label="Heading tag for banner title"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              >
                      <option value="h1">H1</option>
                      <option value="h2">H2</option>
                      <option value="h3">H3</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Semantic heading level for the title
                    </p>
                  </div>
                  <BannerStyleControls
                    value={parentProductCountClasses}
                    onChange={(v) =>
                      updateParentClasses('productCountClasses', v)
                    }
                    variant="description"
                    disabled={disabled}
                    label="Product count styling"
                  />
                </div>
              </div>
            </div>

            {/* Per-child scope */}
            {childSlugs.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">
                  Child scope (per subcategory)
                </Label>
                <div className="space-y-4">
                  {childSlugs.map((slug) => {
                    const childLabel =
                      categoryChildren.find((t) => toSlug(t.text) === slug)
                        ?.text ?? slug;
                    const childClasses =
                      bannerContentClassesByScope?.children?.[slug] ?? {};
                    const titleVal = childClasses.titleClasses ?? '';
                    const descVal = childClasses.descriptionClasses ?? '';
                    const headingVal = childClasses.headingTag ?? 'h2';
                    const productCountVal =
                      childClasses.productCountClasses ?? '';
                    return (
                      <div
                        key={slug}
                        className="rounded-md border border-border/50 bg-muted/20 p-4"
                      >
                        <Label className="text-sm font-medium text-muted-foreground">
                          {childLabel}
                        </Label>
                        <div className="mt-3 space-y-6">
                          <div className="grid gap-6 sm:grid-cols-2">
                            <BannerStyleControls
                              value={titleVal}
                              onChange={(v) =>
                                updateChildClasses(slug, 'titleClasses', v)
                              }
                              variant="title"
                              disabled={disabled}
                              label="Title styling"
                            />
                            <BannerStyleControls
                              value={descVal}
                              onChange={(v) =>
                                updateChildClasses(
                                  slug,
                                  'descriptionClasses',
                                  v
                                )
                              }
                              variant="description"
                              disabled={disabled}
                              label="Description styling"
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label className="text-sm font-medium">
                                Heading tag
                              </Label>
                              <select
                                value={headingVal}
                                onChange={(e) =>
                                  updateChildClasses(
                                    slug,
                                    'headingTag',
                                    e.target.value as BannerTitleHeadingTag
                                  )
                                }
                                disabled={disabled}
                                aria-label={`Heading tag for ${childLabel}`}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="h1">H1</option>
                                <option value="h2">H2</option>
                                <option value="h3">H3</option>
                              </select>
                            </div>
                            <BannerStyleControls
                              value={productCountVal}
                              onChange={(v) =>
                                updateChildClasses(
                                  slug,
                                  'productCountClasses',
                                  v
                                )
                              }
                              variant="description"
                              disabled={disabled}
                              label="Product count styling"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryBannerContent;
