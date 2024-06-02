import React from 'react'

import Title from '../components/StorePage/ForDogPage/Title'
import Banner from '../components/HomePage/Banner'
import Footer from '../components/HomePage/Footer'
import ProductList from '../components/StorePage/ForDogPage/ProductList'


const ForDogPage = () => {
  return (
    <div>
        <Banner/>
        <Title/>
        <ProductList/>
        <Footer/>
    </div>
  )
}

export default ForDogPage