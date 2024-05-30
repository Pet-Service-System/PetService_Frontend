import React from 'react'

import Title from '../components/StorePage/ForDogPage/Title'
import Banner from '../components/homePage/Banner'
import Footer from '../components/homePage/Footer'
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