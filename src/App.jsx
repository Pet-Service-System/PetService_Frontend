
import './App.css'
import HomePage from './pages/HomePage'
import "./styles/bootstrap.css"
import "./styles/flexslider.css"
import "./styles/style.css"
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import HotelServicePage from './pages/HotelServicePage'
import SpaServicePage from './pages/SpaServicePage'
import ProductForDogPage from './pages/ProductForDogPage'
import ProductForCatPage from './pages/ProductForCatPage'
import ServiceForDogPage from './pages/ServiceForDogPage'
import ServiceForCatPage from './pages/ServiceForCatPage'
import LoginPage from './pages/LoginPage'
import UserProfilePage from './pages/UserProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import { Route, Routes } from 'react-router-dom'
import PetListPage from './pages/PetListPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import CartPage from './pages/CartPage'
import OrderPage from './pages/OrderPage'
import ManageAccountPage from './pages/ManageAccountPage'
import SpaServiceDetailPage from './pages/SpaServiceDetailPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SchedulePage from './pages/SchedulePage'
import ProdutcDetailPage from './pages/ProdutcDetailPage'
import PetBooking from './pages/PetBooking'
import SpaBookingPage from './pages/SpaBookingPage'
import HotelBookingPage from './pages/HotelBookingPage'
import OrderHistoryDetail from './pages/OrderHistoryDetailPage'
import SpaBookingDetailPage from './pages/SpaBookingDetailPage'
import HotelBookingDetailPage from './pages/HotelBookingDetailPage'
import ManageOrderPage from './pages/ManageOrderPage'
import ManageSpaBookingPage from './pages/ManageSpaBookingPage'
import ManageHotelBookingsList from './pages/ManageHotelBookingsList'
console.log(process.env.PAYPAL_CLIENT_ID)
function App() {
  return (
    <>
    <Routes>
      <Route path='/' element={<HomePage/>}/>
      <Route path='/about' element={<AboutPage/>}/>
      <Route path='/contact' element={<ContactPage/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='/register' element={<RegisterPage/>}/>
      <Route path='/forgot-password' element={<ForgotPasswordPage/>}/>
      <Route path='/products-for-dog' element={<ProductForDogPage/>}/>
      <Route path='/products-for-cat' element={<ProductForCatPage/>}/>
      <Route path='/services-for-dog' element={<ServiceForDogPage/>}/>
      <Route path='/services-for-cat' element={<ServiceForCatPage/>}/>
      <Route path='/spa-service' element={<SpaServicePage/>}/>
      <Route path='/hotel-service' element={<HotelServicePage/>}/>
      <Route path='/user-profile' element={<UserProfilePage/>}/>
      <Route path='/change-password' element={<ChangePasswordPage/>}/>
      <Route path='/product-detail/:id' element={<ProdutcDetailPage/>}/>
      <Route path='/pet-list' element={<PetListPage/>}/>
      <Route path='/orders-history' element={<OrderHistoryPage/>}/>
      <Route path='/spa-service-detail/:id' element={<SpaServiceDetailPage/>}/>
      <Route path='/cart' element={<CartPage/>}/>
      <Route path='/order' element={<OrderPage/>}/>
      <Route path='/manage-accounts' element={<ManageAccountPage/>}/>
      <Route path='/reset-password/:accountId/:token' element={<ResetPasswordPage/>}/>
      <Route path='/staff-schedule' element={<SchedulePage/>}/>
      <Route path='/pet-booking' element={<PetBooking/>}/>
      <Route path='/spa-booking' element={<SpaBookingPage/>}/>
      <Route path='/hotel-booking' element={<HotelBookingPage/>}/>
      <Route path='/orders-history-detail/:id' element={<OrderHistoryDetail/>}/>
      <Route path='/spa-booking-detail/:id' element={<SpaBookingDetailPage/>}/>
      <Route path='/hotel-booking-detail/:id' element={<HotelBookingDetailPage/>}/>
      <Route path='/manage-orders' element={<ManageOrderPage/>}/>
      <Route path='/manage-spa-bookings' element={<ManageSpaBookingPage/>}/>
      <Route path='/manage-hotel-bookings' element={<ManageHotelBookingsList/>}/>
    </Routes>
    </>
  )
}

export default App
