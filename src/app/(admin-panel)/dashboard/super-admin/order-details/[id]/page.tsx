import OrderDetailsArea from '@/app/components/order-details/order-details-area';

const OrdersPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <OrderDetailsArea id={id} role="super-admin" />;
};

export default OrdersPage;
