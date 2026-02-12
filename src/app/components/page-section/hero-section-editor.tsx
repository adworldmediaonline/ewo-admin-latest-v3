'use client';

import React, { useEffect, useState } from 'react';
import type { HeroSectionContent, HeroVariant } from '@/types/page-section-type';
import type { ImageWithMeta } from '@/types/image-with-meta';
import { ImageUploadWithMeta } from '@/components/image-upload-with-meta/image-upload-with-meta';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { notifyError, notifySuccess } from '@/utils/toast';

const HERO_VARIANTS: { value: HeroVariant; label: string }[] = [
  { value: 'image_only', label: 'Image only' },
  { value: 'image_content', label: 'Image + content' },
  { value: 'content_only', label: 'Content only' },
];

interface HeroSectionEditorProps {
  content: HeroSectionContent | null;
  onSave: (content: HeroSectionContent) => Promise<void>;
  onCancel: () => void;
  isActive?: boolean;
  onActiveChange?: (active: boolean) => void;
}

export const HeroSectionEditor = ({
  content,
  onSave,
  onCancel,
  isActive = true,
  onActiveChange,
}: HeroSectionEditorProps) => {
  const [variant, setVariant] = useState<HeroVariant>('image_content');
  const [image, setImage] = useState<ImageWithMeta | null>(null);
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [smallSubDescription, setSmallSubDescription] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (content) {
      setVariant(content.variant ?? 'image_content');
      setImage(content.image ?? null);
      setHeading(content.heading ?? '');
      setDescription(content.description ?? '');
      setSmallSubDescription(content.smallSubDescription ?? '');
      setCtaText(content.cta?.text ?? '');
      setCtaLink(content.cta?.link ?? '');
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload: HeroSectionContent = {
      variant,
      heading: heading.trim() || undefined,
      description: description.trim() || undefined,
      smallSubDescription: smallSubDescription.trim() || undefined,
      cta: ctaText.trim() || ctaLink.trim()
        ? { text: ctaText.trim(), link: ctaLink.trim() }
        : undefined,
    };

    if (variant !== 'content_only' && image) {
      payload.image = image;
    }

    try {
      await onSave(payload);
      notifySuccess('Hero section saved');
    } catch {
      notifyError('Failed to save hero section');
    } finally {
      setIsSaving(false);
    }
  };

  const showImage = variant === 'image_only' || variant === 'image_content';
  const showContent = variant === 'image_content' || variant === 'content_only';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Hero variant</Label>
        <Select
          value={variant}
          onValueChange={(v) => setVariant(v as HeroVariant)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HERO_VARIANTS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose how the hero displays: image only, image with content, or content only
        </p>
      </div>

      {showImage && (
        <div className="space-y-2">
          <Label>Hero image</Label>
          <ImageUploadWithMeta
            value={image}
            onChange={setImage}
            folder="ewo-assets/heros"
          />
          <p className="text-xs text-muted-foreground">
            File name, title, and alt text are managed together for all images
          </p>
        </div>
      )}

      {showContent && (
        <>
          <div className="space-y-2">
            <Label htmlFor="hero-heading">Heading</Label>
            <Input
              id="hero-heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Main heading"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-description">Description</Label>
            <Textarea
              id="hero-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Main description"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-small">Small sub-description</Label>
            <Input
              id="hero-small"
              value={smallSubDescription}
              onChange={(e) => setSmallSubDescription(e.target.value)}
              placeholder="Optional secondary text"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hero-cta-text">CTA text</Label>
              <Input
                id="hero-cta-text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Learn more"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-cta-link">CTA link</Label>
              <Input
                id="hero-cta-link"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="/shop"
              />
            </div>
          </div>
        </>
      )}

      {onActiveChange && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <Label htmlFor="hero-active" className="cursor-pointer">
            Active (section visible on frontend)
          </Label>
          <Switch
            id="hero-active"
            checked={isActive}
            onCheckedChange={onActiveChange}
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
