import Wrapper from '@/layout/wrapper';
import AddBanner from '../../../../../components/banner/add-banner';
import Breadcrumb from '../../../../../components/breadcrumb/breadcrumb';

const AddBannerPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        {/* breadcrumb start */}
        <Breadcrumb title="Add Hero Banner" subtitle="Add Hero Banner" />
        {/* breadcrumb end */}

        {/* add banner area start */}
        <AddBanner />
        {/* add banner area end */}
      </div>
    </Wrapper>
  );
};

export default AddBannerPage;

