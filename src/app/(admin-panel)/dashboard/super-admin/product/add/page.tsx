import Wrapper from '@/layout/wrapper';

import { Link, Package } from 'lucide-react';

import { Button } from '../../../../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../../../components/ui/card';
import ProductSubmit from '../../../../../components/products/add-product/product-submit';

const AddProduct = () => {
  return (
    <Wrapper>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Add Product
              </CardTitle>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/super-admin/product">
                <Package className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <ProductSubmit />
        </CardContent>
      </Card>
    </Wrapper>
  );
};

export default AddProduct;
