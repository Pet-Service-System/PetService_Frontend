import { Button, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const ServiceDetail = ({ serviceData }) => {

  // Function to handle ordering the product
  const handleBookingNow = () => {
    console.log('booked');
  };

  return (
    <div className="flex m-5 py-20 px-32">
      {/* Left section for the product image */}
      <div className="w-1/2 bg-cover bg-center h-96" style={{ backgroundImage: `url(${serviceData.image})` }}></div>

      {/* Right section for the product information */}
      <div className="w-1/2 p-5 ml-10">
        {/* Product name */}
        <Title level={1} className="mb-4">{serviceData.name}</Title>

        {/* Product price */}
        <Title level={3} className="text-green-500 mb-4">{`Price: $${serviceData.price}`}</Title>

        {/* Product description */}
        <Paragraph className="mb-6">{serviceData.description}</Paragraph>
        
        {/* Booking button */}
        <Button type="primary" onClick={handleBookingNow}>Booking Now</Button>
      </div>
    </div>
  );
};

export default ServiceDetail;
