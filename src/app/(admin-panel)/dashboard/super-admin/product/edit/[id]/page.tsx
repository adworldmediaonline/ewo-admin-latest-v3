import EditProductSubmit from '@/app/components/products/edit-product/edit-product-submit';
import Wrapper from '@/layout/wrapper';
import Link from 'next/link';
import { Eye, Package } from 'lucide-react';
import { Button } from '../../../../../../../components/ui/button';
import {
  Card,
  CardContent,
} from '../../../../../../../components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../../../../../components/ui/breadcrumb';

const EditProduct = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <Wrapper>
      <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                  <BreadcrumbPage>Edit Product</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Package className="h-6 w-6" />
              Edit Product
            </h1>
            <p className="text-sm text-muted-foreground">
              Update product details and settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/super-admin/product/preview/${id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/super-admin/product">
                <Package className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 sm:p-8">
            <EditProductSubmit id={id} />
          </CardContent>
        </Card>
      </div>
    </Wrapper>
  );
};

export default EditProduct;
