import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ServiceDetail from '../components/ServiceDetailPage/ServiceDetail';
import { getPetServiceDetail } from '../apis/ApiService';


const PetServiceDetailPage = () => {
    const {id} = useParams();
    const [serviceData,setServiceData] = useState();
    useEffect(()=>{
      getPetServiceDetail(id).then((data)=>{
        setServiceData(data)
      })
  },[])
    return (serviceData &&
      <div>
          <ServiceDetail serviceData={serviceData}/>
      </div>
    )
}

export default PetServiceDetailPage