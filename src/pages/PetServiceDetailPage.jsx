import { useEffect, useState } from 'react';
import Banner from '../components/homePage/Banner'
import Footer from '../components/homePage/Footer'
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
          <Banner/>
          <ServiceDetail serviceData={serviceData}/>
          <Footer/>
      </div>
    )
}

export default PetServiceDetailPage