import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Image, Form, Typography, message, Skeleton, Select } from 'antd';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ServiceDetail = () => {
    const { id } = useParams();
    const [serviceData, setServiceData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const userRole = localStorage.getItem('role') || 'Guest';

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

    useEffect(() => {
        fetchServiceDetail();
        console.log(serviceData)
    }, [id, form]);

    const handleEditService = () => {
        setEditMode(true);
    };

    const handleCancelEdit = async () => {
        setEditMode(false);
        await fetchServiceDetail(); // Reload service data from the database
    };

    const handleSaveEdit = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authorization token not found. Please log in.');
                return;
            }

            const values = await form.validateFields(); // Validate form fields
            const updatedService = {
                ServiceName: values.ServiceName,
                Price: parseFloat(values.Price),
                Description: values.Description,
                ImageURL: values.ImageURL,
                Status: values.Status
            };

            await axios.patch(`http://localhost:3001/api/services/${id}`, updatedService, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            message.success('Service updated successfully', 0.5).then(() => {
                window.location.reload(); // Reload the page after successful update
            });
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
        console.log('Booked:', serviceData);
        // Add booking functionality here
    };

    if (!serviceData) {
        return <Skeleton active />;
    }

    return (
        <div className="flex flex-col md:flex-row m-5 py-36 px-4 md:px-32">
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
                                <Option value="Available">Available</Option>
                                <Option value="Unavailable">Unavailable</Option>
                            </Select>
                            </Form.Item>
                    </Form>
                ) : (
                    <div>
                        <Title level={3}>{serviceData.ServiceName}</Title>
                        <Paragraph>{`Giá: ${serviceData.Price}`}</Paragraph>
                        <Paragraph>{`Mô tả: ${serviceData.Description}`}</Paragraph>
                    </div>
                )}

                {userRole === 'Guest' || userRole === 'Customer' ? (
                    <>
                        <div className='flex space-x-4 justify-end'>
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
                            <Button type="primary" onClick={() => handleSaveEdit(id)}>Lưu</Button>
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
    );
};

export default ServiceDetail;
