import Wrapper from '@/layout/wrapper';
import Breadcrumb from '../../../../../components/breadcrumb/breadcrumb';
import PageSectionListArea from '../../../../../components/page-section/page-section-list-area';

const PageSectionsPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        <Breadcrumb title="Page Sections" subtitle="Website Content" />
        <div className="mt-6">
          <PageSectionListArea />
        </div>
      </div>
    </Wrapper>
  );
};

export default PageSectionsPage;
