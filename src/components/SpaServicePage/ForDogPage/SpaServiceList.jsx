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
  const [petTypeID] = useState('PT001');
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
        const filtered_services = response.data.filter(service => service.PetTypeID === pet_type_id);
        set_service_data(filtered_services);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        set_loading(false);
      }
    };

    fetchServices();
  }, [pet_type_id]);

  const handle_service_click = (id) => {
    navigate(`/spa-service-detail/${id}`);
  };

  const handle_add_click = () => {
    set_add_mode(true);
  };

  const handle_cancel_add = () => {
    set_add_mode(false);
    form.resetFields();
    set_service_img('');
  };

  const handle_save_add = async () => {
    try {
      set_saving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error(t('auth_error'));
        return;
      }

      const values = await form.validateFields();
      const form_data = new FormData();
      form_data.append('ServiceName', values.ServiceName);
      form_data.append('Price', parseFloat(values.Price));
      form_data.append('Description', values.Description);
      form_data.append('PetTypeID', pet_type_id);
      form_data.append('Status', values.Status);
      if (service_img) {
        form_data.append('image', service_img);
      } else {
        message.error(t('image_error'));
        return;
      }
      message.warning(t('processing'));

      const response = await axios.post('http://localhost:3001/api/services', form_data, {
        headers: {
          Authorization: `Bearer ${token}`,
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
      set_saving(false);
    }
  };

  const handle_edit_click = (record) => {
    set_edit_mode(record.ServiceID);
    form.setFieldsValue({
      ServiceName: record.ServiceName,
      Price: record.Price,
      Description: record.Description,
      Status: record.Status,
    });
    set_service_img('');
  };

  const handle_cancel_edit = () => {
    set_edit_mode(null);
    form.resetFields();
    set_service_img('');
  };

  const handle_save_edit = async () => {
    try {
      set_saving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error(t('auth_error'));
        return;
      }

      const values = await form.validateFields();
      const form_data = new FormData();
      form_data.append('serviceName', values.ServiceName);
      form_data.append('price', parseFloat(values.Price));
      form_data.append('description', values.Description);
      form_data.append('status', values.Status);
      if (service_img) {
        form_data.append('image', service_img);
      }

      message.warning(t('processing'));
      const response = await axios.patch(`http://localhost:3001/api/services/${edit_mode}`, form_data, {
        headers: {
          Authorization: `Bearer ${token}`,
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
      set_saving(false);
    }
  };

  const handle_service_image_upload = (e) => {
    const file = e.target.files[0];
    set_service_img(file);
    form.setFieldsValue({ Image: file });
  };

  const columns = [
    {
      title: t('service_id'),
      dataIndex: 'ServiceID',
      key: 'ServiceID',
      render: (text, record) => (
        <div className='hover:text-sky-600 hover:cursor-pointer' onClick={() => handle_service_click(record.ServiceID)}>
          {text}
        </div>
      ),
    },
    {
      title: t('service_name'),
      dataIndex: 'ServiceName',
      key: 'ServiceName',
      render: (text, record) => (
        <div className='hover:text-sky-600 hover:cursor-pointer' onClick={() => handle_service_click(record.ServiceID)}>
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
        user_role === 'Store Manager' && (
          <div>
            <Button type="primary" onClick={() => handle_edit_click(record)} style={{ marginRight: '8px' }}>{t('edit')}</Button>
          </div>
        )
      ),
    },
  ];

  return (
    <div className="p-10">
      <Title level={1} className="text-center">{t('services_for_dogs')}</Title>
      <Form form={form}>
        {user_role === 'Store Manager' ? (
          <>
            <Table
              dataSource={service_data}
              columns={columns}
              rowKey="ServiceID"
              loading={loading}
              bordered
              scroll={{ x: 'max-content' }}
            />
            <div className="flex justify-end mt-4">
              <Button type="primary" onClick={handle_add_click} disabled={loading}>{t('add_service')}</Button>
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
              service_data.map(service => (
                <Card
                  key={service.ServiceID}
                  hoverable
                  className="bg-white rounded-lg shadow-md transition-transform transform-gpu hover:scale-105"
                  onClick={() => handle_service_click(service.ServiceID)}
                >
                  <img 
                    alt={service.ServiceName} 
                    src={service.ImageURL} 
                    className="rounded-t-lg w-full h-44 object-cover" 
                  />
                  <div className="p-4">
                    <h3 className="text-2xl font-semibold">{service.ServiceName}</h3>
                    <p className="text-green-600 mt-2 text-3xl">${service.Price.toFixed(2)}</p>
                    <p className="text-gray-500 mt-2">{service.Description}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </Form>

      <Modal
        title={edit_mode ? t('edit_service') : t('add_new_service')}
        visible={add_mode || edit_mode !== null}
        onCancel={edit_mode ? handle_cancel_edit : handle_cancel_add}
        footer={[
          <Button key="cancel" onClick={edit_mode ? handle_cancel_edit : handle_cancel_add} disabled={saving}>{t('cancel')}</Button>,
          <Button key="submit" type="primary" onClick={edit_mode ? handle_save_edit : handle_save_add} disabled={saving}>
            {edit_mode ? t('save') : t('add')}
          </Button>,
        ]}
        style={{ textAlign: 'center' }}
      >
        <Form form={form} className="text-left">
          <Form.Item
            name="ServiceName"
            rules={[{ required: true, message: t('enter_service_name') }]}
          >
            <Input placeholder={t('service_name')} />
          </Form.Item>
          <Form.Item
            name="Price"
            rules={[{ required: true, message: t('enter_service_price') }]}
          >
            <Input placeholder={t('price')} />
          </Form.Item>
          <Form.Item
            name="Description"
            rules={[{ required: true, message: t('enter_service_description') }]}
          >
            <Input placeholder={t('description')} />
          </Form.Item>
          <Form.Item
            name="Image"
            rules={[{ required: true, message: t('upload_service_image') }]}
          >
            <Input type="file" onChange={handle_service_image_upload} />
            {service_img && (
              <Image src={URL.createObjectURL(service_img)} alt="Service Preview" style={{ width: '100px', marginTop: '10px' }} />
            )}
          </Form.Item>
          <Form.Item
            name="Status"
            rules={[{ required: true, message: t('select_service_status') }]}
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
