import OrderTable from './order-table';

const OrderArea = ({ role }: { role: 'admin' | 'super-admin' }) => {
  return <OrderTable role={role} />;
};

export default OrderArea;
