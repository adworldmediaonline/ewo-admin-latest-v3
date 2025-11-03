import Wrapper from '@/layout/wrapper';
import BannerList from '../../../../components/banner/banner-list';
import Breadcrumb from '../../../../components/breadcrumb/breadcrumb';

const BannerPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        {/* breadcrumb start */}
        <Breadcrumb title="Hero Banner" subtitle="Hero Banner" />
        {/* breadcrumb end */}

        {/* banner list area start */}
        <BannerList />
        {/* banner list area end */}
      </div>
    </Wrapper>
  );
};

export default BannerPage;

