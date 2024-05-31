
import { useEffect, useState } from 'react';
import ProductDetail from '../components/ProductDetailPage/ProductDetail'
import { useParams } from 'react-router-dom';
import { getForCatProductsDetail } from '../apis/ApiProduct';

const ForCatProductDetailPage = () => {
  const { id } = useParams();
  const [productData, setProductData] = useState();
  useEffect(() => {
    getForCatProductsDetail(id).then((data) => {
      setProductData(data)
    })
  }, [])
  return (productData &&
    <div>
      <ProductDetail productData={productData} />
    </div>
  )
}

export default ForCatProductDetailPage