import Wrapper from '@/layout/wrapper';
import { Tag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import CouponSubmit from '@/app/components/coupon/coupon-submit';

const AddCouponPage = () => {
  return (
    <Wrapper>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Add Coupon
              </CardTitle>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/super-admin/coupon">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Coupons
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <CouponSubmit />
        </CardContent>
      </Card>
    </Wrapper>
  );
};

export default AddCouponPage;

