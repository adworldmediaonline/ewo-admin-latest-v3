'use client';

import React from 'react';
import type { Tag } from 'react-tag-input';
import type { ImageWithMeta } from '@/types/image-with-meta';
import { ImageUploadWithMeta } from '@/components/image-upload-with-meta/image-upload-with-meta';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LayoutGrid, Plus, Trash2 } from 'lucide-react';
export interface ShowcaseGroup {
  children: string[];
  image?: ImageWithMeta | null;
}

interface CategoryShowcaseGroupsProps {
  categoryChildren: Tag[];
  showcaseGroups: ShowcaseGroup[];
  onChange: (groups: ShowcaseGroup[]) => void;
}

export const CategoryShowcaseGroups = ({
  categoryChildren,
  showcaseGroups,
  onChange,
}: CategoryShowcaseGroupsProps) => {
  const childNames = categoryChildren
    .map((t) => t.text?.trim())
    .filter(Boolean);

  const handleAddGroup = () => {
    onChange([...showcaseGroups, { children: [], image: null }]);
  };

  const handleRemoveGroup = (index: number) => {
    onChange(showcaseGroups.filter((_, i) => i !== index));
  };

  const handleGroupChildrenChange = (index: number, selected: string[]) => {
    const next = [...showcaseGroups];
    next[index] = { ...next[index], children: selected };
    onChange(next);
  };

  const handleGroupImageChange = (index: number, image: ImageWithMeta | null) => {
    const next = [...showcaseGroups];
    next[index] = { ...next[index], image: image ?? undefined };
    onChange(next);
  };

  const toggleChildInGroup = (groupIndex: number, childName: string) => {
    const group = showcaseGroups[groupIndex];
    const current = group.children || [];
    const isIn = current.includes(childName);
    const next = isIn
      ? current.filter((c) => c !== childName)
      : [...current, childName];
    handleGroupChildrenChange(groupIndex, next);
  };

  return (
    <Card className="shadow-card hover:shadow-card-lg transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <LayoutGrid className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg font-semibold">
              Category Showcase
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure how subcategories appear on the homepage. Each group
              becomes one card. Separate cards need a custom image.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {childNames.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add sub-categories above first, then configure showcase groups.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Showcase groups</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddGroup}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add group
              </Button>
            </div>

            {showcaseGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 border rounded-lg px-4 bg-muted/30">
                No groups configured. All subcategories will appear in one card
                (default). Click &quot;Add group&quot; to customize.
              </p>
            ) : (
              <div className="space-y-4">
                {showcaseGroups.map((group, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border p-4 space-y-4 bg-muted/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Group {idx + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveGroup(idx)}
                        aria-label="Remove group"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Subcategories in this card</Label>
                      <div className="flex flex-wrap gap-2">
                        {childNames.map((name) => {
                          const isChecked = (group.children || []).includes(
                            name
                          );
                          return (
                            <label
                              key={name}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() =>
                                  toggleChildInGroup(idx, name)
                                }
                              />
                              <span className="text-sm">{name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">
                        Card image
                        {(group.children?.length ?? 0) === 1 && (
                          <span className="text-amber-600 ml-1">
                            (required for separate card)
                          </span>
                        )}
                      </Label>
                      <ImageUploadWithMeta
                        value={group.image ?? null}
                        onChange={(v) => handleGroupImageChange(idx, v)}
                        folder="ewo-assets/categories"
                      />
                      {(group.children?.length ?? 0) > 1 && (
                        <p className="text-xs text-muted-foreground">
                          Leave empty to use the parent category image
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
