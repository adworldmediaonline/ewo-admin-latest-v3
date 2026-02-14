'use client';

import { Image } from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';

/**
 * Extends the Image extension with float (left/right) and floatWidth attributes
 * for text-wrap layouts. When float is left or right, text wraps around the image.
 */
export const ImageWithFloat = Image.extend({
  name: 'image',

  addAttributes() {
    const self = this as unknown as { parent?: () => Record<string, unknown> };
    const parentAttrs = typeof self.parent === 'function' ? self.parent() : {};
    return {
      ...parentAttrs,
      float: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-float') ||
          (element.style?.float && element.style.float !== 'none'
            ? element.style.float
            : null),
        renderHTML: () => ({}),
      },
      floatWidth: {
        default: '40%',
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-float-width') || '40%',
        renderHTML: () => ({}),
      },
    };
  },

  renderHTML({
    node,
    HTMLAttributes,
  }: {
    node: { attrs: { float?: string | null; floatWidth?: string } };
    HTMLAttributes: Record<string, unknown>;
  }) {
    const { float, floatWidth } = node.attrs;
    const baseClass = 'rounded-lg max-w-full h-auto';
    const width = floatWidth || '40%';

    const extra: Record<string, string> = {};
    if (float === 'left') {
      extra['data-float'] = 'left';
      extra['data-float-width'] = width;
      extra.class = `${baseClass} more-details-img-float-left`;
      extra.style = `max-width: ${width};`;
    } else if (float === 'right') {
      extra['data-float'] = 'right';
      extra['data-float-width'] = width;
      extra.class = `${baseClass} more-details-img-float-right`;
      extra.style = `max-width: ${width};`;
    } else {
      extra.class = baseClass;
    }

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, extra),
    ];
  },
});

export default ImageWithFloat;
