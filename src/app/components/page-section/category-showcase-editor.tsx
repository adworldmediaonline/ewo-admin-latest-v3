'use client';

import React, { useEffect, useState } from 'react';
import type { CategoryShowcaseContent } from '@/types/page-section-type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Save, LayoutGrid } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (content) {
      setHeading(content.heading ?? DEFAULT_HEADING);
      setShowExploreAll(content.showExploreAll ?? true);
      setExploreAllLink(content.exploreAllLink ?? DEFAULT_EXPLORE_LINK);
      setExploreAllLabel(content.exploreAllLabel ?? DEFAULT_EXPLORE_LABEL);
    }
  }, [content]);

  const buildPayloadFromFormState = (): CategoryShowcaseContent => ({
    heading: heading.trim() || DEFAULT_HEADING,
    showExploreAll,
    exploreAllLink: exploreAllLink.trim() || DEFAULT_EXPLORE_LINK,
    exploreAllLabel: exploreAllLabel.trim() || DEFAULT_EXPLORE_LABEL,
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
