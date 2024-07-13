import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, Typography, message, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Title, Text } = Typography;
const API_URL = import.meta.env.REACT_APP_API_URL;

const Voucher = () => {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem("role") || "Guest");
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null); // State for filtering by status
  const [searchPattern, setSearchPattern] = useState(''); // State for searching pattern
  const [form] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    if(role === 'Customer' || role === 'Guest'){
      navigate('/')
    } else{
      fetchVouchers();
    }
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/voucher`);
      setVouchers(response.data);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
      message.error(t('failed_to_fetch_vouchers'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setAddMode(true);
    form.resetFields();
  };

  const handleCancelAdd = () => {
    setAddMode(false);
    form.resetFields();
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
      const formattedValues = {
        ...values,
        ExpirationDate: values.ExpirationDate ? values.ExpirationDate.format('YYYY-MM-DD') : null,
      };

      message.warning(t('processing'));
      const response = await axios.post(`${API_URL}/api/voucher`, formattedValues, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        message.success(t('voucher_added_successfully'));
        fetchVouchers();
        handleCancelAdd();
      } else {
        message.error(t('failed_to_add_voucher'));
      }
    } catch (error) {
      console.error('Error adding voucher:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error(t('unauthorized_please_log_in'));
        } else if (error.response.data && error.response.data.message) {
          message.error(`${t('error_adding_voucher')}: ${error.response.data.message}`);
        } else {
          message.error(t('error_adding_voucher'));
        }
      } else if (error.request) {
        message.error(t('error_adding_voucher_network_or_server_issue'));
      } else {
        message.error(`${t('error_adding_voucher')}: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (voucher) => {
    setEditMode(voucher.VoucherID);
    form.setFieldsValue({
      ...voucher,
      ExpirationDate: moment(voucher.ExpirationDate),
    });
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
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
      const formattedValues = {
        ...values,
        ExpirationDate: values.ExpirationDate ? values.ExpirationDate.format('YYYY-MM-DD') : null,
      };

      message.warning(t('processing'));
      const response = await axios.put(`${API_URL}/api/voucher/${editMode}`, formattedValues, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        message.success(t('voucher_updated_successfully'));
        fetchVouchers();
        setEditMode(null);
      } else {
        message.error(t('failed_to_update_voucher'));
      }
    } catch (error) {
      console.error('Error updating voucher:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error(t('unauthorized_please_log_in'));
        } else if (error.response.data && error.response.data.message) {
          message.error(`${t('error_updating_voucher')}: ${error.response.data.message}`);
        } else {
          message.error(t('error_updating_voucher'));
        }
      } else if (error.request) {
        message.error(t('error_updating_voucher_network_or_server_issue'));
      } else {
        message.error(`${t('error_updating_voucher')}: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (voucherId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error(t('authorization_token_not_found'));
        return;
      }

      message.warning(t('processing'));
      const response = await axios.delete(`${API_URL}/api/voucher/${voucherId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        message.success(t('voucher_deleted_successfully'));
        fetchVouchers();
      } else {
        message.error(t('failed_to_delete_voucher'));
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error(t('unauthorized_please_log_in'));
        } else if (error.response.data && error.response.data.message) {
          message.error(`${t('error_deleting_voucher')}: ${error.response.data.message}`);
        } else {
          message.error(t('error_deleting_voucher'));
        }
      } else if (error.request) {
        message.error(t('error_deleting_voucher_network_or_server_issue'));
      } else {
        message.error(`${t('error_deleting_voucher')}: ${error.message}`);
      }
    }
  };

  const columns = [
    { title: t('voucher_id'), dataIndex: 'VoucherID', key: 'VoucherID' },
    { title: t('pattern'), dataIndex: 'Pattern', key: 'Pattern' },
    { title: t('usage_limit'), dataIndex: 'UsageLimit', key: 'UsageLimit' },
    { title: t('discount_value'), dataIndex: 'DiscountValue', key: 'DiscountValue' },
    { title: t('minimum_order_value'), dataIndex: 'MinimumOrderValue', key: 'MinimumOrderValue' },
    { title: t('status'), dataIndex: 'Status', key: 'Status', render: text => (
      <Tag color={text === 'Active' ? 'green' : 'red'}>
        {text.toUpperCase()}
      </Tag>
    )},
    { title: t('expiration_date'), dataIndex: 'ExpirationDate', key: 'ExpirationDate', render: date => moment(date).format('YYYY-MM-DD'), sorter: (a, b) => moment(a.ExpirationDate) - moment(b.ExpirationDate), },
    {
      title: t('action'),
      key: 'action',
      render: (text, record) => (
        <div>
          <Button type="primary" onClick={() => handleEditClick(record)}>{t('edit')}</Button>
          <Button type="danger" onClick={() => handleDelete(record.VoucherID)} className="ml-2">{t('delete')}</Button>
        </div>
      ),
    },
  ];

  // Filtered vouchers based on filterStatus and searchPattern
  const filteredVouchers = vouchers.filter(voucher => {
    const matchesStatus = filterStatus ? voucher.Status === filterStatus : true;
    const matchesPattern = voucher.Pattern.toLowerCase().includes(searchPattern.toLowerCase());
    return matchesStatus && matchesPattern;
  });

  return (
    <div className="p-10">
      <Title level={1} className='text-center'>{t('voucher_management')}</Title>
      <div className="flex flex-col sm:flex-row justify-end mb-4 items-end space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex flex-col w-full sm:w-auto">
          <Text>{t('search_pattern')}</Text>
          <Input
            placeholder={t('enter_pattern')}
            value={searchPattern}
            onChange={(e) => setSearchPattern(e.target.value)}
          />
        </div>
        <div className="flex flex-col w-full sm:w-auto">
          <Text>{t('filter_status')}</Text>
          <Select
            placeholder={t('select_status')}
            style={{ width: '100%' }}
            onChange={value => setFilterStatus(value)}
            allowClear
            value={filterStatus}
          >
            <Option value="Active">{t('active')}</Option>
            <Option value="Inactive">{t('inactive')}</Option>
          </Select>
        </div>
        <Button type="primary" onClick={handleAddClick} disabled={loading} className="w-full sm:w-auto">
          {t('add_voucher')}
        </Button>
      </div>

      <Table
        dataSource={filteredVouchers}
        columns={columns}
        rowKey="VoucherID"
        loading={loading}
        bordered
        scroll={{ x: 'max-content' }}
      />
      {/* Add/ Update modal */}
      <Modal
        title={editMode ? t('edit_voucher') : t('add_voucher')}
        visible={addMode || editMode !== null}
        onCancel={editMode ? handleCancelEdit : handleCancelAdd}
        footer={[
          <Button key="cancel" onClick={editMode ? handleCancelEdit : handleCancelAdd}>{t('cancel')}</Button>,
          <Button key="save" type="primary" onClick={editMode ? handleSaveEdit : handleSaveAdd} loading={saving}>
            {t('save')}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="Pattern" label={t('pattern')} rules={[{ required: false }]}>
            <Input disabled={editMode !== null} />
          </Form.Item>
          <Form.Item name="UsageLimit" label={t('usage_limit')} rules={[{ required: true, message: t('please_enter_usage_limit') }]}>
            <Input suffix={t('times')} type="number" />
          </Form.Item>
          <Form.Item name="DiscountValue" label={t('discount_value')} rules={[{ required: true, message: t('please_enter_discount_value') }]}>
            <Input suffix='vnd' type="number" />
          </Form.Item>
          <Form.Item name="MinimumOrderValue" label={t('minimum_order_value')} rules={[{ required: true, message: t('please_enter_minimum_order_value') }]}>
            <Input suffix='vnd' type="number" />
          </Form.Item>
          <Form.Item name="ExpirationDate" label={t('expiration_date')} rules={[{ required: true, message: t('please_select_expiration_date') }]}>
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="Status" label={t('status')} rules={[{ required: true, message: t('please_select_status') }]}>
            <Select style={{ width: '100%' }}>
              <Option value="Active">{t('active')}</Option>
              <Option value="Inactive">{t('inactive')}</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Voucher;
