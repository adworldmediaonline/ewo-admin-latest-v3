'use client';

import React, { useState, useEffect } from 'react';
import { useUpsertPageMetadataMutation } from '@/redux/page-metadata/pageMetadataApi';
import type { PageMetadata, PageMetadataUpsertPayload } from '@/types/page-metadata-type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Loader2, Save } from 'lucide-react';
import { notifyError, notifySuccess } from '@/utils/toast';

const META_TITLE_MAX = 70;
const META_DESC_MAX = 320;

interface PageMetadataEditFormProps {
  page: PageMetadata | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PageMetadataEditForm = ({
  page,
  open,
  onOpenChange,
}: PageMetadataEditFormProps) => {
  const [upsertMetadata, { isLoading }] = useUpsertPageMetadataMutation();
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (page) {
      setMetaTitle(page.metaTitle ?? '');
      setMetaDescription(page.metaDescription ?? '');
      setMetaKeywords(page.metaKeywords ?? '');
      setCanonicalUrl(page.canonicalUrl ?? '');
      setOgImage(page.ogImage ?? '');
      setIsActive(page.isActive ?? true);
    }
  }, [page, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page?.slug) return;

    const payload: PageMetadataUpsertPayload = {
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      metaKeywords: metaKeywords.trim() || undefined,
      canonicalUrl: canonicalUrl.trim() || undefined,
      ogImage: ogImage.trim() || undefined,
      isActive,
    };

    try {
      const res = await upsertMetadata({ slug: page.slug, data: payload });
      if ('data' in res && res.data?.success) {
        notifySuccess('Page metadata updated successfully');
        onOpenChange(false);
      } else {
        notifyError('Failed to update metadata');
      }
    } catch {
      notifyError('Failed to update metadata');
    }
  };

  const titleCount = metaTitle.length;
  const descCount = metaDescription.length;
  const titleOk = titleCount <= META_TITLE_MAX;
  const descOk = descCount <= META_DESC_MAX;

  if (!page) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
        aria-label={`Edit metadata for ${page.displayName || page.slug}`}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>
              Edit SEO — {page.displayName || page.slug}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              slug: {page.slug}
            </p>
          </SheetHeader>

          <div className="flex-1 space-y-6 py-6 px-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Page title for search engines"
                maxLength={META_TITLE_MAX + 20}
                className={titleCount > META_TITLE_MAX ? 'border-destructive' : ''}
              />
              <p
                className={`text-xs ${titleOk ? 'text-muted-foreground' : 'text-destructive'}`}
              >
                {titleCount}/{META_TITLE_MAX} characters (recommended)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief description for search results"
                rows={4}
                maxLength={META_DESC_MAX + 50}
                className={descCount > META_DESC_MAX ? 'border-destructive' : ''}
              />
              <p
                className={`text-xs ${descOk ? 'text-muted-foreground' : 'text-destructive'}`}
              >
                {descCount}/{META_DESC_MAX} characters (recommended)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input
                id="metaKeywords"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="Comma-separated keywords"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="canonicalUrl">Canonical URL</Label>
              <Input
                id="canonicalUrl"
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://example.com/page"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ogImage">OG Image URL</Label>
              <Input
                id="ogImage"
                type="url"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://example.com/og-image.jpg"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (metadata applied on frontend)
              </Label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <SheetFooter className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
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
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
