import React from 'react'
import Welcome from '../components/AboutPage/Welcome'
import Footer from '../components/homePage/Footer'
import { Stats } from '../components/AboutPage/Stats'
import Banner from '../components/homePage/HomepageBanner'

const AboutPage = () => {
  return (
    <div>
        <Welcome/>
        <Stats/>
    </div>
  )
}

export default AboutPage