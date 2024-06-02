
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
import PostLogin from './pages/PostLogin'
import ForCatProductDetailPage from './pages/ForCatProductDetailPage'
import ForDogProductDetailPage from './pages/ForDogProductDetailPage'
import PetListPage from './pages/PetListPage'
import TransactionHistoryPage from './pages/TransactionHistoryPage'
import TransactionDetailPage from './pages/TransactionDetailPage'
import CartPage from './pages/CartPage'
import PaymentPage from './pages/PaymentPage'
import StaffHomePage from './pages/HomePage_Staff'
import StaffSchedulePage from './pages/SchedulePage_Admin'
import ManageAccountPage from './pages/ManageAccountPage'
import BookingListPage from './pages/BookingListPage'
import BookingDetailPage from './pages/BookingDetailPage'
import BookingFeedbackPage from './pages/BookingFeedbackPage'
import UserProfilePage_Staff from './pages/UserProfilePage_Staff'
import PetServiceDetailPage from './pages/PetServiceDetailPage'
import HotelServiceDetailPage from './pages/HotelServiceDetailPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'


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
      <Route path='/home' element={<PostLogin/>}/>
      <Route path='/for-dog' element={<ForDogPage/>}/>
      <Route path='/for-cat' element={<ForCatPage/>}/>
      <Route path='/pet-service' element={<PetServicePage/>}/>
      <Route path='/pet-hotel' element={<PetHotelPage/>}/>
      <Route path='/user-profile' element={<UserProfilePage/>}/>
      <Route path='/change-password' element={<ChangePasswordPage/>}/>
      <Route path='/for-cat-product-detail/:id' element={<ForCatProductDetailPage/>}/>
      <Route path='/for-dog-product-detail/:id' element={<ForDogProductDetailPage/>}/>
      <Route path='/pet-list' element={<PetListPage/>}/>
      <Route path='/transaction-history' element={<TransactionHistoryPage/>}/>
      <Route path='/transaction-detail/:id' element={<TransactionDetailPage/>}/>
      <Route path='/pet-service-detail/:id' element={<PetServiceDetailPage/>}/>
      <Route path='/hotel-service-detail/:id' element={<HotelServiceDetailPage/>}/>
      <Route path='/cart' element={<CartPage/>}/>
      <Route path='/payment' element={<PaymentPage/>}/>
      <Route path='/staff' element={<StaffHomePage/>}/>
      <Route path='/staff-schedule' element={<StaffSchedulePage/>}/>
      <Route path='/accounts' element={<ManageAccountPage/>}/>
      <Route path='/manage-bookings' element={<BookingListPage/>}/>
      <Route path='/booking-detail/:id' element={<BookingDetailPage/>}/>
      <Route path='/booking-feedback' element={<BookingFeedbackPage/>}/>
      <Route path='/user-profile-staff' element={<UserProfilePage_Staff/>}/>
    </Routes>
    </>
  )
}

export default App
