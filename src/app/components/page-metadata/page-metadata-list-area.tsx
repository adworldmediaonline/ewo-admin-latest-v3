'use client';

import React, { useState } from 'react';
import { useGetAllPageMetadataQuery } from '@/redux/page-metadata/pageMetadataApi';
import type { PageMetadata } from '@/types/page-metadata-type';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, FileText } from 'lucide-react';
import { PageMetadataEditForm } from './page-metadata-edit-form';

const PageMetadataListArea = () => {
  const { data, isLoading, isError } = useGetAllPageMetadataQuery();
  const [editPage, setEditPage] = useState<PageMetadata | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleEdit = (page: PageMetadata) => {
    setEditPage(page);
    setSheetOpen(true);
  };

  const handleCloseSheet = (open: boolean) => {
    if (!open) {
      setEditPage(null);
    }
    setSheetOpen(open);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading page metadata</p>
      </div>
    );
  }

  const pages = data.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Page Metadata (SEO)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage meta title, description, and keywords for each page
        </p>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No pages configured
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Page metadata will appear here once configured
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <Card key={page.slug} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {page.displayName || page.slug}
                      </h3>
                      <Badge variant={page.isActive !== false ? 'default' : 'secondary'}>
                        {page.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      /{page.slug}
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm text-foreground truncate" title={page.metaTitle ?? undefined}>
                        {page.metaTitle || (
                          <span className="italic text-muted-foreground">No title set</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2" title={page.metaDescription ?? undefined}>
                        {page.metaDescription || (
                          <span className="italic">No description set</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(page)}
                    aria-label={`Edit metadata for ${page.displayName || page.slug}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PageMetadataEditForm
        page={editPage}
        open={sheetOpen}
        onOpenChange={handleCloseSheet}
      />
    </div>
  );
};

export default PageMetadataListArea;
