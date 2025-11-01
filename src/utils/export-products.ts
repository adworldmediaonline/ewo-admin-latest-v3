import { IProduct } from '@/types/product';

/**
 * Converts HTML string to plain text by stripping tags and decoding HTML entities
 */
export const htmlToPlainText = (html: string): string => {
  if (!html) return '';

  // Create a temporary DOM element to parse HTML
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;

  // Get text content and replace multiple whitespaces with single space
  const text = tmp.textContent || tmp.innerText || '';

  // Clean up: trim and replace multiple spaces/newlines with single space
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
};

/**
 * Formats product data and generates CSV download
 */
export const exportProductsToCSV = (products: IProduct[]): void => {
  if (!products || products.length === 0) {
    alert('No products to export');
    return;
  }

  // CSV Headers
  const headers = [
    'Title',
    'SKU',
    'Description',
    'Slug URL',
    'Image URL',
    'Final Price',
    'Updated Price',
  ];

  // Convert products to CSV rows
  const rows = products.map(product => {
    const title = product.title || '';
    const sku = product.sku || '';
    const description = htmlToPlainText(product.description || '');
    const slugUrl = `https://www.eastwestoffroad.com/product/${product.slug || ''}`;
    const imgUrl = product.img || '';
    const finalPrice = product.finalPriceDiscount?.toString() || '0';
    const updatedPrice = product.updatedPrice?.toString() || '0';

    // Escape CSV values (handle commas, quotes, newlines)
    const escapeCSV = (value: string): string => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    return [
      escapeCSV(title),
      escapeCSV(sku),
      escapeCSV(description),
      escapeCSV(slugUrl),
      escapeCSV(imgUrl),
      escapeCSV(finalPrice),
      escapeCSV(updatedPrice),
    ].join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `products-export-${timestamp}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
};

