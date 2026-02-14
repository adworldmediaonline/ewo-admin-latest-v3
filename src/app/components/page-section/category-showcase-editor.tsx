'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { CategoryShowcaseContent } from '@/types/page-section-type';
import { useGetShowCategoriesQuery } from '@/redux/category/categoryApi';
import { processCategoriesForShowcase } from '@/lib/process-categories-for-showcase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Save, LayoutGrid, MoveUp, MoveDown, GripVertical } from 'lucide-react';
import { notifyError, notifySuccess } from '@/utils/toast';

const DEFAULT_HEADING = 'Shop by Category';
const DEFAULT_EXPLORE_LABEL = 'Explore all';
const DEFAULT_EXPLORE_LINK = '/shop';

interface CategoryShowcaseEditorProps {
  content: CategoryShowcaseContent | null;
  onSave: (content: CategoryShowcaseContent) => Promise<void>;
  onCancel: () => void;
  isActive?: boolean;
  onActiveChange?: (active: boolean, getCurrentContent: () => CategoryShowcaseContent) => void | Promise<void>;
}

export const CategoryShowcaseEditor = ({
  content,
  onSave,
  onCancel,
  isActive = true,
  onActiveChange,
}: CategoryShowcaseEditorProps) => {
  const [heading, setHeading] = useState(DEFAULT_HEADING);
  const [showExploreAll, setShowExploreAll] = useState(true);
  const [exploreAllLink, setExploreAllLink] = useState(DEFAULT_EXPLORE_LINK);
  const [exploreAllLabel, setExploreAllLabel] = useState(DEFAULT_EXPLORE_LABEL);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: categoriesData, isLoading: categoriesLoading } = useGetShowCategoriesQuery();
  const rawCategories = (categoriesData?.result ?? []) as Array<{ _id: string; parent: string; children?: string[] }>;
  const processedCategories = useMemo(
    () => processCategoriesForShowcase(rawCategories),
    [rawCategories]
  );

  useEffect(() => {
    if (content) {
      setHeading(content.heading ?? DEFAULT_HEADING);
      setShowExploreAll(content.showExploreAll ?? true);
      setExploreAllLink(content.exploreAllLink ?? DEFAULT_EXPLORE_LINK);
      setExploreAllLabel(content.exploreAllLabel ?? DEFAULT_EXPLORE_LABEL);
      setCategoryOrder(content.categoryOrder ?? []);
    }
  }, [content]);

  const orderedIds = categoryOrder.length > 0
    ? categoryOrder.filter((id) => processedCategories.some((c) => c._id === id))
    : processedCategories.map((c) => c._id);
  const missingIds = processedCategories
    .filter((c) => !orderedIds.includes(c._id))
    .map((c) => c._id);
  const displayOrder = [...orderedIds, ...missingIds];

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= displayOrder.length) return;
    const newOrder = [...displayOrder];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setCategoryOrder(newOrder);
  };

  const buildPayloadFromFormState = (): CategoryShowcaseContent => ({
    heading: heading.trim() || DEFAULT_HEADING,
    showExploreAll,
    exploreAllLink: exploreAllLink.trim() || DEFAULT_EXPLORE_LINK,
    exploreAllLabel: exploreAllLabel.trim() || DEFAULT_EXPLORE_LABEL,
    categoryOrder: displayOrder.length > 0 ? displayOrder : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(buildPayloadFromFormState());
      notifySuccess('Category Showcase saved');
    } catch {
      notifyError('Failed to save section');
    } finally {
      setIsSaving(false);
    }
  };

  const handleActiveChange = (checked: boolean) => {
    if (onActiveChange) {
      onActiveChange(checked, buildPayloadFromFormState);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-4">
      <Card className="border-muted">
        <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Category Showcase</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Displays categories from your database. Categories are fetched dynamically at render time.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-6 sm:px-6">
          <div className="space-y-2">
            <Label htmlFor="heading">Section heading</Label>
            <Input
              id="heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Shop by Category"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="show-explore" className="cursor-pointer">
                Show &quot;Explore all&quot; link
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Link to shop page in the section header
              </p>
            </div>
            <Switch
              id="show-explore"
              checked={showExploreAll}
              onCheckedChange={setShowExploreAll}
            />
          </div>

          {showExploreAll && (
            <div className="space-y-4 pl-2 border-l-2 border-muted">
              <div className="space-y-2">
                <Label htmlFor="explore-label">Link label</Label>
                <Input
                  id="explore-label"
                  value={exploreAllLabel}
                  onChange={(e) => setExploreAllLabel(e.target.value)}
                  placeholder="Explore all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="explore-link">Link URL</Label>
                <Input
                  id="explore-link"
                  value={exploreAllLink}
                  onChange={(e) => setExploreAllLink(e.target.value)}
                  placeholder="/shop"
                />
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Label>Category order</Label>
            <p className="text-xs text-muted-foreground">
              Reorder category cards. Changes apply on the frontend.
            </p>
            {categoriesLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading categories…
              </div>
            ) : displayOrder.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No categories to display</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto rounded border p-2">
                {displayOrder.map((id, index) => {
                  const cat = processedCategories.find((c) => c._id === id);
                  if (!cat) return null;
                  return (
                    <div
                      key={cat._id}
                      className="flex items-center gap-2 rounded bg-muted/50 px-3 py-2 text-sm"
                    >
                      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate font-medium">
                        {cat.parent}
                        {cat.children?.length ? ` (${cat.children.join(', ')})` : ''}
                      </span>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMoveCategory(index, 'up')}
                          disabled={index === 0}
                          aria-label="Move up"
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMoveCategory(index, 'down')}
                          disabled={index === displayOrder.length - 1}
                          aria-label="Move down"
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {onActiveChange && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <Label htmlFor="category-showcase-active" className="cursor-pointer">
            Active (section visible on frontend)
          </Label>
          <Switch
            id="category-showcase-active"
            checked={isActive}
            onCheckedChange={handleActiveChange}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
