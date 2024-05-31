import{ useEffect, useState } from 'react'
import UserProfile from '../components/UserProfilePage/UserProfile'
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
        <UserProfile userData = {userData}/>
    </div>
  )
}

export default UserProfilePage