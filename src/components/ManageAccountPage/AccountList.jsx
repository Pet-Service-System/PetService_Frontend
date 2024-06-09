import { useEffect, useState } from 'react';
import { Table, Typography, Button, Input, Form, message, Select } from 'antd';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

const AccountList = () => {
  const [accountData, setAccountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [form] = Form.useForm();

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
    setEditMode(record.account_id);
    form.setFieldsValue({
      fullname: record.fullname,
      email: record.email,
      phone: record.phone,
      address: record.address,
      role: record.role
    });
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
  };

  const handleSaveEdit = async (id) => {
    try {
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
        role: values.role
      };

      await axios.patch(`http://localhost:3001/api/accounts/${id}`, updatedAccount, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      message.success('Account updated successfully', 0.5).then(() => {
        window.location.reload(); // Reload the page after successful update
      });
    } catch (error) {
      console.error('Error updating account:', error);
      if (error.response && error.response.status === 401) {
        message.error('Unauthorized. Please log in.');
      } else {
        message.error('Error updating account');
      }
    }
  };

  const columns = [
    {
      title: 'Fullname',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (text, record) => (
        editMode === record.account_id ? (
          <Form.Item
            name="fullname"
            rules={[{ required: true, message: 'Please enter the fullname!' }]}
          >
            <Input placeholder="Fullname" />
          </Form.Item>
        ) : (
          text
        )
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text, record) => (
        editMode === record.account_id ? (
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please enter the email!' }]}
          >
            <Input placeholder="Email" />
          </Form.Item>
        ) : (
          text
        )
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text, record) => (
        editMode === record.account_id ? (
          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Please enter the phone!' }]}
          >
            <Input placeholder="Phone" />
          </Form.Item>
        ) : (
          text
        )
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (text, record) => (
        editMode === record.account_id ? (
          <Form.Item
            name="address"
            rules={[{ required: true, message: 'Please enter the address!' }]}
          >
            <Input placeholder="Address" />
          </Form.Item>
        ) : (
          text
        )
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (text, record) => (
        editMode === record.account_id ? (
          <Form.Item
            name="role"
            rules={[{ required: true, message: 'Please select the role!' }]}
            className='w-52'
          >
            <Select placeholder="Select Role">
              <Option value="">Select Role</Option>
              <Option value="Customer">Customer</Option>
              <Option value="Sale Staff">Sale Staff</Option>
              <Option value="Caretaker Staff">Caretaker Staff</Option>
              <Option value="Store Manager">Store Manager</Option>
              <Option value="Administrator">Administrator</Option>
            </Select>
          </Form.Item>
        ) : (
          text
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        // Check if the role is "Administrator" and disable the edit button accordingly
        record.role === 'admin' ? (
          <Button type="primary" disabled>Edit</Button>
        ) : (
          editMode === record.account_id ? (
            <div>
              <Button type="primary" onClick={() => handleSaveEdit(record.account_id)} style={{ marginRight: '8px' }}>Save</Button>
              <Button onClick={handleCancelEdit}>Cancel</Button>
            </div>
          ) : (
            <Button type="primary" onClick={() => handleEditClick(record)}>Edit</Button>
          )
        )
      ),
    },
  ];

  return (
    <div className="p-36">
      <Title level={2}>Account List</Title>
      <Form form={form}>
        <Table
          dataSource={accountData}
          columns={columns}
          rowKey="account_id"
          pagination={false}
          loading={loading}
        />
      </Form>
    </div>
  );
};

export default AccountList;
