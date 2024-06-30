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
  const [saveLoading, setSaveLoading] = useState(false); // State to track save button loading
  const [searchText, setSearchText] = useState(''); // State for search query
  const [filterRole, setFilterRole] = useState(null); // State for role filter
  const [filterStatus, setFilterStatus] = useState(null); // State for status filter

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
    } finally {
      setSaveLoading(false); // Reset save loading state
    }
  };

  const handleSearch = (value) => {
    setSearchText(value); // Update search text state
  };

  const handleRoleFilter = (value) => {
    setFilterRole(value); // Update role filter state
  };

  const handleStatusFilter = (value) => {
    setFilterStatus(value); // Update status filter state
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
      filteredValue: filterRole ? [filterRole] : null,
      onFilter: (value, record) => record.role.includes(value),
      render: (text) => text,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filteredValue: filterStatus !== null && filterStatus !== undefined ? [filterStatus.toString()] : null, // Kiểm tra filterStatus trước khi sử dụng
      onFilter: (value, record) => filterStatus === null || filterStatus === undefined || record.status === parseInt(value), // Xử lý trường hợp filterStatus không tồn tại
      render: (status) => (
        <span style={{ color: status === 1 ? 'green' : 'red' }}>
          {status === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
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

  // Filter data based on search query
  let filteredData = accountData.filter(account =>
    account.fullname.toLowerCase().includes(searchText.toLowerCase()) ||
    account.email.toLowerCase().includes(searchText.toLowerCase()) ||
    account.phone.toLowerCase().includes(searchText.toLowerCase())
  );

  // Apply role filter if selected
  if (filterRole) {
    filteredData = filteredData.filter(account => account.role === filterRole);
  }

  // Apply status filter if selected
  if (filterStatus !== null && filterStatus !== undefined) {
    filteredData = filteredData.filter(account => account.status === filterStatus);
  }

  return (
    <div className="p-4 sm:p-8">
      <Title level={2} className="text-center">Account List</Title>
      <div className='flex flex-row justify-end items-center'>
        <Input.Search
            placeholder="Search by fullname, email, or phone"
            allowClear
            onChange={(e) => handleSearch(e.target.value)} // Handle search on change
            style={{ width: 250, marginRight: 8 }} // Adjust width as per your requirement
          />
        <Select
            placeholder="Filter by Role"
            allowClear
            style={{ width: 130, marginRight: 8 }}
            onChange={handleRoleFilter}
          >
            <Option value="Customer">Customer</Option>
            <Option value="Sales Staff">Sales Staff</Option>
            <Option value="Caretaker Staff">Caretaker Staff</Option>
            <Option value="Store Manager">Store Manager</Option>
            <Option value="Administrator">Administrator</Option>
          </Select>
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 135 }}
            onChange={handleStatusFilter}
          >
            <Option value={1}>Active</Option>
            <Option value={0}>Inactive</Option>
          </Select>
      </div>
      {/* <div className='flex flex-row justify-between items-center mb-4'>
        <Input.Search
          placeholder="Search by fullname, email, or phone"
          allowClear
          onChange={(e) => handleSearch(e.target.value)} // Handle search on change
          style={{ width: 250 }} // Adjust width as per your requirement
        />
      <div>
          <Select
            placeholder="Filter by Role"
            allowClear
            style={{ width: 150, marginRight: 8 }}
            onChange={handleRoleFilter}
          >
            <Option value="Customer">Customer</Option>
            <Option value="Sales Staff">Sales Staff</Option>
            <Option value="Caretaker Staff">Caretaker Staff</Option>
            <Option value="Store Manager">Store Manager</Option>
            <Option value="Administrator">Administrator</Option>
          </Select>
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusFilter}
          >
            <Option value={1}>Active</Option>
            <Option value={0}>Inactive</Option>
          </Select>
        </div>
      </div> */}
      <Table
        dataSource={loading ? [] : filteredData}
        columns={columns}
        bordered
        rowKey="account_id"
        pagination={false}
        loading={loading}
        scroll={{ x: 'max-content' }}
      />
      {loading && <Skeleton active />}

      <Modal
        title="Edit Account"
        visible={isModalVisible}
        onCancel={handleCancelEdit}
        footer={[
          <Button key="cancel" onClick={handleCancelEdit} disabled={saveLoading}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={() => handleSaveEdit(editMode)} disabled={saveLoading}>Save</Button>,
        ]}
      >
        <Form form={form}>
          {/* Fields */}
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
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select placeholder="Select Status">
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
