import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Button, Input, Modal, Form, Card, Skeleton, Image, message, Select } from 'antd';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const { Option } = Select;
const { Title } = Typography;

const SpaServiceList = () => {
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // State for API call status
  const [userRole] = useState(localStorage.getItem('role') || 'Guest');
  const [petTypeID] = useState('PT002');
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [addMode, setAddMode] = useState(false); // false: view mode, true: add mode
  const [form] = Form.useForm();
  const [serviceImg, setServiceImg] = useState(""); // For image upload
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/services');
        const filteredServices = response.data.filter(service => service.PetTypeID === petTypeID);
        setServiceData(filteredServices);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [petTypeID]);

  const handleServiceClick = (id) => {
    navigate(`/spa-service-detail/${id}`);
  };

  const handleAddClick = () => {
    setAddMode(true);
  };

  const handleCancelAdd = () => {
    setAddMode(false);
    form.resetFields();
    setServiceImg("");
  };

  const handleSaveAdd = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error(t('authorization_token_not_found'));
        return;
      }

      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('ServiceName', values.ServiceName);
      formData.append('Price', parseFloat(values.Price));
      formData.append('Description', values.Description);
      formData.append('PetTypeID', petTypeID);
      formData.append('Status', values.Status);
      if (serviceImg) {
        formData.append('image', serviceImg);
      } else {
        message.error(t('please_upload_service_image'));
        return;
      }
      message.warning(t('processing'));
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      const response = await axios.post('http://localhost:3001/api/services', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        message.success(t('service_added_successfully'), 0.5).then(() => {
          window.location.reload();
        });
      } else {
        message.error(t('failed_to_add_service'));
      }
    } catch (error) {
      console.error('Error adding service:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error(t('unauthorized_please_log_in'));
        } else if (error.response.data && error.response.data.message) {
          message.error(`${t('error_adding_service')}: ${error.response.data.message}`);
        } else {
          message.error(t('error_adding_service'));
        }
      } else if (error.request) {
        message.error(t('network_or_server_issue'));
      } else {
        message.error(`${t('error_adding_service')}: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (record) => {
    setEditMode(record.ServiceID);
    form.setFieldsValue({
      ServiceName: record.ServiceName,
      Price: record.Price,
      Description: record.Description,
      Status: record.Status,
    });
    setServiceImg("");
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
    setServiceImg("");
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error(t('authorization_token_not_found'));
        return;
      }

      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('service_name', values.ServiceName);
      formData.append('price', parseFloat(values.Price));
      formData.append('description', values.Description);
      formData.append('status', values.Status);
      if (serviceImg) {
        formData.append('image', serviceImg);
      }
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      message.warning(t('processing'));
      const response = await axios.patch(`http://localhost:3001/api/services/${editMode}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        message.success(t('service_updated_successfully'), 0.5).then(() => {
          window.location.reload();
        });
      } else {
        message.error(t('failed_to_update_service'));
      }
    } catch (error) {
      console.error('Error updating service:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error(t('unauthorized_please_log_in'));
        } else if (error.response.data && error.response.data.message) {
          message.error(`${t('error_updating_service')}: ${error.response.data.message}`);
        } else {
          message.error(t('error_updating_service'));
        }
      } else if (error.request) {
        message.error(t('network_or_server_issue'));
      } else {
        message.error(`${t('error_updating_service')}: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleServiceImageUpload = (e) => {
    const file = e.target.files[0];
    setServiceImg(file);
    form.setFieldsValue({ Image: file });
  };

  const columns = [
    {
      title: t('service_id'),
      dataIndex: 'ServiceID',
      key: 'ServiceID',
      render: (text, record) => (
        <div className='hover:text-sky-600 hover:cursor-pointer' onClick={() => handleServiceClick(record.ServiceID)}>
          {text}
        </div>
      ),
    },
    {
      title: t('service_name'),
      dataIndex: 'ServiceName',
      key: 'ServiceName',
      render: (text, record) => (
        <div className='hover:text-sky-600 hover:cursor-pointer' onClick={() => handleServiceClick(record.ServiceID)}>
          {text}
        </div>
      ),
    },
    {
      title: t('price'),
      dataIndex: 'Price',
      key: 'Price',
      render: (text) => (
        <span>{typeof text === 'number' ? `$${text.toFixed(2)}` : '-'}</span>
      ),
    },
    {
      title: t('description'),
      dataIndex: 'Description',
      key: 'Description',
    },
    {
      title: t('image_url'),
      dataIndex: 'ImageURL',
      key: 'ImageURL',
      render: (text, record) => (
        <Image src={text} alt={record.ServiceName} style={{ width: '50px', cursor: 'pointer' }} />
      ),
    },
    {
      title: t('status'),
      dataIndex: 'Status',
      key: 'Status',
      render: (text) => (
        <span style={{ color: text === 'Available' ? 'green' : text === 'Unavailable' ? 'red' : 'black' }}>
          {text}
        </span>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => (
        userRole === 'Store Manager' && (
          <div>
            <Button type="primary" onClick={() => handleEditClick(record)} style={{ marginRight: '8px' }}>{t('edit_service')}</Button>
          </div>
        )
      ),
    },
  ];
  return (
    <div className="p-10">
      <Title level={1} className="text-center">{t('service_list_title')}</Title>
      <Form form={form}>
        {userRole === 'Store Manager' ? (
          <>
            <Table
              dataSource={serviceData}
              columns={columns}
              rowKey="ServiceID"
              loading={loading}
              bordered
              scroll={{ x: 'max-content' }}
            />
            <div className="flex justify-end mt-4">
              <Button type="primary" onClick={handleAddClick} disabled={loading}>{t('add_service')}</Button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} style={{ width: 240 }}>
                  <Skeleton.Image style={{ width: 240, height: 150 }} />
                  <Skeleton active />
                </Card>
              ))
            ) : (
              serviceData.map(service => (
                <Card
                  key={service.ServiceID}
                  hoverable
                  className="bg-white rounded-lg shadow-md transition-transform transform-gpu hover:scale-105"
                  onClick={() => handleServiceClick(service.ServiceID)}
                >
                  <img 
                    alt={service.ServiceName} 
                    src={service.ImageURL} 
                    className="rounded-t-lg w-full h-44 object-cover" 
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{service.ServiceName}</h3>
                    <p className="text-gray-600 mt-2">${service.Price.toFixed(2)}</p>
                    <p className="text-gray-700 mt-2">{service.Description}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </Form>

      <Modal
        title={editMode ? t('edit_service') : t('add_new_service')}
        visible={addMode || editMode !== null}
        onCancel={editMode ? handleCancelEdit : handleCancelAdd}
        footer={[
          <Button key="cancel" onClick={editMode ? handleCancelEdit : handleCancelAdd} disabled={saving}>{t('cancel')}</Button>,
          <Button key="submit" type="primary" onClick={editMode ? handleSaveEdit : handleSaveAdd} disabled={saving}>
            {editMode ? t('save') : t('add')}
          </Button>,
        ]}
        style={{ textAlign: 'center' }}
      >
        <Form form={form} className="text-left">
          <Form.Item
            name="ServiceName"
            rules={[{ required: true, message: t('please_enter_service_name') }]}
          >
            <Input placeholder={t('service_name')} />
          </Form.Item>
          <Form.Item
            name="Price"
            rules={[{ required: true, message: t('please_enter_service_price') }]}
          >
            <Input placeholder={t('price')} />
          </Form.Item>
          <Form.Item
            name="Description"
            rules={[{ required: true, message: t('please_enter_service_description') }]}
          >
            <Input placeholder={t('description')} />
          </Form.Item>
          <Form.Item
            name="Image"
            rules={[{ required: true, message: t('please_upload_service_image') }]}
          >
            <Input type="file" onChange={handleServiceImageUpload} />
            {serviceImg && (
              <Image src={URL.createObjectURL(serviceImg)} alt={t('service_preview')} style={{ width: '100px', marginTop: '10px' }} />
            )}
          </Form.Item>
          <Form.Item
            name="Status"
            rules={[{ required: true, message: t('please_select_service_status') }]}
          >
            <Select placeholder={t('select_status')}>
              <Option value="Available">{t('available')}</Option>
              <Option value="Unavailable">{t('unavailable')}</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SpaServiceList;
