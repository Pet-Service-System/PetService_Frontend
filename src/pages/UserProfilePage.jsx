import{ useEffect, useState } from 'react'

import UserProfile from '../components/UserProfilePage/UserProfile'
import Banner from '../components/UserProfilePage/Banner'
import Footer from '../components/HomePage/Footer'
import { getUserInformation } from '../apis/ApiUserProfile'

const UserProfilePage = () => {
  return (
    <div>
        <Banner/>
        <UserProfile/>
        <Footer/>
    </div>
  )
}

export default UserProfilePage