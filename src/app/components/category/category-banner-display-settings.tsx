'use client';

import React from 'react';
import type { Tag } from 'react-tag-input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toSlug } from '@/lib/slug';

export type BannerDisplayScope =
  | 'all'
  | 'parent_only'
  | 'children_only'
  | 'parent_and_children';

interface CategoryBannerDisplaySettingsProps {
  scope: BannerDisplayScope;
  onScopeChange: (scope: BannerDisplayScope) => void;
  selectedChildren: string[];
  onSelectedChildrenChange: (slugs: string[]) => void;
  categoryChildren: Tag[];
  disabled?: boolean;
  /** Override label for scope section */
  label?: string;
  /** Override label for children selector */
  childrenLabel?: string;
}

const SCOPE_OPTIONS: { value: BannerDisplayScope; label: string }[] = [
  { value: 'all', label: 'Parent and all child categories (default)' },
  { value: 'parent_only', label: 'Only the parent category' },
  { value: 'children_only', label: 'Only specific child categories' },
  {
    value: 'parent_and_children',
    label: 'Parent and selected child categories',
  },
];

const CategoryBannerDisplaySettings = ({
  scope,
  onScopeChange,
  selectedChildren,
  onSelectedChildrenChange,
  categoryChildren,
  disabled = false,
  label = 'Banner display scope',
  childrenLabel = 'Select child categories for banner',
}: CategoryBannerDisplaySettingsProps) => {
  const childSlugs = categoryChildren
    .map(t => t.text)
    .filter(Boolean)
    .map(c => toSlug(c));

  const handleChildToggle = (childSlug: string, checked: boolean) => {
    if (checked) {
      onSelectedChildrenChange([...selectedChildren, childSlug].filter(Boolean));
    } else {
      onSelectedChildrenChange(selectedChildren.filter(s => s !== childSlug));
    }
  };

  const showChildrenSelector =
    scope === 'children_only' || scope === 'parent_and_children';

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">{label}</Label>
        <RadioGroup
          value={scope}
          onValueChange={(v) => onScopeChange(v as BannerDisplayScope)}
          className="flex flex-col gap-2"
          disabled={disabled}
        >
          {SCOPE_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className="flex items-center space-x-2"
            >
              <RadioGroupItem
                value={opt.value}
                id={`banner-scope-${opt.value}`}
                disabled={disabled}
              />
              <Label
                htmlFor={`banner-scope-${opt.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {showChildrenSelector && childSlugs.length > 0 && (
        <div className="space-y-3 rounded-md border border-border bg-muted/30 p-4">
          <Label className="text-sm font-medium">
            {childrenLabel}
          </Label>
          <div className="flex flex-wrap gap-3">
            {childSlugs.map((slug) => {
              const label =
                categoryChildren.find((t) => toSlug(t.text) === slug)?.text ||
                slug;
              const isChecked = selectedChildren.includes(slug);
              return (
                <div
                  key={slug}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`banner-child-${slug}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleChildToggle(slug, !!checked)
                    }
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={`banner-child-${slug}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showChildrenSelector && childSlugs.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Add sub-categories above to select which ones should show the banner.
        </p>
      )}
    </div>
  );
};

export default CategoryBannerDisplaySettings;
