import React from 'react'
import Title from '../components/StorePage/ForCatPage/Title'
import Banner from '../components/homePage/Banner'
import Footer from '../components/homePage/Footer'
import ProductList from '../components/StorePage/ForCatPage/ProductList'

const ForCatPage = () => {
  return (
    <div>
        <Banner/>
        <Title/>
        <ProductList/>
        <Footer/>
    </div>
  )
}

export default ForCatPage