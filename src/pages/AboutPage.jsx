import React from 'react'
import Welcome from '../components/AboutPage/Welcome'
import Footer from '../components/homePage/Footer'
import { Stats } from '../components/AboutPage/Stats'
import Banner from '../components/homePage/Banner'

const About = () => {
  return (
    <div className='min-h-screen:'>
        <Banner/>
        <Welcome/>
        <Stats/>
        <Footer/>
    </div>
  )
}

export default About