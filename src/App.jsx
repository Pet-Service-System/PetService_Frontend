
import './App.css'
import HomePage from './pages/HomePage'
import "./styles/bootstrap.css"
import "./styles/flexslider.css"
import "./styles/style.css"
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PetHotelPage from './pages/PetHotelPage'
import PetServicePage from './pages/PetServicePage'
import ForDogPage from './pages/ForDogPage'
import ForCatPage from './pages/ForCatPage'
import LoginPage from './pages/LoginPage'
import UserProfilePage from './pages/UserProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import { Route, Routes } from 'react-router-dom'
import PetListPage from './pages/PetListPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import CartPage from './pages/CartPage'
import PaymentPage from './pages/PaymentPage'
import ManageAccountPage from './pages/ManageAccountPage'
import BookingListPage from './pages/BookingListPage'
import BookingDetailPage from './pages/BookingDetailPage'
import BookingFeedbackPage from './pages/BookingFeedbackPage'
import PetServiceDetailPage from './pages/PetServiceDetailPage'
import HotelServiceDetailPage from './pages/HotelServiceDetailPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SchedulePage from './pages/SchedulePage'
import ProdutcDetailPage from './pages/ProdutcDetailPage'
import PetBooking from './pages/PetBooking'
import ServiceBookingPage from './pages/ServiceBookingPage'
import HotelBookingPage from './pages/HotelBookingPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ServiceBookingDetailPage from './pages/ServiceBookingDetailPage'
import HotelBookingDetailPage from './pages/HotelBookingDetailPage'

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
      <Route path='/for-dog-products' element={<ForDogPage/>}/>
      <Route path='/for-cat-products' element={<ForCatPage/>}/>
      <Route path='/pet-service' element={<PetServicePage/>}/>
      <Route path='/pet-hotel' element={<PetHotelPage/>}/>
      <Route path='/user-profile' element={<UserProfilePage/>}/>
      <Route path='/change-password' element={<ChangePasswordPage/>}/>
      <Route path='/product-detail/:id' element={<ProdutcDetailPage/>}/>
      <Route path='/pet-list' element={<PetListPage/>}/>
      <Route path='/orders-history' element={<OrderHistoryPage/>}/>
      <Route path='/pet-service-detail/:id' element={<PetServiceDetailPage/>}/>
      <Route path='/hotel-service-detail/:id' element={<HotelServiceDetailPage/>}/>
      <Route path='/cart' element={<CartPage/>}/>
      <Route path='/payment' element={<PaymentPage/>}/>
      <Route path='/manage-accounts' element={<ManageAccountPage/>}/>
      <Route path='/booking-list' element={<BookingListPage/>}/>
      <Route path='/booking-detail/:id' element={<BookingDetailPage/>}/>
      <Route path='/booking-feedback' element={<BookingFeedbackPage/>}/>
      <Route path='/reset-password/:accountId/:token' element={<ResetPasswordPage/>}/>
      <Route path='/staff-schedule' element={<SchedulePage/>}/>
      <Route path='/pet-booking' element={<PetBooking/>}/>
      <Route path='/service-booking' element={<ServiceBookingPage/>}/>
      <Route path='/hotel-booking' element={<HotelBookingPage/>}/>
      <Route path='/order-detail/:id' element={<OrderDetailPage/>}/>
      <Route path='/service-booking-detail/:id' element={<ServiceBookingDetailPage/>}/>
      <Route path='/hotel-booking-detail/:id' element={<HotelBookingDetailPage/>}/>
    </Routes>
    </>
  )
}

export default App
