'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, GripVertical, Image } from 'lucide-react';
import type { PageSection } from '@/types/page-section-type';
import type { HeroSectionContent, CategoryShowcaseContent } from '@/types/page-section-type';

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  category_showcase: 'Category Showcase',
  text_block: 'Text Block',
  features: 'Features',
  cta: 'Call to Action',
  gallery: 'Gallery',
  custom: 'Custom',
};

interface SortableSectionCardProps {
  section: PageSection;
  onEdit: (section: PageSection) => void;
  onDelete: (section: PageSection) => void;
}

/** Static card for DragOverlay – same visual, no sortable hook */
export const SectionCardPreview = ({ section }: { section: PageSection }) => (
  <Card className="overflow-hidden shadow-xl ring-2 ring-primary/20 cursor-grabbing">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 rounded p-1.5 text-muted-foreground">
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
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
          {section.sectionType === 'custom' && (
            <div className="text-sm text-muted-foreground">
              {(section.content as { blocks?: unknown[] })?.blocks?.length ?? 0} block(s)
            </div>
          )}
          {section.sectionType === 'category_showcase' && (
            <div className="text-sm text-muted-foreground">
              {(section.content as CategoryShowcaseContent)?.heading ?? 'Shop by Category'}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const SortableSectionCard = ({
  section,
  onEdit,
  onDelete,
}: SortableSectionCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden transition-shadow ${isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className="flex shrink-0 cursor-grab touch-none rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
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
            {section.sectionType === 'custom' && (
              <div className="text-sm text-muted-foreground">
                {(section.content as { blocks?: unknown[] })?.blocks?.length ?? 0} block(s)
              </div>
            )}
            {section.sectionType === 'category_showcase' && (
              <div className="text-sm text-muted-foreground">
                {(section.content as CategoryShowcaseContent)?.heading ?? 'Shop by Category'}
              </div>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(section)}
              aria-label={`Edit section ${section.sectionKey}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(section)}
              aria-label={`Delete section ${section.sectionKey}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
