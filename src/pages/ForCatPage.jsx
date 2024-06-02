import React from 'react'
import Title from '../components/StorePage/ForCatPage/Title'
import Banner from '../components/HomePage/Banner'
import Footer from '../components/HomePage/Footer'
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