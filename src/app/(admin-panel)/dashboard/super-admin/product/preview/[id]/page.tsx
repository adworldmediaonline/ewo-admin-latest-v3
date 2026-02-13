'use client';

import Wrapper from '@/layout/wrapper';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ArrowLeft, ExternalLink, Eye, Loader2 } from 'lucide-react';
import { useGetProductQuery } from '@/redux/product/productApi';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3000';

export default function ProductPreviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: product, isLoading, isError } = useGetProductQuery(id, {
    skip: !id,
  });

  const previewUrl = useMemo(() => {
    if (!product?._id) return null;
    return `${STOREFRONT_URL}/product/${product._id}`;
  }, [product?._id]);

  if (isLoading || !id) {
    return (
      <Wrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading product preview...</p>
        </div>
      </Wrapper>
    );
  }

  if (isError || !product) {
    return (
      <Wrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <p className="text-destructive font-medium">Product not found</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/super-admin/product">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="flex flex-col h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0 pb-4 border-b">
          <div className="space-y-1">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard/super-admin/product">Products</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/dashboard/super-admin/product/edit/${id}`}>
                      Edit
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Preview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              Product Preview
            </h1>
            <p className="text-sm text-muted-foreground">
              See how &quot;{product.title}&quot; will appear on the storefront
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/super-admin/product/edit/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Edit
              </Link>
            </Button>
            <Button asChild>
              <a
                href={previewUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
              </a>
            </Button>
          </div>
        </div>

        {/* Preview iframe */}
        <div className="flex-1 min-h-0 mt-4 rounded-lg border bg-muted/30 overflow-hidden">
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title={`Preview: ${product.title}`}
              className="w-full h-full min-h-[600px] border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Unable to load preview
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
