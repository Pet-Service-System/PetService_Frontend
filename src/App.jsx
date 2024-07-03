
import './App.css'
import HomePage from './pages/HomePage'
import "./styles/bootstrap.css"
import "./styles/flexslider.css"
import "./styles/style.css"
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
import SpaBookingPage from './pages/SpaBookingPage'
import OrderHistoryDetail from './pages/OrderHistoryDetailPage'
import SpaBookingDetailPage from './pages/SpaBookingDetailPage'
import ManageOrderPage from './pages/ManageOrderPage'
import ManageSpaBookingPage from './pages/ManageSpaBookingPage'
import PurchaseSuccessPage from './pages/PurchaseOrderSuccessPage'
import StatisticPage from './pages/StatisticPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
function App() {
  return (
    <>
    <Routes>
      <Route path='/' element={<HomePage/>}/>
      <Route path='/login' element={<LoginPage/>}/>
      <Route path='/register' element={<RegisterPage/>}/>
      <Route path='/forgot-password' element={<ForgotPasswordPage/>}/>
      <Route path='/products-for-dog' element={<ProductForDogPage/>}/>
      <Route path='/products-for-cat' element={<ProductForCatPage/>}/>
      <Route path='/services-for-dog' element={<ServiceForDogPage/>}/>
      <Route path='/services-for-cat' element={<ServiceForCatPage/>}/>
      <Route path='/user-profile' element={<UserProfilePage/>}/>
      <Route path='/change-password' element={<ChangePasswordPage/>}/>
      <Route path='/product-detail/:id' element={<ProdutcDetailPage/>}/>
      <Route path='/pet-list' element={<PetListPage/>}/>
      <Route path='/order-history' element={<OrderHistoryPage/>}/>
      <Route path='/spa-service-detail/:id' element={<SpaServiceDetailPage/>}/>
      <Route path='/cart' element={<CartPage/>}/>
      <Route path='/order' element={<OrderPage/>}/>
      <Route path='/manage-accounts' element={<ManageAccountPage/>}/>
      <Route path='/reset-password/:accountId/:token' element={<ResetPasswordPage/>}/>
      <Route path='/staff-schedule' element={<SchedulePage/>}/>
      <Route path='/spa-booking' element={<SpaBookingPage/>}/>
      <Route path='/order-history-detail/:id' element={<OrderHistoryDetail/>}/>
      <Route path='/spa-booking-detail/:id' element={<SpaBookingDetailPage/>}/>
      <Route path='/manage-orders' element={<ManageOrderPage/>}/>
      <Route path='/manage-spa-bookings' element={<ManageSpaBookingPage/>}/>
      <Route path='/purchase-order-successfully' element={<PurchaseSuccessPage/>}/>
      <Route path='/statistics' element={<StatisticPage/>}/>
      <Route path='/admin-dashboard' element={<AdminDashboardPage/>}/>
    </Routes>
    </>
  )
}

export default App
