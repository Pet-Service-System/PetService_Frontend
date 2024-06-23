import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Button, Input, Modal, Form, Card, Skeleton, Image, message, Select } from 'antd';
import axios from 'axios';

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
    setServiceImg(""); // Reset image state
  };

  const handleSaveAdd = async () => {
    try {
      setSaving(true); // Start saving
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authorization token not found. Please log in.');
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
        message.error('Please upload the service image!');
        return;
      }
      message.warning('Processing...');
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
        message.success('Service added successfully', 0.5).then(() => {
          window.location.reload();
        });
      } else {
        message.error('Failed to add service: Unexpected server response');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error('Unauthorized. Please log in.');
        } else if (error.response.data && error.response.data.message) {
          message.error(`Error adding service: ${error.response.data.message}`);
        } else {
          message.error('Error adding service');
        }
      } else if (error.request) {
        message.error('Error adding service: Network or server issue');
      } else {
        message.error(`Error adding service: ${error.message}`);
      }
    } finally {
      setSaving(false); // End saving
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
        message.error('Authorization token not found. Please log in.');
        return;
      }

      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('serviceName', values.ServiceName);
      formData.append('price', parseFloat(values.Price));
      formData.append('description', values.Description);
      formData.append('status', values.Status);
      if (serviceImg) {
        formData.append('image', serviceImg);
      }
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      message.warning('Processing...');
      const response = await axios.patch(`http://localhost:3001/api/services/${editMode}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        message.success('Service updated successfully', 0.5).then(() => {
          window.location.reload();
        });
      } else {
        message.error('Failed to update service: Unexpected server response');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error('Unauthorized. Please log in.');
        } else if (error.response.data && error.response.data.message) {
          message.error(`Error updating service: ${error.response.data.message}`);
        } else {
          message.error('Error updating service');
        }
      } else if (error.request) {
        message.error('Error updating service: Network or server issue');
      } else {
        message.error(`Error updating service: ${error.message}`);
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
      title: 'Service ID',
      dataIndex: 'ServiceID',
      key: 'ServiceID',
      render: (text, record) => (
        <div className='hover:text-sky-600 hover:cursor-pointer' onClick={() => handleServiceClick(record.ServiceID)}>
          {text}
        </div>
      ),
    },
    {
      title: 'Service Name',
      dataIndex: 'ServiceName',
      key: 'ServiceName',
      render: (text, record) => (
        <div className='hover:text-sky-600 hover:cursor-pointer' onClick={() => handleServiceClick(record.ServiceID)}>
          {text}
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'Price',
      key: 'Price',
      render: (text) => (
        <span>{typeof text === 'number' ? `$${text.toFixed(2)}` : '-'}</span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'Description',
      key: 'Description',
    },
    {
      title: 'Image URL',
      dataIndex: 'ImageURL',
      key: 'ImageURL',
      render: (text, record) => (
        <Image src={text} alt={record.ServiceName} style={{ width: '50px', cursor: 'pointer' }} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      render: (text) => (
        <span style={{ color: text === 'Available' ? 'green' : text === 'Unavailable' ? 'red' : 'black' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Actions',
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
  return (
    <div className="p-10">
      <Title level={1} className="text-center">Services for Cats</Title>
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
        <Form form={form} className="text-left">
          <Form.Item
            name="ServiceName"
            rules={[{ required: true, message: 'Please enter the service name!' }]}
          >
            <Input placeholder="Service Name" />
          </Form.Item>
          <Form.Item
            name="Price"
            rules={[{ required: true, message: 'Please enter the service price!' }]}
          >
            <Input placeholder="Price" />
          </Form.Item>
          <Form.Item
            name="Description"
            rules={[{ required: true, message: 'Please enter the service description' }]}
          >
            <Input placeholder="Description" />
          </Form.Item>
          <Form.Item
            name="Image"
            rules={[{ required: true, message: 'Please upload the service image!' }]}
          >
            <Input type="file" onChange={handleServiceImageUpload} />
            {serviceImg && (
              <Image src={URL.createObjectURL(serviceImg)} alt="Service Preview" style={{ width: '100px', marginTop: '10px' }} />
            )}
          </Form.Item>
          <Form.Item
            name="Status"
            rules={[{ required: true, message: 'Please select the service status' }]}
          >
            <Select placeholder="Select Status">
              <Option value="Available">Available</Option>
              <Option value="Unavailable">Unavailable</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SpaServiceList;
