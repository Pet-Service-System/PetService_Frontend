import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Button, Input, Modal, Form, Card, Skeleton, Image, message, Select } from 'antd';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const { Option } = Select;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Search } = Input;
const API_URL = import.meta.env.REACT_APP_API_URL;

const SpaServiceList = () => {
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // State for API call status
  const [userRole] = useState(localStorage.getItem('role') || 'Guest');
  const [petTypeID] = useState('PT001');
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [addMode, setAddMode] = useState(false); // false: view mode, true: add mode
  const [form] = Form.useForm();
  const [serviceImg, setServiceImg] = useState(""); // For image upload
  const navigate = useNavigate();
  const [filteredServices, setfilteredServices] = useState([]); // State for filtered data
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const { t } = useTranslation();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/services`);
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

  useEffect(() => {
    const filteredData = serviceData.filter(service =>
      service.ServiceName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setfilteredServices(filteredData);
  }, [searchQuery, serviceData]);


  const handleServiceClick = (id) => {
    navigate(`/spa-service-detail/${id}`);
  };

  const handleAddClick = () => {
    setAddMode(true);
  };

  const handleCancelAdd = () => {
    setAddMode(false);
    form.resetFields();
    setServiceImg(""); // Reset image state
  };

  const handleSaveAdd = async () => {
    try {
      setSaving(true); // Start saving
      const token = localStorage.getItem('token');
      if (!token) {
        message.error(t('auth_error'));
        return;
      }

      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('ServiceName', values.ServiceName);
      // formData.append('Price', parseFloat(values.Price));
      formData.append('Description', values.Description);
      formData.append('PetTypeID', petTypeID);
      formData.append('Status', values.Status);
      if (serviceImg) {
        formData.append('image', serviceImg);
      } else {
        message.error(t('image_error'));
        return;
      }
      message.warning(t('processing'));
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      const response = await axios.post(`${API_URL}/api/services`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        message.success(t('add_success')).then(() => {
          window.location.reload();
        });
      } else {
        message.error(t('add_fail'));
      }
    } catch (error) {
      console.error('Error adding service:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error(t('unauthorized'));
        } else if (error.response.data && error.response.data.message) {
          message.error(`${t('add_error')}: ${error.response.data.message}`);
        } else {
          message.error(t('add_error'));
        }
      } else if (error.request) {
        message.error(t('network_error'));
      } else {
        message.error(`${t('add_error')}: ${error.message}`);
      }
    } finally {
      setSaving(false); // End saving
    }
  };

  const handleEditClick = (record) => {
    setEditMode(record.ServiceID);
    form.setFieldsValue({
      ServiceName: record.ServiceName,
      // Price: record.Price,
      Description: record.Description,
      Status: record.Status,
    });
    setServiceImg(""); // Reset image state
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
    setServiceImg(""); // Reset image state
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true); // Start saving
      const token = localStorage.getItem('token');
      if (!token) {
        message.error(t('auth_error'));
        return;
      }

      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('ServiceName', values.ServiceName);
      // formData.append('price', parseFloat(values.Price));
      formData.append('Description', values.Description);
      formData.append('Status', values.Status);
      if (serviceImg) {
        formData.append('image', serviceImg);
      }
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      message.warning(t('processing'));
      const response = await axios.patch(`${API_URL}/api/services/${editMode}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        message.success(t('update_success')).then(() => {
          window.location.reload();
        });
      } else {
        message.error(t('update_fail'));
      }
    } catch (error) {
      console.error('Error updating service:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error(t('unauthorized'));
        } else if (error.response.data && error.response.data.message) {
          message.error(`${t('update_error')}: ${error.response.data.message}`);
        } else {
          message.error(t('update_error'));
        }
      } else if (error.request) {
        message.error(t('network_error'));
      } else {
        message.error(`${t('update_error')}: ${error.message}`);
      }
    } finally {
      setSaving(false); // End saving
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
    // {
    //   title: 'Price',
    //   dataIndex: 'Price',
    //   key: 'Price',
    //   render: (text) => (
    //     <span>{typeof text === 'number' ? `$${text.toFixed(2)}` : '-'}</span>
    //   ),
    // },
    {
      title: t('description'),
      dataIndex: 'Description',
      key: 'Description',
      ellipsis: true, // Enable ellipsis if description is too long
      render: (text) => (
        <Paragraph style={{ whiteSpace: 'pre-line' }} ellipsis={{ rows: 1, expandable: true, symbol: 'more' }}>
          {text}
        </Paragraph>
      ),
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
            <Button type="primary" onClick={() => handleEditClick(record)} style={{ marginRight: '8px' }}>Edit</Button>
          </div>
        )
      ),
    },
  ];

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  return (
    <div className="p-10">
      <Title level={1} className="text-center">{t('service_for_dog')}</Title>
      {/* Search box */}
      <div className="flex flex-row justify-end">
        <Search
          placeholder={t('search_by_service_name')}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: 16, width: 300 }}
        />
      </div>
      {/* Service list */}
      <Form form={form}>
        {userRole === 'Store Manager' ? (
          <>
            <Table
              dataSource={filteredServices}
              columns={columns}
              rowKey="ServiceID"
              loading={loading}
              bordered
              scroll={{ x: 'max-content' }}
            />
            <div className="flex justify-end mt-4">
              <Button type="primary" onClick={handleAddClick} disabled={loading}>Add Service</Button>
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
              filteredServices.map(service => (
                <Card
                  key={service.ServiceID}
                  hoverable
                  className="bg-white rounded-lg shadow-md transition-transform transform-gpu hover:scale-105"
                  onClick={() => handleServiceClick(service.ServiceID)}
                >
                  <Image
                    alt={service.ServiceName}
                    src={service.ImageURL}
                    preview={false}
                    className="rounded-t-lg w-full h-44 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-2xl font-semibold">{service.ServiceName}</h3>
                    {/* <p className="text-green-600 mt-2 text-3xl">${service.Price.toFixed(2)}</p> */}
                    {/* <p className="text-gray-500 mt-2">{service.Description}</p> */}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </Form>
      {/* Add/ Update modal */}
      <Modal
        title={editMode ? "Edit Service" : "Add New Service"}
        visible={addMode || editMode !== null}
        onCancel={editMode ? handleCancelEdit : handleCancelAdd}
        footer={[
          <Button key="cancel" onClick={editMode ? handleCancelEdit : handleCancelAdd} disabled={saving}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={editMode ? handleSaveEdit : handleSaveAdd} disabled={saving}>
            {editMode ? "Save" : "Add"}
          </Button>,
        ]}
        style={{ textAlign: 'center' }}
      >
        <Form form={form} className="text-left" layout='vertical'>
          <Form.Item
            name="ServiceName"
            label={t('service_name')}
            rules={[{ required: true, message: t('enter_service_name') }]}
            className="mb-4"
          >
            <Input placeholder={t('service_name')} className="w-full p-2 border border-gray-300 rounded" />
          </Form.Item>
          <Form.Item
            name="Description"
            label={t('description')}
            rules={[{ required: true, message: t('enter_service_description') }]}
            className="mb-4"
          >
            <TextArea rows={4} placeholder={t('description')} style={{ whiteSpace: 'pre-wrap' }} className="w-full p-2 border border-gray-300 rounded" />
          </Form.Item>
          <Form.Item
            name="Image"
            label={t('image')}
            rules={[{ required: editMode == null, message: t('Please upload the service image!') }]}
            className="mb-4"
          >
            <Input type="file" onChange={handleServiceImageUpload} className="w-full p-2 border border-gray-300 rounded" />
            {serviceImg && (
              <Image src={URL.createObjectURL(serviceImg)} alt="Service Preview" style={{ width: '100px', marginTop: '10px' }} className="block" />
            )}
          </Form.Item>
          <Form.Item
            name="Status"
            label={t('status')}
            rules={[{ required: true, message: t('select_service_status') }]}
            className="mb-4"
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
