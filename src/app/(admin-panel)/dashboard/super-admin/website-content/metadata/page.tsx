import Wrapper from '@/layout/wrapper';
import Breadcrumb from '../../../../../components/breadcrumb/breadcrumb';
import PageMetadataListArea from '../../../../../components/page-metadata/page-metadata-list-area';

const PageMetadataPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        <Breadcrumb title="Page Metadata" subtitle="Website Content" />
        <div className="mt-6">
          <PageMetadataListArea />
        </div>
      </div>
    </Wrapper>
  );
};

export default PageMetadataPage;
