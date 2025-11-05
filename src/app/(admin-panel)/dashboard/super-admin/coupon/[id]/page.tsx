import CouponEditArea from '@/app/components/coupon/coupon-edit-area';
import Wrapper from '@/layout/wrapper';
import Breadcrumb from '../../../../../components/breadcrumb/breadcrumb';

const CouponDynamicPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        {/* breadcrumb start */}
        <Breadcrumb title="Edit Coupon" subtitle="Coupon Management" />
        {/* breadcrumb end */}

        {/* coupon area start */}
        <CouponEditArea id={id} />
        {/* coupon area end */}
      </div>
    </Wrapper>
  );
};

export default CouponDynamicPage;
