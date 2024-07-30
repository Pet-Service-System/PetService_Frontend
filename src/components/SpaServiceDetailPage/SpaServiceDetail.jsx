import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Image, Form, Typography, message, Skeleton, Select, Modal, DatePicker, Row, Col, notification, InputNumber, Card, Checkbox } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, ScheduleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { PayPalButtons } from "@paypal/react-paypal-js";

const { Title, Paragraph, Text } = Typography;
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
    const [voucherCode, setVoucherCode] = useState("");
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
    const [isPolicyModalVisible, setIsPolicyModalVisible] = useState(false);
    const currentPriceRef = useRef(currentPrice);
    const [discountValue, setDiscountValue] = useState(0); // State for discount value
    const discountValueRef = useRef(discountValue);
    const [voucherID, setVoucherID] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const voucherIDref = useRef(voucherID);
    // const [subscriptionPlan, setSubscriptionPlan] = useState('none');
    // const [subscriptionDiscount, setSubscriptionDiscount] = useState(0); 
    // const subscriptionDiscountRef = useRef(subscriptionDiscount);

    useEffect(() => {
        voucherIDref.current = voucherID;
    }, [voucherID]);

    useEffect(() => {
        discountValueRef.current = discountValue;
      }, [discountValue]);

      const checkVoucher = async () => {
        try {
          if (voucherCode.trim() === '') {
            return;
          }
          const response = await axios.get(`${API_URL}/api/voucher/pattern/${voucherCode}`);
          const voucher = response.data;
          if(voucher.MinimumOrderValue > currentPriceRef.current){
            message.error("Giá trị đơn hàng không đủ để sử dụng voucher này");
            return
          }
    
          // Check if the voucher is valid and apply the discount
          if (voucher) {
            setDiscountValue(voucher.DiscountValue);
            setVoucherID(voucher.VoucherID); 
            message.success(t("voucher_applied"));
          } else {
            message.error(t("invalid_voucher"));
          }
        } catch (error) {
          console.error(`Error:`, error);
          message.error(t("invalid_voucher"));
        }
      };

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
        
        // Reset states and refs
        setCurrentPrice(0);
        currentPriceRef.current = 0;
    
        setDiscountValue(0);
        discountValueRef.current = 0;
    
        setVoucherCode('');
        setVoucherID(null);
        voucherIDref.current = null;
    
        setIsChecked(false);
        // setSubscriptionPlan('none');
        // setSubscriptionDiscount(0);
        // subscriptionDiscountRef.current = 0;
        // Reset forms
        bookingForm.resetFields();
        addPetForm.resetFields();
    
        // Clear selected pet
        setSelectedPet(null);
    
        // Reset modal visibility
        setIsAddModalVisible(false);
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

    const onCancelModal = () => {
        setIsPolicyModalVisible(false)
    };
    
    const handleChangeCheckBox = (e) => {
        setIsChecked(e.target.checked);
    };

    const createOrder = (data, actions) => {
        // const latestPrice = ((currentPriceRef.current - discountValueRef.current) - (currentPriceRef.current * subscriptionDiscountRef.current)) * exchangeRateVNDtoUSD;
        const latestPrice = (currentPriceRef.current - discountValueRef.current) * exchangeRateVNDtoUSD;
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
                BookingDate: bookingDate.format('DD/MM/YYYY'),
                BookingTime: bookingTime,
                TotalPrice: currentPriceRef.current,
                AccountID: accountID,
                PaypalOrderID: paypalOrder.purchase_units[0].payments.captures[0].id,
                CaretakerNote: values.CaretakerNote || null,
                CaretakerID: values.CaretakerID || null,
                CancelReason: "",
                Feedback: "",
                isReplied: false,
                VoucherID: voucherIDref.current,
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
                BookingDate: bookingDate.format('DD/MM/YYYY'),
                BookingTime: bookingTime,
                ServiceID: id,
                ActualWeight: ''
            };
        
            // Send booking detail data to backend
            await axios.post(`${API_URL}/api/spa-booking-details`, bookingDetail, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
    
        
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

    // const handleSubscriptionPlanChange = (value) => {
    //     let discount = 0;
    //     switch (value) {
    //         case '6months':
    //             discount = 0.03;
    //             break;
    //         case '9months':
    //             discount = 0.06;
    //             break;
    //         case '12months':
    //             discount = 0.09;
    //             break;
    //         default:
    //             discount = 0;
    //             break;
    //     }
    //     setSubscriptionPlan(value); 
    //     setSubscriptionDiscount(discount); 
    //     subscriptionDiscountRef.current = discount;
    //     console.log(subscriptionDiscountRef.current)
    // };

    function formatNumberWithCommas(number) {
    if (typeof number !== 'number') {
        return number;
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

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
                                {formatNumberWithCommas(price)}đ
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
                okButtonProps={{ disabled: !isChecked }}
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
                                <Input disabled={operationLoading} placeholder={t('enter_name')} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="Phone"
                                label={t('phone')}
                                rules={[{ required: true, message: t('plz_enter_phone_number') }]}
                                initialValue={user?.phone}
                            >
                                <Input disabled={operationLoading} placeholder={t('enter_phone')} />
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
                                    disabled={operationLoading}
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
                                    disabled={operationLoading}
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
                                    disabled={operationLoading}
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
                                <Select disabled={operationLoading} placeholder={t('choose_pet_type')}>
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
                                <Select disabled={operationLoading} placeholder={t('choose_gender')}>
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
                                <Input disabled={operationLoading} placeholder={t('enter_pet_status')} />
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
                                    disabled={operationLoading}
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
                                <InputNumber disabled={operationLoading} className='min-w-full' suffix={t('age')} placeholder={t('enter_pet_age')} />
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
                                    disabled={operationLoading}
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
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="VoucherCode"
                                label={t('voucher')}
                            >
                                <div className="relative">
                                    <Input
                                        disabled={operationLoading}
                                        placeholder={t('enter_voucher_code')}
                                        value={voucherCode}
                                        onChange={(e) => setVoucherCode(e.target.value)}
                                        className="pr-16"
                                    />
                                    <Button
                                        type="primary"
                                        onClick={checkVoucher}
                                        className="absolute right-0 top-0 bottom-0 rounded-l-none"
                                        disabled={currentPrice == 0 || operationLoading || !voucherCode}
                                        
                                    >
                                        {t('apply_voucher')}
                                    </Button>
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ServiceID"
                                label={t('service_id')}
                                initialValue={id}
                                style={{ display: 'none' }}
                            >
                                <Input disabled={operationLoading}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetName"
                                label={t('pet_name')}
                                rules={[{ required: true, message: t('plz_enter_pet_name') }]}
                                style={{ display: 'none' }}
                            >
                                <Input disabled={operationLoading} placeholder={t('enter_pet_name')} />
                            </Form.Item>
                        </Col>
                    </Row>
                    {/* <Row gutter={16}>
                        <Col xs={24} sm={12}>
                        <Form.Item
                            name="SubscriptionPlan"
                            label='Đăng ký định kỳ dịch vụ'
                        >
                            <Select
                                disabled={operationLoading}
                                placeholder={t('choose_subscription_plan')}
                                onChange={(value) => handleSubscriptionPlanChange(value)}
                                defaultValue="none"
                            >
                                <Select.Option value="none">Không</Select.Option>
                                <Select.Option value="6months">6 tháng</Select.Option>
                                <Select.Option value="9months">9 tháng</Select.Option>
                                <Select.Option value="12months">12 tháng</Select.Option>
                            </Select>
                        </Form.Item>
                        </Col>
                    </Row> */}
                    <Row>
                        <Col span={24}>
                            <Form.Item
                                name="TermsAndConditions"
                                valuePropName="checked"
                                rules={[{ required: true, message: "Vui lòng đồng ý với các điều khoản" }]}
                            >
                                <Checkbox disabled={operationLoading} className='font-normal' onChange={handleChangeCheckBox}>
                                    Tôi đồng ý với <a className='text-blue-600 underline' onClick={() => setIsPolicyModalVisible(true)}>các điều khoản và điều kiện</a>
                                </Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <Card className="flex flex-col md:ml-auto mt-4 mb-4 md:w-3/6 border-none">
                    {/* {(discountValue > 0 || subscriptionDiscount > 0) && currentPrice > 0 && (
                        <>
                            <div className="flex flex-row mb-2 justify-between">
                                <Text strong className='mr-1'>Thành tiền: </Text>
                                <Text>
                                    {formatNumberWithCommas(currentPrice)}đ
                                </Text>
                            </div>
                        </>
                    )}
                    {discountValue > 0 && currentPrice > 0 && (
                        <>
                            <div className="flex flex-row mb-2 justify-between">
                                <Text strong className='mr-1'>Áp dụng mã giảm giá:</Text>
                                <Text className="text-red-600">
                                    -{formatNumberWithCommas(discountValue)}đ
                                </Text>
                            </div>
                        </>
                    )}
                    {subscriptionDiscount > 0 && currentPrice > 0 && (
                        <>
                            <div className="flex flex-row mb-2 justify-between">
                                <Text strong className='mr-1'>Giảm giá đăng ký định kỳ:</Text>
                                <Text className="text-red-600">
                                    -{formatNumberWithCommas(currentPrice * subscriptionDiscount)}đ
                                </Text>
                            </div>
                        </>
                    )} */}
                    {discountValue > 0 && currentPrice > 0 && (
                        <>
                            <div className="flex flex-row mb-2 justify-between">
                                <Text strong className='mr-1'>Thành tiền: </Text>
                                <Text>
                                    {formatNumberWithCommas(currentPrice)}đ
                                </Text>
                            </div>
                            <div className="flex flex-row mb-2 justify-between">
                                <Text strong className='mr-1'>Áp dụng mã giảm giá:</Text>
                                <Text className="text-red-600">
                                    -{formatNumberWithCommas(discountValue)}đ
                                </Text>
                            </div>
                        </>
                    )}
                    <div className="flex flex-row mb-2 justify-between">
                        <Text strong className='mr-1 md:text-4xl text-3xl'>Tổng tiền:</Text>
                        <Text className="md:text-4xl text-3xl text-green-600">
                            {/* {formatNumberWithCommas(currentPrice - discountValue - currentPrice * subscriptionDiscount)}đ */}
                            {formatNumberWithCommas(currentPrice - discountValue)}đ
                        </Text>
                    </div>
                </Card>
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

            {/* Policy Modal */}
            <Modal
                title="Chính Sách"
                visible={isPolicyModalVisible}
                onCancel={onCancelModal}
                footer={null}
                width={800}
            >
                <div className="p-8 bg-gray-100 min-h-screen">
                    <Text>
                        <strong>1. Chính Sách Phí Chênh Lệch Cân Nặng</strong>
                        <br/>
                        Trong quá trình khách check-in, nếu cân nặng của thú cưng khác với cân nặng đăng ký, chúng tôi sẽ thu thêm hoặc trả lại phí chênh lệch theo bảng giá.
                        <br/>
                        - Phí chênh lệch sẽ được tính dựa trên mức giá đã được niêm yết và sẽ được thông báo rõ ràng cho khách hàng.
                        <br/>
                        <strong>2. Chính Sách Hoàn Tiền</strong>
                        <br/>
                        Chúng tôi hiểu rằng có thể có những tình huống không mong muốn xảy ra, và chúng tôi cam kết hoàn tiền theo chính sách dưới đây:
                        <br/>
                        <strong>3. Chính Sách Hoàn Tiền Theo Nguồn Hủy</strong>
                        <br/>
                        <strong>3.1 Hủy từ Khách Hàng</strong>
                        <br/>
                        Nếu khách hàng hủy lịch với các lý do dưới đây, chính sách hoàn tiền sẽ được áp dụng như sau:
                        <br/>
                        - Khách không đến tiệm để làm dịch vụ: Hoàn tiền 30% tổng số tiền đã thanh toán.
                        <br/>
                        - Khách liên hệ hủy lịch do sự cố hoặc không còn nhu cầu nữa: Hoàn tiền 100% tổng số tiền đã thanh toán.
                        <br/>
                        - Khách hủy lịch sau khi phát sinh chi phí: Hoàn tiền 70% tổng số tiền đã thanh toán.
                        <br/>
                        - Thú cưng không hợp tác: Hoàn tiền 90% tổng số tiền đã thanh toán.
                        <br/>
                        - Các lý do khác: Hoàn tiền sẽ được giải quyết tùy theo từng tình huống cụ thể. Quý khách vui lòng liên hệ trực tiếp với chúng tôi để thảo luận và giải quyết.
                        <br/>
                        <strong>3.2 Hủy từ Tiệm</strong>
                        <br/>
                        Nếu hủy lịch từ phía tiệm, khách hàng sẽ được hoàn tiền 100% tổng số tiền đã thanh toán.
                        <br/>
                        <strong>4. Quy Định Chung</strong>
                        <br/>
                        - Chính sách hoàn tiền có thể thay đổi tùy theo từng trường hợp cụ thể và theo quy định của pháp luật hiện hành.
                        <br/>
                        - Mọi yêu cầu hoàn tiền cần được gửi qua email hoặc liên hệ trực tiếp với chúng tôi trong thời gian quy định.
                    </Text>
                </div>
            </Modal>
        </div>
    );
};

export default SpaServiceDetail;