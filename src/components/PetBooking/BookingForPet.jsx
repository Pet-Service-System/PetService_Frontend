import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Select, Button, Input } from 'antd';
import { getPetService, getHotels, getHotelById } from '../../apis/ApiService'; // Import getHotelById from ApiService
import { useTranslation } from 'react-i18next';


const { Option } = Select;



const BookingForPet = () => {
  const [serviceData, setServiceData] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [price, setPrice] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Add a state variable for authentication status
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Check authentication status (you can replace this with your actual authentication check)
    const checkAuth = async () => {
      // Replace with actual authentication check
      const authStatus = await checkUserAuthentication();
      setIsAuthenticated(authStatus);
      if (!authStatus) {
        navigate('/login'); // Redirect to login page if not authenticated
      }
    };

    checkAuth();
    getPetService().then((data) => {
      setServiceData(data);
    });
    fetchHotels(); // Fetch hotels when component mounts
  }, []);

  const fetchHotels = async () => {
    try {
      const hotelData = await getHotels();
      setHotels(hotelData);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      // Handle error, show message or retry logic
    }
  };

  const handleHotelTypeChange = async (value) => {
    try {
      const hotel = await getHotelById(value);
      setPrice(hotel.Price); // Set the price from the hotel details
    } catch (error) {
      console.error('Error fetching hotel details:', error);
    }
  };

  const onFinish = (values) => {
    // Handle form submission with selected values
    console.log('Form values:', values);
    // Call the API to submit the form
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      {isAuthenticated ? ( // Conditionally render the form if authenticated
        <>
          <div className="text-2xl py-4 px-6 bg-gray-900 text-white text-center font-bold uppercase">
            {t('book_service')}
          </div>
          <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="w-full md:w-1/2 p-4 flex justify-center items-center">
              {/* Replace with your serviceData rendering */}
              <img src={serviceData.ImageURL} alt="Hotel Image" />
            </div>
            <div className="w-full md:w-1/2 p-6">
              <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <Form
                  onFinish={onFinish}
                  className="py-4 px-6"
                  layout="vertical"
                >
                  <Form.Item
                    label={t('pet')}
                    name="pet"
                    rules={[{ required: true, message: t('pl_choose_pet') }]}
                  >
                    <Select placeholder="Choose your pet">
                      <Option value="dog">{t('dog')}</Option>
                      <Option value="cat">{t('cat')}</Option>
                      <Option value="rabbit">{t('rabbit')}</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={t('hotel_type')}
                    name="hotelType"
                    rules={[{ required: true, message: t('choose_hotel') }]}
                  >
                    <Select placeholder={t('choose_hotel')} onChange={handleHotelTypeChange}>
                      {hotels.map(hotel => (
                        <Option key={hotel._id} value={hotel._id}>{hotel.HotelType}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label={t('price')}
                    name="price"
                  >
                    <Input value={price} readOnly placeholder={t('price')} />
                  </Form.Item>
                  <div className="flex items-center justify-center mb-4">
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800 focus:outline-none focus:shadow-outline"
                    >
                      {t('book')}
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-2xl py-4 px-6 bg-gray-900 text-white text-center font-bold uppercase">
          {t('pl_log_in')}
        </div>
      )}
    </div>
  );
};

// Dummy function to simulate an authentication check
const checkUserAuthentication = async () => {
  // Replace with your actual authentication logic
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true); // Simulate a successful login, change to false to simulate not logged in
    }, 1000);
  });
};

export default BookingForPet;
