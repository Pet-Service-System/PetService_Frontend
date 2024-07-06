import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Typography, message } from 'antd';
import { useTranslation } from 'react-i18next';
import 'tailwindcss/tailwind.css';

const { Option } = Select;
const { Title } = Typography;

const initialVouchers = [
  {
    _id: '1',
    VoucherID: 'V001',
    Pattern: 'Pattern1',
    Description: 'First voucher',
    Amount: 100,
    Value: 90,
    Status: 'active',
    ExpirationDate: '2024-12-31',
  },
  {
    _id: '2',
    VoucherID: 'V002',
    Pattern: 'Pattern2',
    Description: 'Second voucher',
    Amount: 200,
    Value: 180,
    Status: 'inactive',
    ExpirationDate: '2024-11-30',
  },
];

const Voucher = () => {
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [saving, setSaving] = useState(false); // State for API call status
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const fetchVouchers = async () => {
    setVouchers(initialVouchers); // Using mock data
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const showModal = (voucher = null) => {
    setEditingVoucher(voucher);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingVoucher(null);
    form.resetFields();
  };

  const handleSaveAdd = async () => {
    try {
      setSaving(true); // Start saving
      const values = await form.validateFields();
      setVouchers((prev) => [...prev, { ...values, _id: (prev.length + 1).toString() }]);
      message.success(t('voucher_added_successfully'));
      handleCancel();
    } catch (error) {
      console.error('Error adding voucher:', error);
      message.error(t('failed_to_add_voucher'));
    } finally {
      setSaving(false); // End saving
    }
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true); // Start saving
      const values = await form.validateFields();
      setVouchers((prev) => prev.map((v) => (v._id === editingVoucher._id ? { ...v, ...values } : v)));
      message.success(t('voucher_updated_successfully'));
      handleCancel();
    } catch (error) {
      console.error('Error updating voucher:', error);
      message.error(t('failed_to_update_voucher'));
    } finally {
      setSaving(false); // End saving
    }
  };

  const columns = [
    { title: t('voucher_id'), dataIndex: 'VoucherID', key: 'VoucherID' },
    { title: t('pattern'), dataIndex: 'Pattern', key: 'Pattern' },
    { title: t('description'), dataIndex: 'Description', key: 'Description' },
    { title: t('amount'), dataIndex: 'Amount', key: 'Amount' },
    { title: t('value'), dataIndex: 'Value', key: 'Value' },
    { title: t('status'), dataIndex: 'Status', key: 'Status' },
    { title: t('expiration_date'), dataIndex: 'ExpirationDate', key: 'ExpirationDate' },
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
        rowKey="_id"
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
          <Form.Item name="VoucherID" label={t('voucher_id')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="Pattern" label={t('pattern')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="Description" label={t('description')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="Amount" label={t('amount')} rules={[{ required: true }]}>
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item name="Value" label={t('value')} rules={[{ required: true }]}>
            <InputNumber className="w-full" />
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
