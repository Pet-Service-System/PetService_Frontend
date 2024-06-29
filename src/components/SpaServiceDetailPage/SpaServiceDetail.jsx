import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Image, Form, Typography, message, Skeleton, Select } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Title, Paragraph } = Typography;
const { Option } = Select;


const SpaServiceDetail = () => {
    const { id } = useParams();
    const [serviceData, setServiceData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const userRole = localStorage.getItem('role') || 'Guest';
    const navigate = useNavigate();
    const { t } = useTranslation();

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
      }, [id]);
    
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
        console.log('Booked:', serviceData);
        navigate(`/pet-booking`);
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
                    label={t('service_name')}
                    rules={[{ required: true, message: t('enter_service_name') }]}
                  >
                    <Input disabled={!editMode} />
                  </Form.Item>
                  <Form.Item
                    name="Price"
                    label={t('price')}
                    rules={[{ required: true, message: t('enter_price') }]}
                  >
                    <Input type="number" disabled={!editMode} />
                  </Form.Item>
                  <Form.Item
                    name="Description"
                    label={t('description')}
                    rules={[{ required: true, message: t('enter_description') }]}
                  >
                    <Input disabled={!editMode} />
                  </Form.Item>
                  <Form.Item
                    name="ImageURL"
                    label={t('image')}
                    rules={[{ required: true, message: t('upload_image') }]}
                  >
                    <Input disabled={!editMode} />
                  </Form.Item>
                  <Form.Item
                    name="Status"
                    label={t('status')}
                    rules={[{ required: true, message: t('select_status') }]}
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
                  <Paragraph>{`${t('price')}: ${serviceData.Price}`}</Paragraph>
                  <Paragraph>{`${t('description')}: ${serviceData.Description}`}</Paragraph>
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
                    <Button type="primary" onClick={() => handleSaveEdit(id)}>
                      {t('save')}
                    </Button>
                    <Button onClick={handleCancelEdit}>{t('cancel')}</Button>
                  </div>
                ) : (
                  <div className="flex space-x-4 justify-end">
                    <Button type="primary" onClick={handleEditService}>
                      {t('edit')}
                    </Button>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      );
    };
    
    export default SpaServiceDetail;