'use client';

import React from 'react';
import type { Tag } from 'react-tag-input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import CategoryBannerDisplaySettings, {
  type BannerDisplayScope,
} from './category-banner-display-settings';
import { toSlug } from '@/lib/slug';
import type { BannerContentClassesByScope } from '@/types/category-type';

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

const DEFAULT_CLASSES = 'text-center';

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

  const updateParentClasses = (field: 'titleClasses' | 'descriptionClasses', value: string) => {
    const parent = bannerContentClassesByScope?.parent ?? {};
    onBannerContentClassesByScopeChange({
      ...bannerContentClassesByScope,
      parent: { ...parent, [field]: value.trim() || undefined },
    });
  };

  const updateChildClasses = (
    childSlug: string,
    field: 'titleClasses' | 'descriptionClasses',
    value: string
  ) => {
    const children = { ...(bannerContentClassesByScope?.children ?? {}) };
    const current = children[childSlug] ?? {};
    const updated = { ...current, [field]: value.trim() || undefined };
    if (updated.titleClasses || updated.descriptionClasses) {
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
        When active, the title appears above the banner image and the
        description below it.
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
              On the shop page, the title is dynamic: it shows the current
              category (parent or child) + product count based on the content
              display scope. Use auto-fill here as a preview.
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

          {/* Per-scope Tailwind classes */}
          <div className="space-y-4 rounded-md border border-border bg-background p-4">
            <Label className="text-sm font-medium">
              Per-scope Tailwind classes
            </Label>
            <p className="text-xs text-muted-foreground">
              Configure different styling for parent vs child category views.
              Leave empty to use default (text-center).
            </p>

            {/* Parent scope */}
            <div className="space-y-3 rounded-md border border-border/50 bg-muted/20 p-3">
              <Label className="text-sm font-medium text-foreground">
                Parent scope
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="banner-parent-title-classes"
                    className="text-xs font-medium"
                  >
                    Title classes
                  </Label>
                  <Input
                    id="banner-parent-title-classes"
                    value={parentTitleClasses}
                    onChange={(e) =>
                      updateParentClasses('titleClasses', e.target.value)
                    }
                    placeholder={DEFAULT_CLASSES}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="banner-parent-desc-classes"
                    className="text-xs font-medium"
                  >
                    Description classes
                  </Label>
                  <Input
                    id="banner-parent-desc-classes"
                    value={parentDescriptionClasses}
                    onChange={(e) =>
                      updateParentClasses('descriptionClasses', e.target.value)
                    }
                    placeholder={DEFAULT_CLASSES}
                    disabled={disabled}
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
                <div className="space-y-2">
                  {childSlugs.map((slug) => {
                    const label =
                      categoryChildren.find((t) => toSlug(t.text) === slug)
                        ?.text ?? slug;
                    const childClasses =
                      bannerContentClassesByScope?.children?.[slug] ?? {};
                    const titleVal = childClasses.titleClasses ?? '';
                    const descVal = childClasses.descriptionClasses ?? '';
                    return (
                      <div
                        key={slug}
                        className="rounded-md border border-border/50 bg-muted/20 p-3"
                      >
                        <Label className="text-xs font-medium text-muted-foreground">
                          {label}
                        </Label>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label
                              htmlFor={`banner-child-${slug}-title`}
                              className="text-xs"
                            >
                              Title classes
                            </Label>
                            <Input
                              id={`banner-child-${slug}-title`}
                              value={titleVal}
                              onChange={(e) =>
                                updateChildClasses(
                                  slug,
                                  'titleClasses',
                                  e.target.value
                                )
                              }
                              placeholder={DEFAULT_CLASSES}
                              disabled={disabled}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label
                              htmlFor={`banner-child-${slug}-desc`}
                              className="text-xs"
                            >
                              Description classes
                            </Label>
                            <Input
                              id={`banner-child-${slug}-desc`}
                              value={descVal}
                              onChange={(e) =>
                                updateChildClasses(
                                  slug,
                                  'descriptionClasses',
                                  e.target.value
                                )
                              }
                              placeholder={DEFAULT_CLASSES}
                              disabled={disabled}
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
