import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Image, Form, Typography, message, Skeleton, Select, Modal, DatePicker, Row, Col, notification } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input

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
    const user = JSON.parse(localStorage.getItem('user'));
    const accountID = user?.id;
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
                message.error('Authorization token not found. Please log in.');
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

            await axios.patch(`http://localhost:3001/api/services/${id}`, updatedService, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            message.success('Service updated successfully')
            setEditMode(false)
            fetchServiceDetail();
        } catch (error) {
            console.error('Error updating service:', error);
            if (error.response && error.response.status === 401) {
                message.error('Unauthorized. Please log in.');
            } else {
                message.error('Error updating service');
            }
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
            message.success('Pet added successfully');
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
                    <p>Vui lòng đăng nhập hoặc đăng ký để mua hàng.</p>
                    <div className="flex justify-end">
                        <Button type="primary" onClick={() => {
                            navigate('/login');
                            Modal.destroyAll();
                        }}>Đăng nhập</Button>
                        <Button onClick={() => {
                            navigate('/register');
                            Modal.destroyAll(); 
                        }} className="ml-2">Đăng ký</Button>
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
                message.error('Authorization token not found. Please log in.');
                return;
            }

            // Validate PetTypeID
            if (values.PetTypeID !== serviceData.PetTypeID) {
                message.error('Loại thú cưng không phù hợp với loại dịch vụ.');
                setOperationLoading(false);
                return;
            }

            const bookingDate = values.BookingDate;
            const bookingTime = values.BookingTime;

            const bookingDateTime = moment(`${bookingDate.format('YYYY-MM-DD')} ${bookingTime}`, 'YYYY-MM-DD HH:mm');
            const currentDateTime = moment();
            const diffHours = bookingDateTime.diff(currentDateTime, 'hours');

            if (diffHours < 3) {
                message.error('Bạn chỉ có thể đặt lịch từ 3 tiếng trở đi từ thời điểm hiện tại.');
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
                message: 'Booking successful',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                description: 'Ấn vào đây để chuyển đến trang lịch sử dịch vụ',
                onClick: () => navigate('/spa-booking'), 
            });
            
            setIsBookingModalVisible(false);
            bookingForm.resetFields();
            setOperationLoading(false);
        } catch (error) {
            console.error('Error creating booking:', error);
            message.error('Error creating booking');
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
            <div className="flex flex-row md:flex-row m-5 px-4 md:px-32">
                <Button
                    onClick={() => navigate(-1)}
                    className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
                    icon={<ArrowLeftOutlined />}
                    size="large"
                >
                    Quay về
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
                            {/* <Form.Item
                                name="Price"
                                label="Giá"
                                rules={[{ required: true, message: 'Hãy nhập giá dịch vụ!' }]}
                            >
                                <Input type="number" disabled={!editMode} />
                            </Form.Item> */}
                            <Form.Item
                                name="Description"
                                label="Mô tả"
                                rules={[{ required: true, message: 'Hãy nhập mô tả dịch vụ!' }]}
                            >
                                <TextArea disabled={!editMode} rows={10} placeholder="Description" style={{ whiteSpace: 'pre-wrap' }} />
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
                                    <Option value="Available">Available</Option>
                                    <Option value="Unavailable">Unavailable</Option>
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
                                >
                                    Booking Now
                                </Button>
                            </div>
                            {serviceData.Status === 'Unavailable' && (
                                <p className="text-red-500 text-right">Dịch vụ tạm ngưng.</p>
                            )}
                        </>
                    ) : userRole === 'Store Manager' ? (
                        editMode ? (
                            <div className="flex space-x-4 justify-end">
                                <Button type="primary" onClick={handleSaveEdit}>Lưu</Button>
                                <Button onClick={handleCancelEdit}>Hủy</Button>
                            </div>
                        ) : (
                            <div className="flex space-x-4 justify-end">
                                <Button type="primary" onClick={handleEditService}>Sửa</Button>
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
                                label="Tên khách hàng"
                                rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
                            >
                                <Input placeholder="Nhập tên"/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="Phone"
                                label="Số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                            >
                                <Input placeholder="Nhập số điện thoại"/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="BookingDate"
                                label="Ngày đặt"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày đặt!' }]}
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
                                label="Khung giờ"
                                rules={[{ required: true, message: 'Vui lòng chọn khung giờ!' }]}
                            >
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Chọn khung giờ"
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
                                label="Thú cưng"
                                rules={[{ required: true, message: 'Vui lòng chọn thú cưng!' }]}
                            >
                                <Select
                                    placeholder="Chọn thú cưng"
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
                                        <span>Thêm thú cưng</span>
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetTypeID"
                                label="Loại thú cưng"
                                rules={[{ required: true, message: 'Vui lòng nhập loại thú cưng!' }]}
                            >
                                <Select placeholder="Chọn loại động vật">
                                    <Option value="PT001">Chó</Option>
                                    <Option value="PT002">Mèo</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetGender"
                                label="Giới tính"
                                rules={[{ required: true, message: 'Vui lòng chọn giới tính thú cưng!' }]}
                            >
                                <Select placeholder="Chọn giới tính">
                                    <Option value="Đực">Đực</Option>
                                    <Option value="Cái">Cái</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetStatus"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng nhập trạng thái thú cưng!' }]}
                            >
                                <Input placeholder='Nhập trạng thái thú cưng'/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetWeight"
                                label="Cân nặng"
                                rules={[{ required: true, message: 'Vui lòng nhập cân nặng thú cưng!' }]}
                            >
                                <Input placeholder='Nhập cân nặng động vật' type="number"/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetAge"
                                label="Tuổi"
                                rules={[{ required: true, message: 'Vui lòng nhập tuổi thú cưng!' }]}
                            >
                                <Input placeholder='Nhập tuổi động vật' type="number"/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="ServiceID" label="Service ID" initialValue={id} style={{ display: 'none' }}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="PetName"
                                label="Tên thú cưng"
                                rules={[{ required: true, message: 'Vui lòng nhập tên thú cưng!' }]}
                                style={{ display: 'none' }}
                            >
                                <Input placeholder='Nhập tên thú cưng'/>
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
                    Hủy
                </Button>,
                <Button key="submit" type="primary" onClick={handleAddPet} loading={operationLoading}>
                    Thêm
                </Button>,
                ]}
            >
                <Form form={addPetForm} layout="vertical">
                <Form.Item name="PetName" rules={[{ required: true, message: 'Tên không được để trống' }]}>
                    <Input placeholder="Tên" />
                </Form.Item>
                <Form.Item name="PetTypeID" rules={[{ required: true, message: 'Loại thú cưng không được để trống' }]}>
                    <Select placeholder="Chọn loại thú cưng">
                    <Option value="PT001">Chó</Option>
                    <Option value="PT002">Mèo</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="Gender" rules={[{ required: true, message: 'Giới tính không được để trống' }]}>
                    <Select placeholder="Chọn giới tính">
                    {genders.map((gender, index) => (
                        <Option key={index} value={gender}>
                        {gender}
                        </Option>
                    ))}
                    </Select>
                </Form.Item>
                <Form.Item name="Status" rules={[{ required: true, message: 'Trạng thái không được để trống' }]}>
                    <Input placeholder="Trạng thái" />
                </Form.Item>
                <Form.Item name="Weight" rules={[{ required: true, message: 'Cân nặng không được để trống' }]}>
                    <Input placeholder="Cân nặng" type="number" />
                </Form.Item>
                <Form.Item name="Age" rules={[{ required: true, message: 'Tuổi không được để trống' }]}>
                    <Input placeholder="Tuổi" type="number" />
                </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaServiceDetail;
