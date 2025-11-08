'use client';
import useCouponSubmit from '@/hooks/useCouponSubmit';
import { useGetCouponQuery } from '@/redux/coupon/couponApi';
import { ArrowLeft, Edit2, Save } from 'lucide-react';
import Link from 'next/link';
import ErrorMsg from '../common/error-msg';
import Loading from '../common/loading';
import EnhancedCouponForm from './enhanced-coupon-form';

const CouponEditArea = ({ id }: { id: string }) => {
  const {
    handleSubmitEditCoupon,
    isSubmitted,
    logo,
    setIsSubmitted,
    setLogo,
  } = useCouponSubmit();

  // get specific coupon
  const { data: coupon, isError, isLoading } = useGetCouponQuery(id);

  // decide to render
  let content = null;
  if (isLoading) {
    content = (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading loading={isLoading} spinner="fade" />
      </div>
    );
  }
  if (!coupon && isError) {
    content = (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <ErrorMsg msg="There was an error loading the coupon" />
      </div>
    );
  }
  if (coupon && !isError) {
    content = (
      <div className="bg-white rounded-lg shadow-sm">
        {/* Enhanced Header */}
        <div className="border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/super-admin/coupon"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back to Coupons</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Edit2 className="h-6 w-6 text-blue-600" />
                  Edit Coupon
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Update coupon settings and restrictions for{' '}
                  <span className="font-semibold text-blue-600">
                    {coupon.couponCode}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-500">Status</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    coupon.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {coupon.status === 'active' ? '● Active' : '● Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-8">
          <EnhancedCouponForm
            onSubmit={data => handleSubmitEditCoupon(data, id)}
            isSubmitted={isSubmitted}
            setIsSubmitted={setIsSubmitted}
            logo={logo}
            setLogo={setLogo}
            defaultValues={coupon}
            isEdit={true}
          />
        </div>
      </div>
    );
  }

  return <div className="max-w-7xl mx-auto">{content}</div>;
};

export default CouponEditArea;
