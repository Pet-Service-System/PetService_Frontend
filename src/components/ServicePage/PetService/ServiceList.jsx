import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Button, Input, Modal, Form, message, Image, Card, Skeleton, Select } from 'antd';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

const ServiceList = () => {
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole] = useState(localStorage.getItem('role') || 'Guest');
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [addMode, setAddMode] = useState(false); // false: view mode, true: add mode
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/services');
        setServiceData(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  const handleServiceClick = (id) => {
    navigate(`/pet-service-detail/${id}`)
  };

  const handleEditClick = (record) => {
    setEditMode(record.ServiceID);
    form.setFieldsValue({
      ServiceName: record.ServiceName,
      Price: record.Price,
      Description: record.Description,
      ImageURL: record.ImageURL,
      Status: record.Status // Set the status in the form
    });
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
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
        Price: parseFloat(values.Price),
        Description: values.Description,
        ImageURL: values.ImageURL,
        Status: values.Status
      };

      await axios.patch(`http://localhost:3001/api/services/${editMode}`, updatedService, {
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

  const handleDeleteClick = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this service?',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            message.error('Authorization token not found. Please log in.');
            return;
          }

          await axios.delete(`http://localhost:3001/api/services/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          message.success('Service deleted successfully', 0.5).then(() => {
            window.location.reload();
          });
        } catch (error) {
          console.error('Error deleting service:', error);
          if (error.response && error.response.status === 401) {
            message.error('Unauthorized. Please log in.');
          } else {
            message.error('Error deleting service');
          }
        }
      },
    });
  };

  const handleAddClick = () => {
    setAddMode(true);
  };

  const handleCancelAdd = () => {
    setAddMode(false);
    form.resetFields();
  };

  const handleSaveAdd = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authorization token not found. Please log in.');
        return;
      }

      const values = await form.validateFields(); // Validate form fields
      const newService = {
        ServiceName: values.ServiceName,
        Price: parseFloat(values.Price),
        Description: values.Description,
        ImageURL: values.ImageURL,
        Status: values.Status // Include status in the new service
      };

      const response = await axios.post(`http://localhost:3001/api/services`, newService, {
        headers: {
          'Authorization': `Bearer ${token}`,
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
      if (error.response && error.response.status === 401) {
        message.error('Unauthorized. Please log in.');
      } else if (error.response && error.response.data && error.response.data.message) {
        message.error(`Error adding service: ${error.response.data.message}`);
      } else {
        message.error('Error adding service');
      }
    }
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
        <span>{text}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        userRole === 'Store Manager' && (
          <div>
            <Button type="primary" onClick={() => handleEditClick(record)} style={{ marginRight: '8px' }}>Edit</Button>
            <Button danger onClick={() => handleDeleteClick(record.ServiceID)}>Delete</Button>
          </div>
        )
      ),
    },
  ];

  return (
    <div className="p-36">
      <Title level={2}>Service List</Title>
      <Form form={form}>
        {userRole === 'Store Manager' ? (
          <>
            <Table
              dataSource={serviceData}
              columns={columns}
              rowKey="ServiceID"
              pagination={false}
              loading={loading}
            />
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <Button type="primary" onClick={handleAddClick}>Add Service</Button>
            </div>
          </>
        ) : (
          <div className="card-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} style={{ width: 240, margin: '16px' }}>
                  <Skeleton.Image style={{ width: 240, height: 150 }} />
                  <Skeleton active />
                </Card>
              ))
            ) : (
              serviceData.map(service => (
                <Card
                  key={service.ServiceID}
                  hoverable
                  className="w-72 mx-4 my-6 bg-white rounded-lg shadow-md transition-transform transform-gpu hover:scale-105"
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
          title="Add New Service"
          visible={addMode}
          onCancel={handleCancelAdd}
          footer={[
            <Button key="cancel" onClick={handleCancelAdd}>Cancel</Button>,
            <Button key="submit" type="primary" onClick={handleSaveAdd}>Add</Button>,
          ]}
          style={{ textAlign: 'center' }}
        >
          <Form form={form} className='text-left'>
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
              name="ImageURL"
              rules={[{ required: true, message: 'Please enter the service image URL!' }]}
            >
              <Input placeholder="Image URL" />
            </Form.Item>
            <Form.Item
              name="Status"
              rules={[{ required: true, message: 'Please select the service status!' }]}
            >
              <Select placeholder="Select Status">
                <Option value="Available">Available</Option>
                <Option value="Unavailable">Unavailable</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
  
        <Modal
          title="Edit Service"
          visible={editMode !== null}
          onCancel={handleCancelEdit}
          footer={[
            <Button key="cancel" onClick={handleCancelEdit}>Cancel</Button>,
            <Button key="submit" type="primary" onClick={handleSaveEdit}>Save</Button>,
          ]}
          style={{ textAlign: 'center' }}
        >
          <Form form={form} className='text-left'>
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
              name="ImageURL"
              rules={[{ required: true, message: 'Please enter the service image URL!' }]}
            >
              <Input placeholder="Image URL" />
            </Form.Item>
            <Form.Item
              name="Status"
              rules={[{ required: true, message: 'Please select the service status!' }]}
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
  
  export default ServiceList;
  
