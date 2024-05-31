import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from '../App'
import Welcome from '../components/homePage/Welcome'
import AboutPage from '../pages/AboutPage'
import ContactPage from '../pages/ContactPage'
import LoginForm from '../components/LoginPage/LoginForm'
// import PostLogin from '../pages/PostLogin'
import ForDogPage from '../pages/ForDogPage'
import ForCatPage from '../pages/ForCatPage'
import PetServicePage from '../pages/PetServicePage'
import PetHotelPage from '../pages/PetHotelPage'
import UserProfilePage from '../pages/UserProfilePage'
import ChangePasswordPage from '../pages/ChangePasswordPage'
import ForCatProductDetailPage from '../pages/ForCatProductDetailPage'
import ForDogProductDetailPage from '../pages/ForDogProductDetailPage'
import PetListPage from '../pages/PetListPage'
import TransactionHistoryPage from '../pages/TransactionHistoryPage'
import TransactionDetailPage from '../pages/TransactionDetailPage'
import PetServiceDetailPage from '../pages/PetServiceDetailPage'
import HotelServiceDetailPage from '../pages/HotelServiceDetailPage'
import CartPage from '../pages/CartPage'
import PaymentPage from '../pages/PaymentPage'
import UserProfilePage_Staff from '../pages/UserProfilePage_Staff'
import BookingFeedbackPage from '../pages/BookingFeedbackPage'
import BookingDetailPage from '../pages/BookingDetailPage'
import BookingListPage from '../pages/BookingListPage'
import ManageAccountPage from '../pages/ManageAccountPage'
import SchedulePage_Admin from '../pages/SchedulePage_Admin'
import SchedulePage_Manager from '../pages/SchedulePage_Manager'
import HomePage_Staff from '../pages/HomePage_Staff'
import NotFound from '../pages/NotFound'


const Routepath = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<App />}>
                    <Route index element={<Welcome />} />
                    <Route path='home' element={<Welcome />} />
                    <Route path='about' element={<AboutPage />} />
                    <Route path='contact' element={<ContactPage />} />
                    <Route path='login' element={<LoginForm />} />
                    {/* <Route path='home' element={<PostLogin />} /> redundant */}
                    <Route path='for-dog' element={<ForDogPage />} />
                    <Route path='for-cat' element={<ForCatPage />} />
                    <Route path='pet-service' element={<PetServicePage />} />
                    <Route path='pet-hotel' element={<PetHotelPage />} />
                    <Route path='user-profile' element={<UserProfilePage />} />
                    <Route path='change-password' element={<ChangePasswordPage />} />
                    <Route path='for-cat-product-detail/:id' element={<ForCatProductDetailPage />} />
                    <Route path='for-dog-product-detail/:id' element={<ForDogProductDetailPage />} />
                    <Route path='pet-list' element={<PetListPage />} />
                    <Route path='transaction-history' element={<TransactionHistoryPage />} />
                    <Route path='transaction-detail/:id' element={<TransactionDetailPage />} />
                    <Route path='pet-service-detail/:id' element={<PetServiceDetailPage />} />
                    <Route path='hotel-service-detail/:id' element={<HotelServiceDetailPage />} />
                    <Route path='cart' element={<CartPage />} />
                    <Route path='payment' element={<PaymentPage />} />
                    <Route path='staff' element={<HomePage_Staff />} />
                    <Route path='manager-schedule' element={<SchedulePage_Manager />} />
                    <Route path='admin-schedule' element={<SchedulePage_Admin />} />
                    <Route path='accounts' element={<ManageAccountPage />} />
                    <Route path='booking-list' element={<BookingListPage />} />
                    <Route path='booking-detail/:id' element={<BookingDetailPage />} />
                    <Route path='booking-feedback' element={<BookingFeedbackPage />} />
                    <Route path='user-profile-staff' element={<UserProfilePage_Staff />} />
                    <Route path='*' element={<NotFound />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default Routepath