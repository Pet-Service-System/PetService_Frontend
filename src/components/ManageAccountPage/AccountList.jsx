import { useEffect, useState } from 'react';
import { Table, Typography, Button, Input, Form, message, Select, Modal, Skeleton } from 'antd';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

const AccountList = () => {
  const [accountData, setAccountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

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
    setIsModalVisible(true);
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
    setIsModalVisible(false);
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
        role: values.role,
        status: values.status
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
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ color: status === 1 ? 'green' : 'red' }}>
          {status === 1 ? 'Active' : 'Inactive'}
        </span>
      ), // Hiển thị giá trị 'Active' hoặc 'Inactive'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        // Check if the role is "Administrator" and disable the edit button accordingly
        record.role === 'Administrator' ? (
          <Button type="primary" disabled>Edit</Button>
        ) : (
          <Button type="primary" onClick={() => handleEditClick(record)}>Edit</Button>
        )
      ),
    },
  ];

  return (
    <div className="p-36">
      <Title level={2}>Account List</Title>
      <Form form={form}>
        <Table
          dataSource={loading ? [] : accountData}
          columns={columns}
          rowKey="account_id"
          pagination={false}
          loading={loading}
        />
        {loading && <Skeleton active />}
      </Form>

      <Modal
        title="Edit Account"
        visible={isModalVisible}
        onCancel={handleCancelEdit}
        footer={[
          <Button key="cancel" onClick={handleCancelEdit}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={() => handleSaveEdit(editMode)}>Save</Button>,
        ]}
      >
        <Form form={form}>
          {/* Các trường dữ liệu */}
          <Form.Item
            name="fullname"
            rules={[{ required: true, message: 'Please enter the fullname!' }]}
          >
            <Input placeholder="Fullname" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please enter the email!' }]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Please enter the phone!' }]}
          >
            <Input placeholder="Phone" />
          </Form.Item>
          <Form.Item
            name="address"
            rules={[{ required: true, message: 'Please enter the address!' }]}
          >
            <Input placeholder="Address" />
          </Form.Item>
          <Form.Item
            name="role"
            rules={[{ required: true, message: 'Please select the role!' }]}
          >
            <Select placeholder="Select Role">
              {/* Tùy chọn cho vai trò */}
              <Option value="Customer">Customer</Option>
              <Option value="Sale Staff">Sale Staff</Option>
              <Option value="Caretaker Staff">Caretaker Staff</Option>
              <Option value="Store Manager">Store Manager</Option>
              <Option value="Administrator">Administrator</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select placeholder="Select Status">
              {/* Tùy chọn cho trạng thái */}
              <Option value={1}>Active</Option>
              <Option value={0}>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountList;

