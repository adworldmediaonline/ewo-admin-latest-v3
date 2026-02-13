/**
 * Preset options for banner content styling.
 * Maps user-friendly labels to Tailwind classes.
 */

export const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left', classes: 'text-left' },
  { value: 'center', label: 'Center', classes: 'text-center' },
  { value: 'right', label: 'Right', classes: 'text-right' },
] as const;

export const TITLE_FONT_SIZE_OPTIONS = [
  { value: 'default', label: 'Default', classes: '' },
  { value: 'sm', label: 'Small', classes: 'text-lg' },
  { value: 'md', label: 'Medium', classes: 'text-xl sm:text-2xl' },
  { value: 'lg', label: 'Large', classes: 'text-2xl sm:text-3xl md:text-4xl' },
] as const;

export const DESC_FONT_SIZE_OPTIONS = [
  { value: 'default', label: 'Default', classes: '' },
  { value: 'xs', label: 'Small', classes: 'text-xs sm:text-sm' },
  { value: 'md', label: 'Medium', classes: 'text-sm sm:text-base' },
  { value: 'lg', label: 'Large', classes: 'text-base sm:text-lg' },
] as const;

export const FONT_WEIGHT_OPTIONS = [
  { value: 'normal', label: 'Normal', classes: 'font-normal' },
  { value: 'medium', label: 'Medium', classes: 'font-medium' },
  { value: 'semibold', label: 'Semibold', classes: 'font-semibold' },
  { value: 'bold', label: 'Bold', classes: 'font-bold' },
] as const;

export const SPACING_OPTIONS = [
  { value: 'none', label: 'None', classes: '' },
  { value: 'tight', label: 'Tight', classes: 'mt-1 mb-1' },
  { value: 'normal', label: 'Normal', classes: 'mt-2 mb-2' },
  { value: 'relaxed', label: 'Relaxed', classes: 'mt-4 mb-4' },
  { value: 'loose', label: 'Loose', classes: 'mt-6 mb-6' },
] as const;

export const COLOR_OPTIONS = [
  { value: 'default', label: 'Default', classes: 'text-foreground' },
  { value: 'muted', label: 'Muted', classes: 'text-muted-foreground' },
  { value: 'primary', label: 'Primary', classes: 'text-primary' },
  { value: 'secondary', label: 'Secondary', classes: 'text-secondary-foreground' },
  { value: 'accent', label: 'Accent', classes: 'text-accent-foreground' },
] as const;

export type AlignmentValue = (typeof ALIGNMENT_OPTIONS)[number]['value'];
export type TitleFontSizeValue = (typeof TITLE_FONT_SIZE_OPTIONS)[number]['value'];
export type DescFontSizeValue = (typeof DESC_FONT_SIZE_OPTIONS)[number]['value'];
export type FontWeightValue = (typeof FONT_WEIGHT_OPTIONS)[number]['value'];
export type SpacingValue = (typeof SPACING_OPTIONS)[number]['value'];
export type ColorValue = (typeof COLOR_OPTIONS)[number]['value'];

export interface BannerStyleOptions {
  alignment?: AlignmentValue;
  fontSize?: TitleFontSizeValue | DescFontSizeValue;
  fontWeight?: FontWeightValue;
  spacing?: SpacingValue;
  color?: ColorValue;
}

/** Build Tailwind class string from style options */
export const buildClassesFromOptions = (
  options: BannerStyleOptions,
  isTitle: boolean
): string => {
  const parts: string[] = [];
  const alignment = ALIGNMENT_OPTIONS.find((o) => o.value === options.alignment);
  const fontSize = isTitle
    ? TITLE_FONT_SIZE_OPTIONS.find((o) => o.value === options.fontSize)
    : DESC_FONT_SIZE_OPTIONS.find((o) => o.value === options.fontSize);
  const fontWeight = FONT_WEIGHT_OPTIONS.find(
    (o) => o.value === options.fontWeight
  );
  const spacing = SPACING_OPTIONS.find((o) => o.value === options.spacing);
  const color = COLOR_OPTIONS.find((o) => o.value === options.color);

  if (alignment?.classes) parts.push(alignment.classes);
  if (fontSize?.classes) parts.push(fontSize.classes);
  if (fontWeight?.classes) parts.push(fontWeight.classes);
  if (spacing?.classes) parts.push(spacing.classes);
  if (color?.classes) parts.push(color.classes);

  return parts.filter(Boolean).join(' ') || 'text-center';
};

/** Parse Tailwind class string back to options (best-effort) */
export const parseClassesToOptions = (
  classStr: string,
  isTitle: boolean
): BannerStyleOptions => {
  const options: BannerStyleOptions = {};
  const tokens = new Set((classStr || '').trim().split(/\s+/).filter(Boolean));

  const align = ALIGNMENT_OPTIONS.find((o) => o.classes && tokens.has(o.classes));
  if (align) options.alignment = align.value;

  const fw = FONT_WEIGHT_OPTIONS.find((o) => o.classes && tokens.has(o.classes));
  if (fw) options.fontWeight = fw.value;

  const space = SPACING_OPTIONS.find((o) => {
    const parts = o.classes.trim().split(/\s+/).filter(Boolean);
    return parts.length > 0 && parts.every((p) => tokens.has(p));
  });
  if (space) options.spacing = space.value;

  const col = COLOR_OPTIONS.find((o) => o.classes && tokens.has(o.classes));
  if (col) options.color = col.value;

  const fsTitle = TITLE_FONT_SIZE_OPTIONS.find((o) =>
    o.classes
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .some((c) => tokens.has(c))
  );
  const fsDesc = DESC_FONT_SIZE_OPTIONS.find((o) =>
    o.classes
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .some((c) => tokens.has(c))
  );
  if (isTitle && fsTitle) options.fontSize = fsTitle.value;
  else if (!isTitle && fsDesc) options.fontSize = fsDesc.value;

  if (!options.alignment && (classStr?.includes('text-center') || !classStr)) {
    options.alignment = 'center';
  }

  return options;
};
