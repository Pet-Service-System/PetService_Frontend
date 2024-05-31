import{ useEffect, useState } from 'react'

import UserProfile from '../components/UserProfilePage/UserProfile'
import Banner from '../components/UserProfilePage/Banner'
import Footer from '../components/homePage/Footer'
import { getUserInformation } from '../apis/ApiUserProfile'

const UserProfilePage = () => {
  const id = 1;
    const [userData,setUserData] = useState();
    useEffect(()=>{
      getUserInformation(id).then((data)=>{
        setUserData(data)
      })
  },[])
  return (userData &&
    <div>
        <Banner/>
        <UserProfile userData = {userData}/>
        <Footer/>
    </div>
  )
}

export default UserProfilePage