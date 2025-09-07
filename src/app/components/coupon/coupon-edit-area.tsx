'use client';
import useCouponSubmit from '@/hooks/useCouponSubmit';
import { useGetCouponQuery } from '@/redux/coupon/couponApi';
import ErrorMsg from '../common/error-msg';
import Loading from '../common/loading';
import CouponTable from './coupon-table';
import EnhancedCouponForm from './enhanced-coupon-form';

const CouponEditArea = ({ id }: { id: string }) => {
  const {
    handleSubmitEditCoupon,
    isSubmitted,
    logo,
    setIsSubmitted,
    setLogo,
    setOpenSidebar,
  } = useCouponSubmit();

  // get specific coupon
  const { data: coupon, isError, isLoading } = useGetCouponQuery(id);

  // decide to render
  let content = null;
  if (isLoading) {
    content = <Loading loading={isLoading} spinner="fade" />;
  }
  if (!coupon && isError) {
    content = <ErrorMsg msg="There was an error loading the coupon" />;
  }
  if (coupon && !isError) {
    content = (
      <>
        <div className="col-span-12 lg:col-span-4">
          <div className="mb-6 bg-white px-8 py-8 rounded-md">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Edit Coupon
              </h2>
              <p className="text-sm text-gray-600">
                Update coupon settings and restrictions
              </p>
            </div>

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
      </>
    );
  }
  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        {content}
        <div className="col-span-12 lg:col-span-8">
          {/* brand table start */}
          <div className="relative overflow-x-auto bg-white px-8 py-4 rounded-md">
            <div className="overflow-scroll 2xl:overflow-visible">
              <CouponTable
                cls="w-[975px] 2xl:w-full"
                setOpenSidebar={setOpenSidebar}
              />
            </div>
          </div>
          {/* brand table end */}
        </div>
      </div>
    </>
  );
};

export default CouponEditArea;
