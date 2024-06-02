import { useEffect, useState } from 'react';
import Banner from '../components/HomePage/Banner'
import Footer from '../components/HomePage/Footer'
import { useParams } from 'react-router-dom';
import ServiceDetail from '../components/ServiceDetailPage/ServiceDetail';
import { getHotelServiceDetail } from '../apis/ApiService';

const HotelServiceDetailPage = () => {
    const {id} = useParams();
    const [serviceData,setServiceData] = useState();
    useEffect(()=>{
      getHotelServiceDetail(id).then((data)=>{
        setServiceData(data)
      })
  },[])
    return (serviceData &&
      <div>
          <Banner/>
          <ServiceDetail serviceData={serviceData}/>
          <Footer/>
      </div>
    )
}

export default HotelServiceDetailPage