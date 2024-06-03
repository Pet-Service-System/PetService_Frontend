
import { useEffect, useState } from 'react';
import ProductDetail from '../components/ProductDetailPage/ProductDetail'
import Banner from '../components/HomePage/Banner'
import Footer from '../components/HomePage/Footer'
import { useParams } from 'react-router-dom';
import { getForCatProductsDetail } from '../apis/ApiProduct';

const ForCatProductDetailPage = () => {
  return (
    <div>
        <Banner/>
        <ProductDetail type='cat'/>
        <Footer/>
    </div>
  )
}

export default ForCatProductDetailPage