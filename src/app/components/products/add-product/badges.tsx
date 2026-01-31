'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Predefined badge options
const BADGE_OPTIONS = [
  'New',
  'Sale',
  'Hot',
  'Featured',
  'Best Seller',
  'Limited Edition',
  'Popular',
  'Trending',
  'Special Offer',
  'Clearance',
  '10 BOLT',
  'DANA 44',
];

type IPropType = {
  badges: string[];
  setBadges: React.Dispatch<React.SetStateAction<string[]>>;
  default_value?: string[];
};

const Badges = ({ badges, setBadges, default_value }: IPropType) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (default_value !== undefined) {
      setBadges(default_value);
    }
  }, [default_value, setBadges]);

  const handleToggleBadge = (badge: string) => {
    if (badges.includes(badge)) {
      setBadges(badges.filter(b => b !== badge));
    } else {
      setBadges([...badges, badge]);
    }
  };

  const handleRemoveBadge = (badge: string) => {
    setBadges(badges.filter(b => b !== badge));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md bg-background">
        {badges.length === 0 ? (
          <span className="text-sm text-muted-foreground flex items-center">
            No badges selected
          </span>
        ) : (
          badges.map(badge => (
            <Badge
              key={badge}
              variant="secondary"
              className="flex items-center gap-1.5 pr-1.5"
            >
              <span>{badge}</span>
              <button
                type="button"
                onClick={() => handleRemoveBadge(badge)}
                className="ml-1 rounded-full hover:bg-secondary-foreground/20 p-0.5 transition-colors"
                aria-label={`Remove ${badge} badge`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            aria-label="Select badges"
          >
            <span>Select Badges</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                open && 'transform rotate-180'
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2">
            <div className="text-sm font-medium mb-2 px-2 py-1.5">
              Available Badges
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {BADGE_OPTIONS.map(badge => {
                const isSelected = badges.includes(badge);
                return (
                  <label
                    key={badge}
                    className="flex items-center gap-2 px-2 py-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleBadge(badge)}
                      aria-label={`Toggle ${badge} badge`}
                    />
                    <span className="text-sm flex-1">{badge}</span>
                  </label>
                );
              })}
            </div>
            {badges.length > 0 && (
              <div className="border-t mt-2 pt-2 px-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setBadges([]);
                    setOpen(false);
                  }}
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <p className="text-xs text-muted-foreground">
        Select one or more badges to display on the product
      </p>
    </div>
  );
};

export default Badges;
