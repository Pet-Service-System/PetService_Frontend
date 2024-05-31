
import './App.css'
import "./styles/bootstrap.css"
import "./styles/flexslider.css"
import "./styles/style.css"
import { Outlet } from 'react-router-dom'
import HomePageBanner from './components/homePage/HomepageBanner'
import Footer from './components/homePage/Footer'
import { useState } from 'react'
import PostLoginBanner from './components/PostLoginPage/PostLoginBanner'
import StaffBanner from './components/HomePage_Staff/StaffBanner'
import UserProfileBanner from './components/UserProfilePage/UserProfileBanner'
import ContactPageBanner from './components/ContactPage/ContactPageBanner'


function App() {
  const [loginStatus, setCount] = useState(0);

  let bannerComponent;

  switch (loginStatus) {
    case 1:
      bannerComponent = <PostLoginBanner />
      break;

    case 2:
      bannerComponent = <StaffBanner />
      break;

    case 3:
      bannerComponent = <UserProfileBanner />
      break;
    
    case 4:
      bannerComponent = <ContactPageBanner />
      break;

    default:
      bannerComponent = <HomePageBanner />
      break;

  }

  return (
    <>
      {bannerComponent}
      <Outlet />
      <Footer />
    </>
  )
}

export default App
