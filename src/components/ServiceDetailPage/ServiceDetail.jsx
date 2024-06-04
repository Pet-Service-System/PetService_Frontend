import { Button, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const ServiceDetail = ({ serviceData }) => {

  // Function to handle ordering the product
  const handleBookingNow = () => {
    console.log('booked');
  };

  return (
    <div className="flex flex-col md:flex-row m-5 py-28 px-4 md:px-32">
      <div className="w-full md:w-1/2 flex justify-center">
        <img 
          src={serviceData.image} 
          alt={serviceData.name} 
          className="max-w-full max-h-96 object-contain" 
        />
      </div>
      <div className="w-full md:w-1/2 p-5 md:ml-10">
        <Title level={1} className="mb-4">{serviceData.name}</Title>
        <Title level={3} className="text-green-500 mb-4">{`Price: $${serviceData.price}`}</Title>
        <Paragraph className="mb-6">{serviceData.description}</Paragraph>
        <Button type="primary" onClick={handleBookingNow}>Booking Now</Button>
      </div>
    </div>
  );
};

export default ServiceDetail;
