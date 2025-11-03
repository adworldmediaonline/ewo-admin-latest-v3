import Wrapper from '@/layout/wrapper';
import EditBanner from '../../../../../components/banner/edit-banner';
import Breadcrumb from '../../../../../components/breadcrumb/breadcrumb';

const EditBannerPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        {/* breadcrumb start */}
        <Breadcrumb title="Edit Banner" subtitle="Edit Banner" />
        {/* breadcrumb end */}

        {/* edit banner area start */}
        <EditBanner id={id} />
        {/* edit banner area end */}
      </div>
    </Wrapper>
  );
};

export default EditBannerPage;

