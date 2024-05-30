import React from 'react'

import Title from '../components/ServicePage/PetHotel/Title'
import Banner from '../components/homePage/Banner'
import Footer from '../components/homePage/Footer'
import HotelList from '../components/ServicePage/PetHotel/HotelList'

const PetHotelPage = () => {
  return (
    <div>
        <Banner/>
        <Title/>
        <HotelList/>
        <Footer/>
    </div>
  )
}

export default PetHotelPage