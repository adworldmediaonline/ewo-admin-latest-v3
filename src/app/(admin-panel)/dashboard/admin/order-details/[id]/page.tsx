import OrderDetailsArea from '@/app/components/order-details/order-details-area';

const OrdersPage = ({ params }: { params: { id: string } }) => {
  return <OrderDetailsArea id={params.id} role="admin" />;
};

export default OrdersPage;
