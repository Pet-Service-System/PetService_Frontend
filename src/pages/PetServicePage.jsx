import React from 'react'

import Title from '../components/ServicePage/PetService/Title'
import Banner from '../components/homePage/Banner'
import Footer from '../components/homePage/Footer'
import ServiceList from '../components/ServicePage/PetService/ServiceList'


const PetServicePage = () => {
  return (
    <div>
        <Banner/>
        <Title/>
        <ServiceList/>
        <Footer/>
    </div>
  )
}

export default PetServicePage