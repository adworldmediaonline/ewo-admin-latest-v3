'use client';

import React, { useEffect, useState } from 'react';
import type {
  CustomBlock,
  CustomBlockType,
  CustomColumnItem,
  CustomSectionContent,
  CustomSectionLayout,
  HeadingLevel,
} from '@/types/page-section-type';
import { HEADING_LEVELS } from '@/types/page-section-type';
import type { ImageWithMeta } from '@/types/image-with-meta';
import { ImageUploadWithMeta } from '@/components/image-upload-with-meta/image-upload-with-meta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Tiptap from '@/components/tipTap/Tiptap';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Save, Plus, Trash2, GripVertical, MoveUp, MoveDown } from 'lucide-react';
import { notifyError, notifySuccess } from '@/utils/toast';

const BLOCK_TYPES: { value: CustomBlockType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'button', label: 'Button' },
  { value: 'spacer', label: 'Spacer' },
  { value: 'columns', label: 'Columns' },
  { value: 'video', label: 'Video embed' },
];

const generateBlockId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createEmptyBlock = (type: CustomBlockType): CustomBlock => {
  const id = generateBlockId();
  switch (type) {
    case 'text':
      return { id, type: 'text', heading: '', headingLevel: 'h2', body: '' };
    case 'image':
      return { id, type: 'image' };
    case 'button':
      return { id, type: 'button', text: '', link: '' };
    case 'spacer':
      return { id, type: 'spacer', height: 24 };
    case 'columns':
      return {
        id,
        type: 'columns',
        columnCount: 2,
        items: [
          { heading: '', headingLevel: 'h3', body: '' },
          { heading: '', headingLevel: 'h3', body: '' },
        ],
      };
    case 'video':
      return { id, type: 'video', url: '' };
    default:
      return { id, type: 'text', heading: '', headingLevel: 'h2', body: '' };
  }
};

interface CustomSectionEditorProps {
  content: CustomSectionContent | null;
  onSave: (content: CustomSectionContent) => Promise<void>;
  onCancel: () => void;
  isActive?: boolean;
  onActiveChange?: (active: boolean, getCurrentContent: () => CustomSectionContent) => void | Promise<void>;
}

export const CustomSectionEditor = ({
  content,
  onSave,
  onCancel,
  isActive = true,
  onActiveChange,
}: CustomSectionEditorProps) => {
  const [layout, setLayout] = useState<CustomSectionLayout>({
    width: 'contained',
    backgroundColor: '',
  });
  const [blocks, setBlocks] = useState<CustomBlock[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (content) {
      setLayout(content.layout ?? { width: 'contained', backgroundColor: '' });
      setBlocks(content.blocks ?? []);
    }
  }, [content]);

  const buildPayloadFromFormState = (): CustomSectionContent => ({
    layout,
    blocks,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(buildPayloadFromFormState());
      notifySuccess('Custom section saved');
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

  const handleAddBlock = (type: CustomBlockType) => {
    setBlocks((prev) => [...prev, createEmptyBlock(type)]);
  };

  const handleRemoveBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    setBlocks((prev) => {
      const copy = [...prev];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy;
    });
  };

  const handleBlockChange = (index: number, block: CustomBlock) => {
    setBlocks((prev) => {
      const copy = [...prev];
      copy[index] = block;
      return copy;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-4">
      <Card className="border-muted">
        <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
          <h3 className="text-sm font-semibold">Layout</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Section width and background
          </p>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-6 sm:px-6">
          <div className="space-y-2">
            <Label>Width</Label>
            <Select
              value={layout.width ?? 'contained'}
              onValueChange={(v) => setLayout((prev) => ({ ...prev, width: v as 'full' | 'contained' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full width</SelectItem>
                <SelectItem value="contained">Contained</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bg-color">Background color</Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={layout.backgroundColor ?? '#ffffff'}
                onChange={(e) => setLayout((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                className="h-10 w-14 p-1 cursor-pointer"
              />
              <Input
                value={layout.backgroundColor ?? ''}
                onChange={(e) => setLayout((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                placeholder="#ffffff or tailwind class"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Blocks</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Add and arrange content blocks
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {BLOCK_TYPES.map(({ value, label }) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock(value)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-6 sm:px-6">
          {blocks.length === 0 ? (
            <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
              No blocks yet. Add a block above to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {blocks.map((block, index) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  index={index}
                  total={blocks.length}
                  onChange={(b) => handleBlockChange(index, b)}
                  onRemove={() => handleRemoveBlock(index)}
                  onMoveUp={() => handleMoveBlock(index, 'up')}
                  onMoveDown={() => handleMoveBlock(index, 'down')}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {onActiveChange && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <Label htmlFor="custom-active" className="cursor-pointer">
            Active (section visible on frontend)
          </Label>
          <Switch
            id="custom-active"
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

interface ColumnsBlockEditorProps {
  block: Extract<CustomBlock, { type: 'columns' }>;
  onChange: (block: Extract<CustomBlock, { type: 'columns' }>) => void;
}

const ColumnsBlockEditor = ({ block, onChange }: ColumnsBlockEditorProps) => {
  const columnCount = block.columnCount ?? 2;
  const items = block.items ?? [];

  const handleColumnCountChange = (count: 2 | 3 | 4) => {
    const newItems: CustomColumnItem[] = Array.from({ length: count }, (_, i) =>
      items[i] ?? { heading: '', headingLevel: 'h3', body: '' }
    );
    onChange({ ...block, columnCount: count, items: newItems });
  };

  const handleItemChange = (index: number, item: CustomColumnItem) => {
    const padded = Array.from({ length: columnCount }, (_, i) =>
      items[i] ?? { heading: '', headingLevel: 'h3', body: '' }
    );
    const newItems = [...padded];
    newItems[index] = item;
    onChange({ ...block, items: newItems });
  };

  const displayItems = Array.from({ length: columnCount }, (_, i) =>
    items[i] ?? { heading: '', headingLevel: 'h3', body: '' }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Column count</Label>
        <Select
          value={String(columnCount)}
          onValueChange={(v) => handleColumnCountChange(Number(v) as 2 | 3 | 4)}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        {displayItems.map((item, i) => (
          <div key={i} className="rounded border p-3 space-y-2">
            <span className="text-sm font-medium">Column {i + 1}</span>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Heading</Label>
                <Input
                  placeholder="Heading"
                  value={item.heading ?? ''}
                  onChange={(e) => handleItemChange(i, { ...item, heading: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Level</Label>
                <Select
                  value={item.headingLevel ?? 'h3'}
                  onValueChange={(v) =>
                    handleItemChange(i, { ...item, headingLevel: v as HeadingLevel })
                  }
                >
                  <SelectTrigger className="w-full sm:w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HEADING_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Tiptap
              value={item.body ?? ''}
              onChange={(html) => handleItemChange(i, { ...item, body: html })}
              placeholder="Add body text with formatting..."
              limit={5000}
              showCharacterCount={false}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface BlockEditorProps {
  block: CustomBlock;
  index: number;
  total: number;
  onChange: (block: CustomBlock) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const BlockEditor = ({
  block,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: BlockEditorProps) => {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium capitalize">{block.type}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label="Move up"
          >
            <MoveUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label="Move down"
          >
            <MoveDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            aria-label="Remove block"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`block-classes-${block.id}`}>Tailwind classes</Label>
        <Input
          id={`block-classes-${block.id}`}
          placeholder="e.g. text-center, flex justify-center"
          value={block.className ?? ''}
          onChange={(e) => onChange({ ...block, className: e.target.value.trim() || undefined })}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Add Tailwind utilities (space-separated): text-center, flex, justify-center, mx-auto, etc.
        </p>
      </div>

      {block.type === 'text' && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input
                placeholder="Heading"
                value={block.heading ?? ''}
                onChange={(e) => onChange({ ...block, heading: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Heading level</Label>
              <Select
                value={block.headingLevel ?? 'h2'}
                onValueChange={(v) =>
                  onChange({ ...block, headingLevel: v as HeadingLevel })
                }
              >
                <SelectTrigger className="w-full sm:w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HEADING_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Label>Body text</Label>
          <Tiptap
            value={block.body ?? ''}
            onChange={(html) => onChange({ ...block, body: html })}
            placeholder="Add body text with formatting (bold, lists, links...)"
            limit={10000}
            showCharacterCount={false}
          />
        </div>
      )}

      {block.type === 'image' && (
        <ImageUploadWithMeta
          value={block.image?.url ? block.image : null}
          onChange={(img) => onChange({ ...block, image: img ?? undefined })}
          folder="ewo-assets/custom"
        />
      )}

      {block.type === 'button' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Button text</Label>
            <Input
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
              placeholder="Learn more"
            />
          </div>
          <div className="space-y-2">
            <Label>Link</Label>
            <Input
              value={block.link}
              onChange={(e) => onChange({ ...block, link: e.target.value })}
              placeholder="/shop"
            />
          </div>
        </div>
      )}

      {block.type === 'spacer' && (
        <div className="space-y-2">
          <Label>Height (px)</Label>
          <Input
            type="number"
            min={8}
            max={200}
            value={block.height ?? 24}
            onChange={(e) => onChange({ ...block, height: parseInt(e.target.value, 10) || 24 })}
          />
        </div>
      )}

      {block.type === 'columns' && (
        <ColumnsBlockEditor
          block={block}
          onChange={(b) => onChange(b as CustomBlock)}
        />
      )}

      {block.type === 'video' && (
        <div className="space-y-2">
          <Label htmlFor={`video-url-${block.id}`}>Video URL</Label>
          <Input
            id={`video-url-${block.id}`}
            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/... or direct video URL"
            value={block.url}
            onChange={(e) => onChange({ ...block, url: e.target.value })}
          />
          <Label htmlFor={`video-title-${block.id}`}>Title (for accessibility)</Label>
          <Input
            id={`video-title-${block.id}`}
            placeholder="Video description"
            value={block.title ?? ''}
            onChange={(e) => onChange({ ...block, title: e.target.value.trim() || undefined })}
          />
        </div>
      )}
    </div>
  );
};
