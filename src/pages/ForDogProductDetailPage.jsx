
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getForDogProductsDetail } from '../apis/ApiProduct';
import ProductDetail from '../components/ProductDetailPage/ProductDetail';



const ForDogProductDetailPage = () => {
    const {id} = useParams();
    const [productData,setProductData] = useState();
    useEffect(()=>{
      getForDogProductsDetail(id).then((data)=>{
          setProductData(data)
      })
  },[])
    return (productData &&
      <div>
          <ProductDetail productData={productData}/>
      </div>
    )
}

export default ForDogProductDetailPage