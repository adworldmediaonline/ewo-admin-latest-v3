import Wrapper from '@/layout/wrapper';
import Breadcrumb from '../components/breadcrumb/breadcrumb';
import ContactArea from '../components/contact/contact-area';

const ContactQueriesPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        {/* breadcrumb start */}
        <Breadcrumb title="Contact Queries" subtitle="Manage Contact Submissions" />
        {/* breadcrumb end */}

        {/* contact area start */}
        <ContactArea />
        {/* contact area end */}
      </div>
    </Wrapper>
  );
};

export default ContactQueriesPage;