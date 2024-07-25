import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Image, Form, Typography, message, Skeleton, Select, Modal, DatePicker, Row, Col, notification, InputNumber } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, ScheduleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { PayPalButtons } from "@paypal/react-paypal-js";

const { Title, Paragraph } = Typography;
const { Option } = Select;
const API_URL = import.meta.env.REACT_APP_API_URL;
const REACT_APP_EXCHANGE_RATE_API = import.meta.env.REACT_APP_EXCHANGE_RATE_API;

const SpaServiceDetail = () => {
    const { id } = useParams();
    const [serviceData, setServiceData] = useState(null);
    const [form] = Form.useForm();
    const [bookingForm] = Form.useForm();
    const [addPetForm] = Form.useForm();
    const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [operationLoading, setOperationLoading] = useState(false);
    const userRole = localStorage.getItem('role') || 'Guest';
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [exchangeRateVNDtoUSD, setExchangeRateVNDtoUSD] = useState(null)
    const accountID = user?.id;
    const [selectedPet, setSelectedPet] = useState(null);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const genders = ['Đực', 'Cái'];
    const [isPayPalButtonVisible, setIsPayPalButtonVisible] = useState(false);
    const currentDateTime = moment();
    const [caretakers, setCaretakers] = useState('');
    const availableTimes = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30"
    ];
    const { t } = useTranslation();
    const [currentPrice, setCurrentPrice] = useState(0);
    const currentPriceRef = useRef(currentPrice);

    // Update the ref whenever currentPrice changes
    useEffect(() => {
        currentPriceRef.current = currentPrice;
    }, [currentPrice]);

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/accounts/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Filter out Caretaker Staff accounts and map to include both id and name
            const caretakers = response.data.accounts
                .filter(account => account.role === 'Caretaker Staff')
                .map(account => ({
                    id: account.AccountID,
                    name: account.fullname
                }));
            setCaretakers(caretakers);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };
    

    const handleCaretakerChange = (value) => {
        const selectedCaretaker = caretakers.find(caretaker => caretaker.id === value);
        bookingForm.setFieldsValue({
            CaretakerID: selectedCaretaker ? selectedCaretaker.id : '',
            CaretakerNote: selectedCaretaker ? selectedCaretaker.name : ''
        });
        if (selectedPet && selectedPet.Weight) {
            updateCurrentPrice(selectedPet.Weight);
        }
        if (selectedPet && selectedPet.Weight) {
            updateCurrentPrice(selectedPet.Weight);
        }
    };
    

    const handlePetSelectChange = (value) => {
        const selectedPet = pets.find(pet => pet.PetID === value);
        setSelectedPet(selectedPet);
        bookingForm.setFieldsValue({
            PetID: selectedPet.PetID,
            PetName: selectedPet.PetName,
            PetGender: selectedPet.Gender,
            PetStatus: selectedPet.Status,
            PetWeight: selectedPet.Weight,
            PetAge: selectedPet.Age,
            PetTypeID: selectedPet.PetTypeID,
        });
        
        // Cập nhật giá dựa trên trọng lượng pet
        updateCurrentPrice(selectedPet.Weight);
        setOperationLoading(false);
        setIsPayPalButtonVisible(false);
    };


    useEffect(() => {
        const fetchExchangeRate = async () => {
          try {
            const response = await axios.get(`https://v6.exchangerate-api.com/v6/${REACT_APP_EXCHANGE_RATE_API}/latest/VND`);
            setExchangeRateVNDtoUSD(response.data.conversion_rates.USD);
          } catch (error) {
            console.error("Error fetching exchange rate:", error);
            message.error("Error fetching exchange rate.");
          }
        };
    
        fetchExchangeRate();
        fetchAccounts()
      }, []);

    // Hàm để cập nhật giá dựa trên trọng lượng
    const updateCurrentPrice = (weight) => {
        if (serviceData?.PriceByWeight) {
            const priceEntry = serviceData.PriceByWeight.find(
                ({ minWeight, maxWeight }) => weight >= minWeight && weight <= maxWeight
            );
    
            if (priceEntry) {
                setCurrentPrice(priceEntry.price);
            } else {
                setCurrentPrice(0); // Nếu không có giá tương ứng
            }
        }
    };

    const handlePetWeightChange = (weight) => {
        // Ensure the weight is valid
        if (!weight) {
            setCurrentPrice(0);
            return;
        }
    
        // Find the appropriate price based on weight
        if (serviceData?.PriceByWeight) {
            const priceEntry = serviceData.PriceByWeight.find(
                ({ minWeight, maxWeight }) => weight >= minWeight && weight <= maxWeight
            );
    
            if (priceEntry) {
                setCurrentPrice(priceEntry.price);
            } else {
                setCurrentPrice(0); // Default to 0 if no price is found
            }
        }
    };    

    useEffect(() => {
        if (bookingForm) {
            bookingForm.setFieldsValue({ TotalPrice: currentPrice });
        }
    }, [currentPrice, bookingForm]);

    const fetchServiceDetail = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/services/${id}`);
            setServiceData(response.data);
            form.setFieldsValue(response.data); // Set initial form values
            await fetchPets(response.data.PetTypeID); // Gọi fetchPets với PetTypeID từ serviceData
        } catch (error) {
            console.error('Error fetching service detail:', error);
            message.error(t('error_fetching_service_detail'));
        }
    };

    const fetchPets = async (petTypeID) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const accountID = user?.id; // Assuming `user` is defined in your component
            if (!token || !accountID) {
                console.error('Token or account ID not found in localStorage');
                return;
            }
    
            const response = await axios.get(`${API_URL}/api/pets/account/${accountID}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            // Filter pets based on petTypeID if provided
            let filteredPets = response.data;
            if (petTypeID) {
                filteredPets = response.data.filter(pet => pet.PetTypeID === petTypeID);
            }
    
            setPets(filteredPets);
        } catch (error) {
            console.error('Error fetching pets:', error);
            message.error('Failed to fetch pets');
        }
        setLoading(false);
    };
    

    useEffect(() => {
        fetchServiceDetail();
    }, [id, accountID]);

    const handleBookingNow = () => {
        if (!localStorage.getItem('user')) {
            showLoginModal();
            return;
        }
        setIsBookingModalVisible(true);
    };

    const handleAddPet = async () => {
        setOperationLoading(true);
        try {
            const values = await addPetForm.validateFields();
            const token = localStorage.getItem('token');

            const newPet = { ...values, AccountID: accountID };

            const response = await axios.post(
                `${API_URL}/api/pets`,
                newPet,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPets((prevPets) => [...prevPets, response.data]);
            setIsAddModalVisible(false);
            addPetForm.resetFields();
            message.success(t('pet_added_successfully'));
            fetchPets();
        } catch (info) {
            console.log('Validate Failed:', info);
        }
        setOperationLoading(false);
    };

    const handleBookingCancel = () => {
        setIsBookingModalVisible(false);
        setOperationLoading(false);
        setIsPayPalButtonVisible(false);
        setCurrentPrice(0)
        bookingForm.resetFields();
    };

    const showLoginModal = () => {
        Modal.info({
            title: 'Thông báo',
            content: (
                <div>
                    <p>{t('plz_login_or_register_to_buy')}</p>
                    <div className="flex justify-end">
                        <Button type="primary" onClick={() => {
                            navigate('/login');
                            Modal.destroyAll();
                        }}>{t('log_in')}</Button>
                        <Button onClick={() => {
                            navigate('/register');
                            Modal.destroyAll();
                        }} className="ml-2">{t('register')}</Button>
                    </div>
                </div>
            ),
            closable: true,
            maskClosable: true,
            footer: null,
        });
    };

    const handleBookingSubmit = async () => {
        try {
            setOperationLoading(true);
            const values = await bookingForm.validateFields();
            const token = localStorage.getItem('token');
            if (!token) {
                message.error(t('authorization_token_not_found'));
                return;
            }
    
            // Validate PetTypeID
            if (values.PetTypeID !== serviceData.PetTypeID) {
                message.error(t('pet_type_not_suitable_with_service'));
                setOperationLoading(false);
                return;
            }
    
            const bookingDate = values.BookingDate;
            const bookingTime = values.BookingTime;
    
            const bookingDateTime = moment(`${bookingDate.format('YYYY-MM-DD')} ${bookingTime}`, 'YYYY-MM-DD HH:mm');
            const currentDateTime = moment();
            const diffHours = bookingDateTime.diff(currentDateTime, 'hours');
    
            if (diffHours < 3) {
                message.error(t('3_hours_rule'));
                setOperationLoading(false);
                return;
            }
    
            // Check if booking can be made
            const checkResponse = await axios.post(`${API_URL}/api/Spa-bookings/check`, {
                BookingDate: bookingDate.format('YYYY-MM-DD'),
                BookingTime: bookingTime,
                PetID: values.PetID
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            if (!checkResponse.data.canBook) {
                message.error(checkResponse.data.message);
                setOperationLoading(false);
                return;
            }
            setIsPayPalButtonVisible(true); // Set this state to show the PayPal button
    
        } catch (error) {
            console.error('Error creating booking:', error);
            if (error.response) {
                const serverMessage = error.response.data.message || t('error_create_booking');
                message.error(serverMessage);
            }
            setOperationLoading(false);
        }
    };
    
    // Custom validation function
    const validatePetWeight = (rule, value) => {
        if (value < 0) {
        return Promise.reject(t('weight_must_be_positive'));
        }
        if (value > 35) {
        return Promise.reject(t('weight_must_be_less_than_35'));
        }
        return Promise.resolve();
    };

    const showAddPetModal = () => {
        setIsAddModalVisible(true);
        addPetForm.resetFields(); // Reset fields when the modal is shown
    };

    if (!serviceData) {
        return <Skeleton active />;
    }

    const createOrder = (data, actions) => {
        const latestPrice = currentPriceRef.current * exchangeRateVNDtoUSD; // Use ref to get latest value
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: latestPrice.toFixed(2),
                    },
                },
            ],
        });
    };

    const onApprove = async (data, actions) => {
        try {
            // Capture PayPal order
            const paypalOrder = await actions.order.capture();
        
            // Validate form fields
            const values = await bookingForm.validateFields();
            // Retrieve authorization token
            const token = localStorage.getItem('token');
            if (!token) {
            message.error(t('authorization_token_not_found'));
            return;
            }
            
                // Extract booking details
                const bookingDate = values.BookingDate;
                const bookingTime = values.BookingTime;
                const booking = {
                Status: 'Pending', // Initial status
                CreateDate: new Date(),
                BookingDate: bookingDate.format('YYYY-MM-DD'),
                BookingTime: bookingTime,
                TotalPrice: currentPriceRef.current,
                AccountID: accountID,
                PaypalOrderID: paypalOrder.purchase_units[0].payments.captures[0].id,
                CaretakerNote: values.CaretakerNote,
                CaretakerID: values.CaretakerID,
                CancelReason: "",
                StatusChanges: [{ Status: 'Pending', ChangeTime: new Date() }] // Initialize status changes
            };
        
            // Send booking data to backend
            const responseBooking = await axios.post(`${API_URL}/api/Spa-bookings`, booking, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            });
        
            // Prepare booking detail data
            const bookingDetail = {
            BookingID: responseBooking.data.BookingID,
            ...values,
            BookingDate: bookingDate.format('YYYY-MM-DD'),
            BookingTime: bookingTime,
            ServiceID: id,
            Feedback: "",
            isReview: false,
            };
        
            // Send booking detail data to backend
            const responseBookingDetail = await axios.post(`${API_URL}/api/spa-booking-details`, bookingDetail, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            });
        
            // Log response
            console.log(responseBookingDetail.data);
        
            // Display success notification
            notification.success({
            message: t('booking_success'),
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            description: 'Ấn vào đây để chuyển đến trang lịch sử dịch vụ',
            onClick: () => navigate('/spa-booking'),
            });
        
            // Reset booking modal and form
            setIsBookingModalVisible(false);
            bookingForm.resetFields();
            setOperationLoading(false);
            setIsPayPalButtonVisible(false);
            setCurrentPrice(0);
        } catch (error) {
            console.error("Error during PayPal checkout:", error);
            // Handle PayPal checkout error
            message.error("Đã xảy ra lỗi trong quá trình thanh toán với PayPal.");
        }
    };

    const onError = (err) => {
        message.error("Đã xảy ra lỗi trong quá trình thanh toán với PayPal.");
        console.error("Error during PayPal checkout:", err);
    };

    return ( caretakers &&
        <div className="relative">
            {/* Go back button */}
            <div className="flex flex-row md:flex-row m-5 px-4 md:px-32">
                <Button
                    onClick={() => navigate(-1)}
                    className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
                    icon={<ArrowLeftOutlined />}
                    size="large"
                >
                    {t('back')}
                </Button>
            </div>
            {/* Spa service detail */}
            <div className="flex flex-col md:flex-row m-5 px-4 md:px-32">
                <div className="w-full lg:w-1/2 h-full lg:h-1/2 flex justify-center">
                    <Image src={serviceData.ImageURL} alt={serviceData.ServiceName} />
                </div>
                <div className="w-full md:w-1/2 p-5 md:ml-10">
                <div>
                    <Title level={3}>{serviceData.ServiceName}</Title>
                    <Paragraph
                        style={{ whiteSpace: 'pre-line' }}
                        ellipsis={{ rows: 5, expandable: true, symbol: 'more' }}
                    >
                        {`Mô tả: ${serviceData.Description}`}
                    </Paragraph>
                    
                        {/* Display Price Ranges */}
                        <div className="mt-4">
                            <Title level={4}>Giá theo cân nặng:</Title>
                            {serviceData.PriceByWeight && serviceData.PriceByWeight.length > 0 ? (
                            serviceData.PriceByWeight.map(({ minWeight, maxWeight, price }, index) => (
                                <Paragraph key={index} className="mb-1">
                                <span className="font-semibold">
                                    {minWeight}kg - {maxWeight}kg:
                                </span>{" "}
                                {price.toLocaleString("en-US")}đ
                                </Paragraph>
                            ))
                            ) : (
                            <Paragraph>-</Paragraph>
                            )}
                        </div>
                    </div>
                    {userRole === 'Guest' || userRole === 'Customer' ? (
                        <>
                            <div className="flex space-x-4 justify-end">
                                <Button
                                    type="primary"
                                    onClick={handleBookingNow}
                                    disabled={serviceData.Status === 'Unavailable'}
                                    className='py-10 px-20'
                                    icon={<ScheduleOutlined style={{ fontSize: '24px' }}/>}
                                >
                                    {t('booking_now')}
                                </Button>
                            </div>
                            {serviceData.Status === 'Unavailable' && (
                                <p className="text-red-500 text-right">{t('service_unavailable')}</p>
                            )}
                        </>
                    ) : null}
                </div>
            </div>

            {/* Booking Modal */}
            <Modal
                title="Đặt lịch"
                visible={isBookingModalVisible}
                onCancel={handleBookingCancel}
                onOk={handleBookingSubmit}
                okText="Đặt lịch ngay"
                cancelText="Hủy"
                width={800} // Set modal width
                confirmLoading={operationLoading}
            >
                <Form form={bookingForm} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="CustomerName"
                                label={t('customer_name')}
                                rules={[{ required: true, message: t('plz_enter_customer_name') }]}
                                initialValue={user?.fullname}
                            >
                                <Input placeholder={t('enter_name')} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="Phone"
                                label={t('phone')}
                                rules={[{ required: true, message: t('plz_enter_phone_number') }]}
                                initialValue={user?.phone}
                            >
                                <Input placeholder={t('enter_phone')} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="BookingDate"
                                label={t('booking_date')}
                                rules={[{ required: true, message: t('plz_choose_booking_date') }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    disabledDate={(current) => {
                                        if (current && current < currentDateTime.startOf('day')) {
                                            return true;
                                        }
                                        if (current && current.isSame(currentDateTime, 'day')) {
                                            return current < currentDateTime;
                                        }
                                        return false;
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="BookingTime"
                                label={t('booking_time')}
                                rules={[{ required: true, message: t('plz_choose_booking_time') }]}
                            >
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder={t('choose_booking_time')}
                                >
                                    {availableTimes.map(time => (
                                        <Select.Option key={time} value={time}>{time}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetID"
                                label={t('my_pet')}
                                rules={[{ required: true, message: t('plz_choose_pet') }]}
                            >
                                <Select
                                    placeholder={t('choose_pet')}
                                    onChange={(value) => {
                                        if (value === "add_new_pet") {
                                            showAddPetModal();
                                        } else {
                                            handlePetSelectChange(value);
                                        }
                                    }}
                                >
                                    {pets.map((pet) => (
                                        <Option key={pet.PetID} value={pet.PetID}>
                                            {pet.PetName}
                                        </Option>
                                    ))}
                                    <Option value="add_new_pet">
                                        <span>{t('add_pet')}</span>
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetTypeID"
                                label={t('pet_type')}
                                rules={[{ required: true, message: t('plz_enter_pet_type') }]}
                            >
                                <Select placeholder={t('choose_pet_type')}>
                                    <Option value="PT001">{t('dog')}</Option>
                                    <Option value="PT002">{t('cat')}</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetGender"
                                label={t('pet_gender')}
                                rules={[{ required: true, message: t('plz_enter_pet_gender')}]}
                            >
                                <Select placeholder={t('choose_gender')}>
                                    <Option value="Đực">{t('male')}</Option>
                                    <Option value="Cái">{t('female')}</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetStatus"
                                label={t('pet_status')}
                                rules={[{ required: true, message: t('plz_enter_pet_status') }]}
                            >
                                <Input placeholder={t('enter_pet_status')} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                            name="PetWeight"
                            label={t('pet_weight')}
                            rules={[
                                { required: true, message: t('plz_enter_pet_weight') },
                                { validator: validatePetWeight }
                            ]}
                            >
                            <InputNumber
                                onChange={handlePetWeightChange}
                                className='min-w-full'
                                suffix="kg"
                                placeholder={t('enter_pet_weight')}
                            />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetAge"
                                label={t('pet_age')}
                                rules={[
                                  { required: true, message: t('plz_enter_pet_age') },
                                  { type: 'number', min: 0, message: t('age_must_be_positive') }
                                ]}
                            >
                                <InputNumber className='min-w-full' suffix={t('age')} placeholder={t('enter_pet_age')} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
        <Col xs={24} sm={12}>
            <Form.Item
                name="CaretakerID" 
                label={t('Nhân viên chăm sóc')}
                style={{ display: 'none' }} 
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="CaretakerNote"
                label={t('Nhân viên chăm sóc')}
            >
                <Select
                    placeholder={t('choose_caretaker')}
                    onChange={(value) => handleCaretakerChange(value)}
                >
                    {/* Empty option */}
                    <Select.Option value='' key="empty-option">
                        {t('[Trống]')}
                    </Select.Option>
                    
                    {/* Options for caretakers */}
                    {caretakers.map(caretaker => (
                        <Select.Option key={caretaker.id} value={caretaker.id}>
                            {caretaker.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Col>
    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="ServiceID" label={t('service_id')} initialValue={id} style={{ display: 'none' }}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetName"
                                label={t('pet_name')}
                                rules={[{ required: true, message: t('plz_enter_pet_name') }]}
                                style={{ display: 'none' }}
                            >
                                <Input placeholder={t('enter_pet_name')} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <div className="flex justify-end mt-4 mb-4">
                    <Typography.Text className="text-4xl text-green-600">
                        Tổng tiền: {currentPrice.toLocaleString("en-US")}đ
                    </Typography.Text>
                </div>
                {/* PayPal Buttons */}
                <div className="text-right">
                    {isPayPalButtonVisible && currentPrice > 0 && (
                        <>
                            <p className='text-left text-3xl mb-2'>Vui lòng thanh toán để đặt lịch: </p>
                            <PayPalButtons
                                createOrder={(data, actions) => createOrder(data, actions)}
                                onApprove={(data, actions) => onApprove(data, actions)}
                                onError={(err) => onError(err)}
                            />
                        </>
                    )}
                </div>

                {/* <Button type="primary" onClick={showAddPetModal} loading={operationLoading}>
                    Thêm thú cưng
                </Button> */}
            </Modal>

            {/* Add Pet */}
            <Modal
                title="Thêm thú cưng"
                visible={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
                confirmLoading={operationLoading}
                footer={[
                    <Button key="back" onClick={() => setIsAddModalVisible(false)}>
                        {t('cancel')}
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleAddPet} loading={operationLoading}>
                        {t('add')}
                    </Button>,
                ]}
            >
                <Form form={addPetForm} layout="vertical">
                    <Form.Item
                        name="PetName"
                        label={t('pet_name')}
                        rules={[{ required: true, message: t('not_null_pet_name') }]}
                    >
                        <Input placeholder={t('pet_name')} />
                    </Form.Item>
                    <Form.Item
                        name="PetTypeID"
                        label={t('choose_pet_type')}
                        rules={[{ required: true, message: t('not_null_pet_type') }]}
                    >
                        <Select placeholder={t('choose_pet_type')}>
                            <Option value="PT001">{t('dog')}</Option>
                            <Option value="PT002">{t('cat')}</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="Gender"
                        label={t('choose_gender')}
                        rules={[{ required: true, message: t('not_null_pet_gender') }]}
                    >
                       <Select placeholder={t('choose_gender')}>
                            {genders.map((gender, index) => (
                                <Option key={index} value={gender}>
                                    {gender}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="Status"
                        label={t('pet_status')}
                        rules={[{ required: true, message: t('not_null_pet_status') }]}
                    >
                       <Input placeholder={t('pet_status')} />
                    </Form.Item>
                    <Form.Item
                        name="Weight"
                        rules={[
                          { required: true, message: t('not_null_pet_weight') },
                          { type: 'number', min: 0, message: t('weight_must_be_positive') }
                        ]}
                        label={t('pet_weight')}
                    >
                        <InputNumber className='min-w-full' suffix="kg" placeholder={t('pet_weight')} />
                    </Form.Item>
                    <Form.Item
                        name="Age"
                        rules={[
                          { required: true, message: t('not_null_pet_age') },
                          { type: 'number', min: 0, message: t('age_must_be_positive') }
                        ]}
                        label={t('pet_age')}
                    >
                        <InputNumber className='min-w-full' suffix={t('age')} placeholder={t('pet_age')} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaServiceDetail;