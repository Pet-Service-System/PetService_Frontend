import React from 'react'
import Welcome from '../components/AboutPage/Welcome'
import Footer from '../components/HomePage/Footer'
import Banner from '../components/HomePage/Banner'

const About = () => {
  return (
    <div className='min-h-screen:'>
        <Banner/>
        <Welcome/>\
        <Footer/>
    </div>
  )
}

export default About