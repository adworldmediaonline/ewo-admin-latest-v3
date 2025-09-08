import OrderDetailsArea from '@/app/components/order-details/order-details-area';
import Wrapper from '@/layout/wrapper';

const OrderDetailsPage = ({ params }: { params: { id: string } }) => {
  return (
    <Wrapper>
      <div className="min-h-screen bg-gray-50">
        {/* breadcrumb start */}
        {/* <Breadcrumb title="Order Details" subtitle="Order Details" /> */}
        {/* breadcrumb end */}

        {/* order details area */}
        <div className="container mx-auto p-4">
          <OrderDetailsArea id={params.id} />
        </div>
        {/* order details area */}
      </div>
    </Wrapper>
  );
};

export default OrderDetailsPage;
