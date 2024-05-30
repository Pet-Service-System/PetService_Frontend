
import Banner from '../components/HomePage_Staff/Banner'
import Footer from '../components/homePage/Footer'
import BookingDetail from '../components/BookingDetailPage/BookingDetail'
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getBookingDetail } from '../apis/ApiBooking';

const BookingDetailPage = () => {
  const {id} = useParams();
  const [bookingData,setBookingData] = useState();
  useEffect(()=>{
    getBookingDetail(id).then((data)=>{
        setBookingData(data)
    })
  },[])
  return (
    <div>
        <Banner/>
        <BookingDetail bookingData={bookingData} />
        <Footer/>
    </div>
  )
}

export default BookingDetailPage