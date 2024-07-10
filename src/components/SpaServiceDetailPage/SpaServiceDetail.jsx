import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Image, Form, Typography, message, Skeleton, Select, Modal, DatePicker, Row, Col, notification } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, ScheduleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const API_URL = import.meta.env.REACT_APP_API_URL;

const SpaServiceDetail = () => {
    const { id } = useParams();
    const [serviceData, setServiceData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [bookingForm] = Form.useForm();
    const [addPetForm] = Form.useForm();
    const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
    const [pets, setPets] = useState([]);
    const [productImg, setProductImg] = useState(""); // For image upload
    const [loading, setLoading] = useState(false);
    const [operationLoading, setOperationLoading] = useState(false);
    const userRole = localStorage.getItem('role') || 'Guest';
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const accountID = user?.id;
    const [selectedPet, setSelectedPet] = useState(null);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const genders = ['Đực', 'Cái'];
    const currentDateTime = moment();
    const [saving, setSaving] = useState(false);
    const availableTimes = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30"
    ];
    const { t } = useTranslation();

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
    };

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

    const handleEditService = () => {
        setEditMode(true);
    };

    const handleCancelEdit = async () => {
        setEditMode(false);
        setProductImg("");
        await fetchServiceDetail(); // Reload service data from the database
    };

    const handleProductImageUpload = (e) => {
        const file = e.target.files[0];
        setProductImg(file);
        form.setFieldsValue({ Image: file });
    };

    const handleSaveEdit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error(t('authorization_token_not_found'));
                return;
            }

            const values = await form.validateFields(); // Validate form fields
            const updatedService = {
                ServiceName: values.ServiceName,
                // Price: parseFloat(values.Price),
                Description: values.Description,
                ImageURL: values.ImageURL,
                Status: values.Status
            };
            setSaving(true)
            await axios.patch(`${API_URL}/api/services/${id}`, updatedService, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            message.success(t('update_success'))
            setSaving(false)
            setEditMode(false)
            fetchServiceDetail();
        } catch (error) {
            console.error('Error updating service:', error);
            if (error.response && error.response.status === 401) {
                message.error('Unauthorized. Please log in.');
            } else {
                message.error(t('update_error'));
            }
            setSaving(false)
        }
    };

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

            const booking = {
                Status: 'Pending',
                CreateDate: new Date(),
                BookingDate: bookingDate.format('YYYY-MM-DD'),
                BookingTime: bookingTime,
                // TotalPrice: serviceData.Price,
                AccountID: accountID
            }

            const responseBooking = await axios.post(`${API_URL}/api/Spa-bookings`, booking, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const bookingDetail = {
                BookingID: responseBooking.data.BookingID,
                ...values,
                BookingDate: bookingDate.format('YYYY-MM-DD'),
                BookingTime: bookingTime,
                ServiceID: id,
                Feedback: "",
                isReview: false,
            };

            const responseBookingDetail = await axios.post(`${API_URL}/api/spa-booking-details`, bookingDetail, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log(responseBookingDetail.data)

            // Show success notification
            notification.success({
                message: t('booking_success'),
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                description: 'Ấn vào đây để chuyển đến trang lịch sử dịch vụ',
                onClick: () => navigate('/spa-booking'),
            });

            setIsBookingModalVisible(false);
            bookingForm.resetFields();
            setOperationLoading(false);
        } catch (error) {
            console.error('Error creating booking:', error);
            message.error(t('error_create_booking'));
            setOperationLoading(false);
        }
        setOperationLoading(false);
    };

    const showAddPetModal = () => {
        setIsAddModalVisible(true);
        addPetForm.resetFields(); // Reset fields when the modal is shown
    };

    if (!serviceData) {
        return <Skeleton active />;
    }

    return (
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
                    {userRole === 'Store Manager' ? (
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="ServiceName"
                                label={t('service_name')}
                                rules={[{ required: true, message: t('enter_service_name') }]}
                            >
                                <Input disabled={!editMode} />
                            </Form.Item>
                            {/* <Form.Item
                                name="Price"
                                label="Giá"
                                rules={[{ required: true, message: 'Hãy nhập giá dịch vụ!' }]}
                            >
                                <Input type="number" disabled={!editMode} />
                            </Form.Item> */}
                            <Form.Item
                                name="Description"
                                label={t('description')}
                                rules={[{ required: true, message:  t('enter_service_description') }]}
                            >
                                <TextArea disabled={!editMode} rows={10} placeholder={t('description')} style={{ whiteSpace: 'pre-wrap' }} />
                            </Form.Item>
                            <Form.Item
                                    name="Image"
                                    label={t('image')}
                                    rules={[{ required: editMode == null, message: t('Please upload the product image!') }]}
                                    className="mb-4"
                                >
                                    <Input disabled={!editMode} type="file" onChange={handleProductImageUpload} className="w-full p-2 border border-gray-300 rounded" />
                                    {productImg && (
                                    <Image src={URL.createObjectURL(productImg)} alt="Product Preview" style={{ width: '100px', marginTop: '10px' }} className="block" />
                                    )}
                                </Form.Item>
                            <Form.Item
                                name="Status"
                                label={t('status')}
                                rules={[{ required: true, message: t('please_select_status') }]}
                            >
                                <Select placeholder={t('select_status')} disabled={!editMode}>
                                    <Option value="Available">{t('available')}</Option>
                                    <Option value="Unavailable">{t('unavailable')}</Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    ) : (
                        <div>
                            <Title level={3}>{serviceData.ServiceName}</Title>
                            {/* <Paragraph className="text-green-600 text-4xl">${serviceData.Price}</Paragraph> */}
                            <Paragraph style={{ whiteSpace: 'pre-line' }} ellipsis={{ rows: 5, expandable: true, symbol: 'more' }}>
                                {`Mô tả: ${serviceData.Description}`}
                            </Paragraph>
                        </div>
                    )}

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
                    ) : userRole === 'Store Manager' ? (
                        editMode ? (
                            <div className="flex space-x-4 justify-end">
                                <Button type="primary" onClick={handleSaveEdit} disabled={saving}>{t('save')}</Button>
                                <Button onClick={handleCancelEdit} disabled={saving}>{t('cancel')}</Button>
                            </div>
                        ) : (
                            <div className="flex space-x-4 justify-end">
                                <Button type="primary" onClick={handleEditService}>{t('edit')}</Button>
                            </div>
                        )
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
                                rules={[{ required: true, message: t('unavailaplz_enter_customer_nameble') }]}
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
                                label={t('pet')}
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
                                rules={[{ required: true, message: t('plz_enter_pet_weight') }]}
                            >
                                <Input suffix="kg" placeholder={t('enter_pet_weight')} type="number" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetAge"
                                label={t('pet_age')}
                                rules={[{ required: true, message: t('plz_enter_pet_age') }]}
                            >
                                <Input suffix="tuổi" placeholder={t('enter_pet_weight')} type="number" />
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
                    <Form.Item name="PetName" rules={[{ required: true, message: t('not_null_pet_name') }]}>
                        <Input placeholder={t('pet_name')} />
                    </Form.Item>
                    <Form.Item name="PetTypeID" rules={[{ required: true, message: t('not_null_pet_type') }]}>
                        <Select placeholder={t('choose_pet_type')}>
                            <Option value="PT001">{t('dog')}</Option>
                            <Option value="PT002">{t('cat')}</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="Gender" rules={[{ required: true, message: t('not_null_pet_gender') }]}>
                        <Select placeholder={t('choose_gender')}>
                            {genders.map((gender, index) => (
                                <Option key={index} value={gender}>
                                    {gender}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="Status" rules={[{ required: true, message: t('not_null_pet_status') }]}>
                        <Input placeholder={t('pet_status')} />
                    </Form.Item>
                    <Form.Item name="Weight" rules={[{ required: true, message: t('not_null_pet_weight') }]}>
                        <Input placeholder={t('pet_weight')} type="number" />
                    </Form.Item>
                    <Form.Item name="Age" rules={[{ required: true, message: t('not_null_pet_age') }]}>
                        <Input placeholder={t('pet_age')} type="number" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaServiceDetail;