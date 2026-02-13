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

interface CategoryBannerContentProps {
  bannerContentActive: boolean;
  onBannerContentActiveChange: (active: boolean) => void;
  bannerTitle: string;
  onBannerTitleChange: (title: string) => void;
  bannerDescription: string;
  onBannerDescriptionChange: (description: string) => void;
  bannerTitleClasses: string;
  onBannerTitleClassesChange: (value: string) => void;
  bannerDescriptionClasses: string;
  onBannerDescriptionClassesChange: (value: string) => void;
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
  bannerTitleClasses,
  onBannerTitleClassesChange,
  bannerDescriptionClasses,
  onBannerDescriptionClassesChange,
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
    onBannerTitleChange(`${parentName || 'Category'} (${count} ${productLabel})`);
  };

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

          <div className="space-y-2">
            <Label htmlFor="banner-title-classes" className="text-sm font-medium">
              Banner title classes
            </Label>
            <Input
              id="banner-title-classes"
              value={bannerTitleClasses}
              onChange={(e) => onBannerTitleClassesChange(e.target.value)}
              placeholder="e.g. text-center text-primary font-bold"
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Tailwind classes for alignment, colors, typography. Default:
              text-center
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-desc-classes" className="text-sm font-medium">
              Banner description classes
            </Label>
            <Input
              id="banner-desc-classes"
              value={bannerDescriptionClasses}
              onChange={(e) => onBannerDescriptionClassesChange(e.target.value)}
              placeholder="e.g. text-center text-muted-foreground"
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Tailwind classes for alignment, colors, typography. Default:
              text-center
            </p>
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
        </div>
      )}
    </div>
  );
};

export default CategoryBannerContent;
