
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
        <BookingDetail bookingData={bookingData} />
    </div>
  )
}

export default BookingDetailPage