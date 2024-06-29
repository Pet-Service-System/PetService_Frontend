import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Image, Form, Typography, message, Skeleton, Select, Modal, DatePicker, Row, Col, notification } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

import { useTranslation } from 'react-i18next';
const { Title, Paragraph } = Typography;
const { Option } = Select;


const SpaServiceDetail = () => {
    const { id } = useParams();
    const [serviceData, setServiceData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [bookingForm] = Form.useForm();
    const [addPetForm] = Form.useForm();
    const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [operationLoading, setOperationLoading] = useState(false);
    const userRole = localStorage.getItem('role') || 'Guest';
    const navigate = useNavigate();
    const { t } = useTranslation();
    const user = JSON.parse(localStorage.getItem('user'));
    const accountID = user.id;
    const [selectedPet, setSelectedPet] = useState(null);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const genders = ['Đực', 'Cái'];
    const currentDateTime = moment();
    const availableTimes = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30"
    ];

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
            const response = await axios.get(`http://localhost:3001/api/services/${id}`);
            setServiceData(response.data);
            form.setFieldsValue(response.data); // Set initial form values
        } catch (error) {
            console.error('Error fetching service detail:', error);
            message.error('Error fetching service detail');
        }
    };

    const fetchPets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token || !accountID) {
                console.error('Token or account ID not found in localStorage');
                return;
            }

            const response = await axios.get(`http://localhost:3001/api/pets/account/${accountID}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPets(response.data);
        } catch (error) {
            console.error('Error fetching pets:', error);
            message.error('Failed to fetch pets');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchServiceDetail();
        fetchPets();
    }, [id, accountID]);

    const handleEditService = () => {
        setEditMode(true);
    };

    const handleCancelEdit = async () => {
        setEditMode(false);
        await fetchServiceDetail(); // Reload service data from the database
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
                Price: parseFloat(values.Price),
                Description: values.Description,
                ImageURL: values.ImageURL,
                Status: values.Status,
            };

            await axios.patch(`http://localhost:3001/api/services/${id}`, updatedService, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            message.success(t('service_updated_successfully'), 0.5).then(() => {
                window.location.reload(); // Reload the page after successful update
            });
        } catch (error) {
            console.error('Error updating service:', error);
            if (error.response && error.response.status === 401) {
                message.error(t('unauthorized'));
            } else {
                message.error(t('error_updating_service'));
            }
        }
    };

    const handleBookingNow = () => {
        setIsBookingModalVisible(true);
    };

    const handleAddPet = async () => {
        setOperationLoading(true);
        try {
            const values = await addPetForm.validateFields();
            const token = localStorage.getItem('token');

            const newPet = { ...values, AccountID: accountID };

            const response = await axios.post(
                'http://localhost:3001/api/pets',
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

    const handleBookingSubmit = async () => {
        try {
            const values = await bookingForm.validateFields();
            const token = localStorage.getItem('token');
            if (!token) {
                message.error(t('authorization_token_not_found'));
                return;
            }
            const bookingDate = values.BookingDate;
            const bookingTime = values.BookingTime;

            const bookingDateTime = moment(`${bookingDate.format('YYYY-MM-DD')} ${bookingTime}`, 'YYYY-MM-DD HH:mm');
            const currentDateTime = moment();
            const diffHours = bookingDateTime.diff(currentDateTime, 'hours');

            if (diffHours < 3) {
                message.error(t('3_hours_rule'));
                return;
            }

            const booking = {
                Status: 'Pending',
                CreateDate: new Date(),
                TotalPrice: serviceData.Price,
                AccountID: accountID
            }

            const responseBooking = await axios.post(`http://localhost:3001/api/Spa-bookings`, booking, {
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

            const responseBookingDetail = await axios.post(`http://localhost:3001/api/spa-booking-details`, bookingDetail, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log(responseBookingDetail.data)

            // Show success notification
            notification.success({
                message: t('booking_success'),
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                description: t('press_to_direct_to_service_history'),
                onClick: () => navigate('/spa-booking'),
            });

            setIsBookingModalVisible(false);
            bookingForm.resetFields();
        } catch (error) {
            console.error('Error creating booking:', error);
            message.error(t('error_create_booking'));
        }
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
            <div className="flex flex-col md:flex-row m-5 px-4 md:px-32">
                <div className="w-full md:w-1/2 flex justify-center">
                    <Image src={serviceData.ImageURL} alt={serviceData.ServiceName} />
                </div>
                <div className="w-full md:w-1/2 p-5 md:ml-10">
                    {userRole === 'Store Manager' ? (
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="ServiceName"
                                label="Tên dịch vụ"
                                rules={[{ required: true, message: 'Hãy nhập tên dịch vụ!' }]}
                            >
                                <Input disabled={!editMode} />
                            </Form.Item>
                            <Form.Item
                                name="Price"
                                label="Giá"
                                rules={[{ required: true, message: 'Hãy nhập giá dịch vụ!' }]}
                            >
                                <Input type="number" disabled={!editMode} />
                            </Form.Item>
                            <Form.Item
                                name="Description"
                                label="Mô tả"
                                rules={[{ required: true, message: 'Hãy nhập mô tả dịch vụ!' }]}
                            >
                                <Input disabled={!editMode} />
                            </Form.Item>
                            <Form.Item
                                name="ImageURL"
                                label="Hình ảnh"
                                rules={[{ required: true, message: 'Hãy tải hình ảnh dịch vụ!' }]}
                            >
                                <Input disabled={!editMode} />
                            </Form.Item>
                            <Form.Item
                                name="Status"
                                label="Status"
                                rules={[{ required: true, message: 'Please select the service status!' }]}
                            >
                                <Select placeholder="Select Status" disabled={!editMode}>
                                    <Option value="Available">{t('available')}</Option>
                                    <Option value="Unavailable">{t('unavailable')}</Option>
                                </Select>
                            </Form.Item>
                        </Form>
                    ) : (
                        <div>
                            <Title level={3}>{serviceData.ServiceName}</Title>
                            <Paragraph className="text-green-600 text-4xl">${serviceData.Price}</Paragraph>
                            <Paragraph>{`Mô tả: ${serviceData.Description}`}</Paragraph>
                        </div>
                    )}

                    {userRole === 'Guest' || userRole === 'Customer' ? (
                        <>
                            <div className="flex space-x-4 justify-end">
                                <Button
                                    type="primary"
                                    onClick={handleBookingNow}
                                    disabled={serviceData.Status === 'Unavailable'}
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
                                <Button type="primary" onClick={handleSaveEdit}>{t('save')}</Button>
                                <Button onClick={handleCancelEdit}>{t('cancel')}</Button>
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
            >
                <Form form={bookingForm} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="CustomerName"
                                label={t('customer_name')}
                                rules={[{ required: true, message: t('plz_enter_customer_name') }]}
                            >
                                <Input placeholder={t('enter_name')} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="Phone"
                                label={t('phone_number')}
                                rules={[{ required: true, message: t('plz_enter_phone_number') }]}
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
                                    {availableTimes.map(time => {
                                        return <Select.Option key={time} value={time}>{time}</Select.Option>;
                                    })}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetID"
                                label={t('choose_pet')}
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
                                    className="relative rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    {pets.map((pet) => (
                                        <Option key={pet.PetID} value={pet.PetID} className="text-gray-900">
                                            {pet.PetName}
                                        </Option>
                                    ))}
                                    <Option value="add_new_pet">
                                        <span className="text-gray-400">{t('add_pet')}</span>
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="ServiceID" label="Service ID" initialValue={id} hidden>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetName"
                                label={t('pet_name')}
                                rules={[{ required: true, message: t('plz_enter_pet_name') }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetGender"
                                label={t('pet_gender')}
                                rules={[{ required: true, message: t('plz_enter_pet_gender') }]}
                            >
                                <Select placeholder={t('choose_gender')}>
                                    <Option value="Đực">{t('male')}</Option>
                                    <Option value="Cái">{t('female')}</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetStatus"
                                label={t('pet_status')}
                                rules={[{ required: true, message: t('plz_enter_pet_status') }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetWeight"
                                label={t('pet_weight')}
                                rules={[{ required: true, message: t('plz_enter_pet_weight') }]}
                            >
                                <Input type="number" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetAge"
                                label={t('pet_age')}
                                rules={[{ required: true, message: t('plz_enter_pet_age') }]}
                            >
                                <Input type="number" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetTypeID"
                                label={t('pet_type')}
                                rules={[{ required: true, message: t('plz_enter_pet_type') }]}
                            >
                                <Select placeholder="Chọn loại động vật">
                                    <Option value="PT001">{t('dog')}</Option>
                                    <Option value="PT002">{t('cat')}</Option>
                                </Select>
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
                title={t('add_pet')}
                visible={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
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
                        <Input placeholder={t('name')} />
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
                        <Input placeholder={t('status')} />
                    </Form.Item>
                    <Form.Item name="Weight" rules={[{ required: true, message: t('not_null_pet_weight') }]}>
                        <Input placeholder={t('weight')} type="number" />
                    </Form.Item>
                    <Form.Item name="Age" rules={[{ required: true, message: t('not_null_pet_age') }]}>
                        <Input placeholder={t('age')} type="number" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaServiceDetail;