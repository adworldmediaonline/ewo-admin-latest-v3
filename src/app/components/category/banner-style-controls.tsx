'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import {
  ALIGNMENT_OPTIONS,
  TITLE_FONT_SIZE_OPTIONS,
  DESC_FONT_SIZE_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  SPACING_OPTIONS,
  COLOR_OPTIONS,
  buildClassesFromOptions,
  parseClassesToOptions,
  type BannerStyleOptions,
  type AlignmentValue,
  type TitleFontSizeValue,
  type DescFontSizeValue,
  type FontWeightValue,
  type SpacingValue,
  type ColorValue,
} from './banner-style-constants';

interface BannerStyleControlsProps {
  /** Current Tailwind class string (stored value) */
  value: string;
  onChange: (classes: string) => void;
  /** 'title' uses larger font size presets, 'description' uses smaller */
  variant: 'title' | 'description';
  disabled?: boolean;
  /** Optional label override */
  label?: string;
}

const BannerStyleControls = ({
  value,
  onChange,
  variant,
  disabled = false,
  label,
}: BannerStyleControlsProps) => {
  const isTitle = variant === 'title';
  const options = parseClassesToOptions(value, isTitle);

  const fontSizeOptions = isTitle ? TITLE_FONT_SIZE_OPTIONS : DESC_FONT_SIZE_OPTIONS;

  const updateOption = <K extends keyof BannerStyleOptions>(
    key: K,
    val: BannerStyleOptions[K]
  ) => {
    const next = { ...options, [key]: val };
    onChange(buildClassesFromOptions(next, isTitle));
  };

  const sectionLabel = label ?? (isTitle ? 'Title styling' : 'Description styling');

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{sectionLabel}</Label>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Text alignment - ToggleGroup */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Alignment</Label>
          <ToggleGroup
            type="single"
            value={options.alignment ?? 'center'}
            onValueChange={(v) => v && updateOption('alignment', v as AlignmentValue)}
            variant="outline"
            size="sm"
            disabled={disabled}
            className="w-full justify-stretch"
          >
            <ToggleGroupItem value="left" aria-label="Align left" className="flex-1">
              <AlignLeft className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Align center" className="flex-1">
              <AlignCenter className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Align right" className="flex-1">
              <AlignRight className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Font size - Select */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Font size</Label>
          <Select
            value={options.fontSize ?? 'default'}
            onValueChange={(v) =>
              updateOption(
                'fontSize',
                v as TitleFontSizeValue | DescFontSizeValue
              )
            }
            disabled={disabled}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              {fontSizeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font weight - Select */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Font weight</Label>
          <Select
            value={options.fontWeight ?? (isTitle ? 'bold' : 'normal')}
            onValueChange={(v) =>
              updateOption('fontWeight', v as FontWeightValue)
            }
            disabled={disabled}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder={isTitle ? 'Bold' : 'Normal'} />
            </SelectTrigger>
            <SelectContent>
              {FONT_WEIGHT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Spacing - Select */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Spacing</Label>
          <Select
            value={options.spacing ?? 'normal'}
            onValueChange={(v) => updateOption('spacing', v as SpacingValue)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Normal" />
            </SelectTrigger>
            <SelectContent>
              {SPACING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Color - Select */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Color</Label>
          <Select
            value={options.color ?? 'default'}
            onValueChange={(v) => updateOption('color', v as ColorValue)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full" size="sm">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              {COLOR_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default BannerStyleControls;
