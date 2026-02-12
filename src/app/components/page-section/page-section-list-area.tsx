'use client';

import React, { useState } from 'react';
import { useGetAllPageMetadataQuery } from '@/redux/page-metadata/pageMetadataApi';
import {
  useGetSectionsByPageQuery,
  useUpsertSectionMutation,
  useDeleteSectionMutation,
} from '@/redux/page-section/pageSectionApi';
import type { PageSection } from '@/types/page-section-type';
import type { HeroSectionContent } from '@/types/page-section-type';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Plus, Trash2, Layout, Image } from 'lucide-react';
import { HeroSectionEditor } from './hero-section-editor';
import { notifyError, notifySuccess } from '@/utils/toast';

const COMMON_PAGE_SLUGS = ['home', 'shop', 'about', 'contact'];

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  text_block: 'Text Block',
  features: 'Features',
  cta: 'Call to Action',
  gallery: 'Gallery',
  custom: 'Custom',
};

const PageSectionListArea = () => {
  const { data: metadataData } = useGetAllPageMetadataQuery();
  const [selectedPageSlug, setSelectedPageSlug] = useState<string>('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newSectionKey, setNewSectionKey] = useState('');
  const [newSectionType, setNewSectionType] = useState<string>('hero');
  const [editSection, setEditSection] = useState<PageSection | null>(null);
  const [deleteSection, setDeleteSection] = useState<PageSection | null>(null);

  const pages = metadataData?.data ?? [];
  const pageSlugs = Array.from(
    new Set([
      ...COMMON_PAGE_SLUGS,
      ...pages.map((p) => p.slug).filter(Boolean),
    ])
  ).sort();

  const effectiveSlug = selectedPageSlug || pageSlugs[0] || '';

  const { data: sectionsData, isLoading } = useGetSectionsByPageQuery(
    effectiveSlug,
    { skip: !effectiveSlug }
  );

  const [upsertSection, { isLoading: isUpserting }] = useUpsertSectionMutation();
  const [deleteSectionMutation, { isLoading: isDeleting }] =
    useDeleteSectionMutation();

  const sections = sectionsData?.data ?? [];

  const handleAddSection = async () => {
    const key = newSectionKey.trim().toLowerCase().replace(/\s+/g, '_');
    if (!key || !effectiveSlug) return;

    try {
      const res = await upsertSection({
        pageSlug: effectiveSlug,
        sectionKey: key,
        data: {
          sectionType: newSectionType,
          content: newSectionType === 'hero' ? { variant: 'image_content' } : {},
          order: sections.length,
          isActive: true,
        },
      });

      if ('data' in res && res.data?.success) {
        notifySuccess('Section added');
        setAddDialogOpen(false);
        setNewSectionKey('');
        setNewSectionType('hero');
        setEditSection(res.data.data);
      } else {
        notifyError('Failed to add section');
      }
    } catch {
      notifyError('Failed to add section');
    }
  };

  const handleSaveHero = async (
    content: HeroSectionContent,
    isActive?: boolean
  ) => {
    if (!editSection) return;

    try {
      const res = await upsertSection({
        pageSlug: editSection.pageSlug,
        sectionKey: editSection.sectionKey,
        data: {
          sectionType: 'hero',
          content: content as unknown as Record<string, unknown>,
          order: editSection.order,
          isActive: isActive ?? editSection.isActive,
        },
      });

      if ('data' in res && res.data?.success) {
        notifySuccess('Section updated');
        setEditSection(res.data.data as PageSection);
      } else {
        notifyError('Failed to update section');
      }
    } catch {
      notifyError('Failed to update section');
    }
  };

  const handleDeleteSection = async () => {
    if (!deleteSection) return;

    try {
      const res = await deleteSectionMutation({
        pageSlug: deleteSection.pageSlug,
        sectionKey: deleteSection.sectionKey,
      });

      if ('data' in res && res.data?.success) {
        notifySuccess('Section deleted');
        setDeleteSection(null);
        if (editSection?._id === deleteSection._id) {
          setEditSection(null);
        }
      } else {
        notifyError('Failed to delete section');
      }
    } catch {
      notifyError('Failed to delete section');
    }
  };

  const heroContent = (editSection?.content || {}) as unknown as HeroSectionContent;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Page Sections</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage hero banners, content blocks, and more per page
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="space-y-2 min-w-[200px]">
          <Label htmlFor="page-select">Page</Label>
          <Select
            value={effectiveSlug}
            onValueChange={setSelectedPageSlug}
          >
            <SelectTrigger id="page-select">
              <SelectValue placeholder="Select page" />
            </SelectTrigger>
            <SelectContent>
              {pageSlugs.map((slug) => (
                <SelectItem key={slug} value={slug}>
                  {slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          disabled={!effectiveSlug}
          className="mt-6 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add section
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layout className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No sections yet
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Add a hero banner or other section to get started
            </p>
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section._id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground capitalize">
                        {section.sectionKey.replace(/_/g, ' ')}
                      </h3>
                      <Badge variant={section.isActive ? 'default' : 'secondary'}>
                        {section.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {SECTION_TYPE_LABELS[section.sectionType] ?? section.sectionType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Order: {section.order}
                    </p>
                    {section.sectionType === 'hero' && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        {(section.content as unknown as HeroSectionContent)?.image?.url ? (
                          <>
                            <Image className="h-4 w-4" />
                            <span>Image + content</span>
                          </>
                        ) : (
                          <span>Content only</span>
                        )}
                        {(section.content as unknown as HeroSectionContent)?.mobileImage?.url && (
                          <Badge variant="outline" className="text-xs">
                            Mobile variant
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditSection(section)}
                      aria-label={`Edit section ${section.sectionKey}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteSection(section)}
                      aria-label={`Delete section ${section.sectionKey}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add section dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add section</DialogTitle>
            <DialogDescription>
              Add a new section to {effectiveSlug || 'the selected page'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="section-key">Section key</Label>
              <Input
                id="section-key"
                value={newSectionKey}
                onChange={(e) => setNewSectionKey(e.target.value)}
                placeholder="e.g. hero, main_banner"
              />
              <p className="text-xs text-muted-foreground">
                Used for storage (e.g. hero, main_banner)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-type">Section type</Label>
              <Select value={newSectionType} onValueChange={setNewSectionType}>
                <SelectTrigger id="section-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SECTION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSection}
              disabled={!newSectionKey.trim() || isUpserting}
            >
              {isUpserting ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit section sheet */}
      <Sheet open={!!editSection} onOpenChange={(open) => !open && setEditSection(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
          aria-label={editSection ? `Edit ${editSection.sectionKey}` : undefined}
        >
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>
              Edit — {editSection?.sectionKey?.replace(/_/g, ' ')}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              Page: {editSection?.pageSlug}
            </p>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 pr-12 py-4 pb-8">
            {editSection?.sectionType === 'hero' && (
              <HeroSectionEditor
                content={heroContent}
                onSave={async (content) => {
                  await handleSaveHero(content, editSection.isActive);
                }}
                onCancel={() => setEditSection(null)}
                isActive={editSection.isActive}
                onActiveChange={async (active) => {
                  await handleSaveHero(heroContent, active);
                }}
              />
            )}
            {editSection?.sectionType !== 'hero' && (
              <p className="text-muted-foreground">
                Editor for {editSection?.sectionType} coming soon...
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteSection} onOpenChange={(open) => !open && setDeleteSection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteSection?.sectionKey}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PageSectionListArea;
