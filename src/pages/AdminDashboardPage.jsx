import React from 'react'
import AdminDashboard from '../components/AdminDashboard/AdminDashboard'
import Banner from '../components/HomePage/Banner'
import Footer from '../components/HomePage/Footer'

const AdminDashboardPage = () => {
  return (
    <div>        
      <Banner/>
      <AdminDashboard/>
      <Footer/>
    </div>
  )
}

export default AdminDashboardPage