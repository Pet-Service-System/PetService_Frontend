import { useEffect, useState } from 'react';
import { Table, Typography, Button, Input, Form, message, Select, Modal, Skeleton, Layout } from 'antd';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';


const { Title } = Typography;
const { Option } = Select;
const API_URL = import.meta.env.REACT_APP_API_URL;

const AccountList = () => {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem("role") || "Guest");
  
  const [accountData, setAccountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false); // State to track save button loading
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState(''); // State for search query
  const [filterRole, setFilterRole] = useState(null); // State for role filter
  const [filterStatus, setFilterStatus] = useState(null); // State for status filter
  
  
  useEffect(() => {
    if(role === 'Customer' || role === 'Guest'){
      navigate('/')
    } else {
      fetchAccounts();
    }
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/accounts/all`, {
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

      await axios.patch(`${API_URL}/api/accounts/${id}`, updatedAccount, {
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
      filteredValue: filterRole ? [filterRole] : null,
      onFilter: (value, record) => record.role.includes(value),
      render: (text) => text,
    },
    {
      title: t('status'),
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
      title: t('actions'),
      key: 'actions',
      fixed: 'right',
      className: 'sticky right-0 bg-white',
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
    <Layout style={{ minHeight: '100vh' }}>
      <Layout className='site-layout'>
        <div className="p-4 sm:p-8 site-layout-background">
        <Title level={2} className="text-center">{t('Account List')}</Title>
        {/* Search and filter */}
        <Layout className='flex lg:flex-row sm:flex-col justify-between mb-4'>
          <Input.Search
            placeholder={t('Search by fullname, email, or phone')}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 320, marginRight: 8 }} 
          />
          <div>
            <Select
              placeholder={t('Filter by Role')}
              allowClear
              style={{ width: 150, marginRight: 8 }}
              onChange={handleRoleFilter}
            >
              <Option value="Customer">{t('Customer')}</Option>
              <Option value="Sales Staff">{t('Sales Staff')}</Option>
              <Option value="Caretaker Staff">{t('Caretaker Staff')}</Option>
              <Option value="Store Manager">{t('Store Manager')}</Option>
              <Option value="Administrator">{t('Administrator')}</Option>
            </Select>
            <Select
              placeholder={t('Filter by Status')}
              allowClear
              style={{ width: 160 }}
              onChange={handleStatusFilter}
            >
              <Option value={1}>{t('Active')}</Option>
              <Option value={0}>{t('Inactive')}</Option>
            </Select>
          </div>
        </Layout>
        {/* Table */}
        <Table
          dataSource={loading ? [] : filteredData}
          columns={columns}
          bordered
          rowKey="account_id"
          pagination={true}
          loading={loading}
          scroll={{ x: 'max-content' }}
        />
        {loading && <Skeleton active />}
        {/* Update account modal */}
        <Modal
          title={t('edit_account')}
          visible={isModalVisible}
          onCancel={handleCancelEdit}
          footer={[
            <Button key="cancel" onClick={handleCancelEdit} disabled={saveLoading}>{t('cancel')}</Button>,
            <Button key="submit" type="primary" onClick={() => handleSaveEdit(editMode)} disabled={saveLoading}>{t('save')}</Button>,
          ]}
        >
          <Form form={form} layout='vertical'>
            <Form.Item
              label={t('fullname')}
              name="fullname"
              rules={[{ required: true, message: t('please_enter') + ' ' + t('fullname') + '!' }]}
            >
              <Input placeholder={t('fullname')} />
            </Form.Item>
            <Form.Item
              label={t('email')}
              name="email"
              rules={[{ required: true, message: t('please_enter') + ' ' + t('email') + '!' }]}
            >
              <Input placeholder={t('email')} />
            </Form.Item>
            <Form.Item
              label={t('phone')}
              name="phone"
              rules={[{ required: true, message: t('please_enter') + ' ' + t('phone') + '!' }]}
            >
              <Input placeholder={t('phone')} />
            </Form.Item>
            <Form.Item
              label={t('address')}
              name="address"
              rules={[{ required: true, message: t('please_enter') + ' ' + t('address') + '!' }]}
            >
              <Input placeholder={t('address')} />
            </Form.Item>
            <Form.Item
              label={t('role')}
              name="role"
              rules={[{ required: true, message: t('please_enter') + ' ' + t('role') + '!' }]}
            >
              <Select placeholder={t('select_role')}>
                <Option value="Customer">{t('customer')}</Option>
                <Option value="Sales Staff">{t('sales_staff')}</Option>
                <Option value="Caretaker Staff">{t('caretaker_staff')}</Option>
                <Option value="Store Manager">{t('store_manager')}</Option>
                <Option value="Administrator">{t('administrator')}</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={t('status')}
              name="status"
              rules={[{ required: true, message: t('please_select_the_status') }]}
            >
              <Select placeholder={t('select_status')}>
                <Option value={1}>{t('active')}</Option>
                <Option value={0}>{t('inactive')}</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      </Layout>
    </Layout>
  );
};

export default AccountList;
