import { useEffect, useState } from 'react';
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
          <ServiceDetail serviceData={serviceData}/>
      </div>
    )
}

export default HotelServiceDetailPage