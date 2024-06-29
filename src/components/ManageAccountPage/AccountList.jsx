import { useEffect, useState } from 'react';
import { Table, Typography, Button, Input, Form, message, Select, Modal, Skeleton } from 'antd';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Option } = Select;

const AccountList = () => {
  const [accountData, setAccountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false); // State to track save button loading
  const { t } = useTranslation();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/accounts/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setAccountData(response.data.accounts);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleEditClick = (record) => {
    setEditMode(record.AccountID);
    form.setFieldsValue({
      fullname: record.fullname,
      email: record.email,
      phone: record.phone,
      address: record.address,
      role: record.role,
      status: record.status
    });
    setIsModalVisible(true);
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleSaveEdit = async (id) => {
    try {
      setSaveLoading(true); // Set loading state to true
      message.warning('Processing...')
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authorization token not found. Please log in.');
        return;
      }

      const values = await form.validateFields(); // Validate form fields
      const updatedAccount = {
        fullname: values.fullname,
        email: values.email,
        phone: values.phone,
        address: values.address,
        role: values.role,
        status: values.status
      };

      await axios.patch(`http://localhost:3001/api/accounts/${id}`, updatedAccount, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      message.success(t('account_updated_successfully'), 0.5).then(() => {
        window.location.reload(); // Reload the page after successful update
      });
    } catch (error) {
      console.error(t('error_updating_account'), error);
      if (error.response && error.response.status === 401) {
        message.error(t('unauthorized'));
      } else {
        message.error(t('account_updated_successfully'));
      }
    } 
  };

  const columns = [
    {
      title: t('fullname'),
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('phone'),
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: t('address'),
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: t('role'),
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ color: status === 1 ? 'green' : 'red' }}>
          {status === 1 ? 'Active' : 'Inactive'}
        </span>
      ), // Display 'Active' or 'Inactive'
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => (
        // Check if the role is "Administrator" and disable the edit button accordingly
        record.role === 'Administrator' ? (
          <Button type="primary" disabled>{t('edit')}</Button>
        ) : (
          <Button type="primary" onClick={() => handleEditClick(record)}>Edit</Button>
        )
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-8">
      <Title level={2}>{t('account_list')}</Title>
      <Form form={form}>
        <Table
          dataSource={loading ? [] : accountData}
          columns={columns}
          bordered
          rowKey="account_id"
          pagination={false}
          loading={loading}
          scroll={{ x: 'max-content' }}
        />
        {loading && <Skeleton active />}
      </Form>

      <Modal
        title="Edit Account"
        visible={isModalVisible}
        onCancel={handleCancelEdit}
        footer={[
          <Button key="cancel" onClick={handleCancelEdit}>{t('cancel')}</Button>,
          <Button key="submit" type="primary" onClick={() => handleSaveEdit(editMode)} disabled={saveLoading}>Save</Button>,
        ]}
      >
        <Form form={form}>
          {/* Fields */}
          <Form.Item
            name="fullname"
            rules={[{ required: true, message: t('please_enter') + t('fullname') + '!' }]}
          >
            <Input placeholder="Fullname" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[{ required: true, message: t('please_enter') + 'email' + '!'}]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="phone"
            rules={[{ required: true, message: t('please_enter') + t('phone') + '!'}]}
          >
            <Input placeholder="Phone" />
          </Form.Item>
          <Form.Item
            name="address"
            rules={[{ required: true, message: t('please_enter') + t('adress') + '!' }]}
          >
            <Input placeholder="Address" />
          </Form.Item>
          <Form.Item
            name="role"
            rules={[{ required: true, message: t('please_enter') + t('role') + '!' }]}
          >
            <Select placeholder="Select Role">
              {/* Options for roles */}
              <Option value="Customer">Customer</Option>
              <Option value="Sales Staff">Sales Staff</Option>
              <Option value="Caretaker Staff">Caretaker Staff</Option>
              <Option value="Store Manager">Store Manager</Option>
              <Option value="Administrator">Administrator</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            rules={[{ required: true, message: t('please_select_the_status') }]}
          >
            <Select placeholder="Select Status">
              <Option value={1}>{t('active')}</Option>
              <Option value={0}>{t('inactive')}</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountList;
