import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, DatePicker, Select, Typography, message, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import moment from 'moment';

const { Option } = Select;
const { Title } = Typography;
const API_URL = import.meta.env.REACT_APP_API_URL;

const Voucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const fetchVouchers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/voucher`);
      setVouchers(response.data);
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
      message.error(t('failed_to_fetch_vouchers'));
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const showModal = (voucher = null) => {
    setEditingVoucher(voucher);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...voucher,
      ExpirationDate: voucher ? moment(voucher.ExpirationDate) : null,
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingVoucher(null);
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
      console.log('Sending data to server:', formattedValues);
      const response = await axios.post(`${API_URL}/api/voucher`, formattedValues, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setVouchers((prev) => [...prev, response.data]);
      message.success(t('voucher_added_successfully'));
      handleCancel();
    } catch (error) {
      console.error('Error adding voucher:', error.response ? error.response.data : error);
      message.error(t('failed_to_add_voucher'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        ExpirationDate: values.ExpirationDate ? values.ExpirationDate.format('YYYY-MM-DD') : null,
      };
      console.log('Sending data to server:', formattedValues);
      const response = await axios.put(`${API_URL}/api/voucher/${editingVoucher.VoucherID}`, formattedValues);
      setVouchers((prev) => prev.map((v) => (v.VoucherID === editingVoucher.VoucherID ? response.data : v)));
      message.success(t('voucher_updated_successfully'));
      handleCancel();
    } catch (error) {
      console.error('Error updating voucher:', error.response ? error.response.data : error);
      message.error(t('failed_to_update_voucher'));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { title: t('voucher_id'), dataIndex: 'VoucherID', key: 'VoucherID' },
    { title: t('pattern'), dataIndex: 'Pattern', key: 'Pattern' },
    { title: t('usage_limit'), dataIndex: 'UsageLimit', key: 'UsageLimit' },
    { title: t('discount_value'), dataIndex: 'DiscountValue', key: 'DiscountValue' },
    { title: t('minimum_order_value'), dataIndex: 'MinimumOrderValue', key: 'MinimumOrderValue' },
    { title: t('using_type'), dataIndex: 'UsingType', key: 'UsingType' },
    { title: t('status'), dataIndex: 'Status', key: 'Status' },
    { title: t('expiration_date'), dataIndex: 'ExpirationDate', key: 'ExpirationDate', render: date => moment(date).format('YYYY-MM-DD') },
    {
      title: t('action'),
      key: 'action',
      render: (text, record) => (
        <Button type="primary" onClick={() => showModal(record)}>{t('edit')}</Button>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Title className="text-2xl mb-4 text-center">{t('voucher_management')}</Title>
      <Button type="primary" className="mb-4 float-end" onClick={() => showModal()}>
        {t('add_voucher')}
      </Button>
      <Table
        columns={columns}
        dataSource={vouchers}
        scroll={{ x: 'max-content' }}
        rowKey="VoucherID"
      />
      <Modal
        title={editingVoucher ? t('edit_voucher') : t('add_voucher')}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel} disabled={saving}>{t('cancel')}</Button>,
          <Button key="submit" type="primary" onClick={editingVoucher ? handleSaveEdit : handleSaveAdd} disabled={saving}>
            {editingVoucher ? t('update') : t('add')}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={editingVoucher}
        >
          <Form.Item name="Pattern" label={t('voucher_code_pattern')} rules={[{ required: false }]}>
            <Input />
          </Form.Item>
          <Form.Item name="UsageLimit" label={t('usage_limit')} rules={[{ required: true }]}>
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item name="DiscountValue" label={t('discount_value')} rules={[{ required: true }]}>
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item name="MinimumOrderValue" label={t('minimum_order_value')} rules={[{ required: false }]}>
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item name="UsingType" label={t('using_type')} rules={[{ required: true }]}>
            <Select>
              <Option value="Pet Product">{t('pet_product')}</Option>
              <Option value="Pet Service">{t('pet_service')}</Option>
            </Select>
          </Form.Item>
          <Form.Item name="Status" label={t('status')} rules={[{ required: true }]}>
            <Select>
              <Option value="active">{t('active')}</Option>
              <Option value="inactive">{t('inactive')}</Option>
            </Select>
          </Form.Item>
          <Form.Item name="ExpirationDate" label={t('expiration_date')} rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Voucher;
