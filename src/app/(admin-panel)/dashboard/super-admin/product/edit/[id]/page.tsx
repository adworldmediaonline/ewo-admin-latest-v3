import EditProductSubmit from '@/app/components/products/edit-product/edit-product-submit';
import Wrapper from '@/layout/wrapper';

const EditProduct = ({ params }: { params: { id: string } }) => {
  return (
    <Wrapper>
      <EditProductSubmit id={params.id} />
    </Wrapper>
  );
};

export default EditProduct;
