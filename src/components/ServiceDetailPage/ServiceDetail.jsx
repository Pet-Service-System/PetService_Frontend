import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Typography, message, Image } from 'antd'; // Import Image from 'antd'
import axios from 'axios';

const { Title, Paragraph } = Typography;

const ServiceDetail = () => {
  const { id } = useParams();
  console.log(id)
  const [serviceData, setServiceData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/services/${id}`);
        setServiceData(response.data);
      } catch (error) {
        console.error('Error fetching service:', error);
        message.error('Error fetching service data');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleBookingNow = () => {
    console.log('booked');
    // Add booking functionality here
  };

  if (loading) {
    return <div>Loading...</div>; // Add a proper loading indicator here
  }

  return (
    <div className="flex flex-col md:flex-row m-5 py-28 px-4 md:px-32">
      <div className="w-full md:w-1/2 flex justify-center">
        {/* Use Ant Design's Image component */}
        <Image 
          src={serviceData.ImageURL} 
          alt={serviceData.ServiceName} 
          className="max-w-full max-h-96 object-contain" 
        />
      </div>
      <div className="w-full md:w-1/2 p-5 md:ml-10">
        <Title level={1} className="mb-4">{serviceData.ServiceName}</Title>
        <Title level={3} className="text-green-500 mb-4">{`Price: $${serviceData.Price}`}</Title>
        <Paragraph className="mb-6">{serviceData.Description}</Paragraph>
        <Button type="primary" onClick={handleBookingNow}>Booking Now</Button>
      </div>
    </div>
  );
};

export default ServiceDetail;
