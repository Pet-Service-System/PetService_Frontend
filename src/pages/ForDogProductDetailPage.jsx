
import { useEffect, useState } from 'react';
import Banner from '../components/HomePage/Banner'
import Footer from '../components/HomePage/Footer'
import { useParams } from 'react-router-dom';

import ProductDetail from '../components/ProductDetailPage/ProductDetail';



const ForDogProductDetailPage = () => {
    return (
      <div>
          <Banner/>
          <ProductDetail type='dog'/>
          <Footer/>
      </div>
    )
}

export default ForDogProductDetailPage