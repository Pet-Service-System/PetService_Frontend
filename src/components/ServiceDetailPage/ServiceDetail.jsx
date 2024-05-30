
import PropTypes from 'prop-types';

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
        <h1 className="text-6xl font-bold mb-4">{serviceData.name}</h1>

        {/* Product price */}
        <p className="text-2xl text-green-500 mb-4">{`Price: $${serviceData.price}`}</p>

        {/* Product description */}
        <p className="mb-6">{serviceData.description}</p>
        
        {/* Booking button */}
        <button onClick={handleBookingNow} className="bg-black hover:bg-gray-700 text-white px-4 py-2">Booking Now</button>
      </div>
    </div>
  );
};

// PropTypes to enforce the type and structure of serviceData
ServiceDetail.propTypes = {
  serviceData: PropTypes.shape({
    name: PropTypes.string.isRequired,       // Service name should be a string and is required
    price: PropTypes.number.isRequired,      // Service price should be a number and is required
    description: PropTypes.string.isRequired,// Service description should be a string and is required
    image: PropTypes.string.isRequired,      // Service image URL should be a string and is required
  }).isRequired,
};

export default ServiceDetail;
