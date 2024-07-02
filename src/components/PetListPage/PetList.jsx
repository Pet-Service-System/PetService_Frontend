import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Table, Button, Input, Select, Form, Typography, message, Modal, Spin, Grid } from 'antd';
import { UserOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios'; // Import axios for making API calls
import { useTranslation } from 'react-i18next';


const { Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;
const API_URL = import.meta.env.REACT_APP_API_URL;

const PetList = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editPetId, setEditPetId] = useState(null);
  const [confirmDeletePetId, setConfirmDeletePetId] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const genders = ['Đực', 'Cái'];
  const user = JSON.parse(localStorage.getItem('user'));
  const accountID = user.id;
  const screens = useBreakpoint();
  const { t } = useTranslation();

  const fetchPets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !accountID) {
        console.error('Token or account ID not found in localStorage');
        return;
      }

      const response = await axios.get(`${API_URL}/api/pets/account/${accountID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPets(response.data);
    } catch (error) {
      console.error('Error fetching pets:', error);
      message.error('Failed to fetch pets');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleUpdatePet = (pet) => {
    setEditPetId(pet.PetID);
    editForm.setFieldsValue({
      ...pet,
      PetID: pet.PetID,
    });
    setIsEditModalVisible(true);
  };

  const handleSavePet = async () => {
    setOperationLoading(true);
    try {
      const values = await editForm.validateFields();
      const token = localStorage.getItem('token');

      const petUpdateData = {
        ...values,
      };
      console.log('Updating pet with data:', petUpdateData);

      await axios.patch(`${API_URL}/api/pets/${editPetId}`, petUpdateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPets((prevPets) =>
        prevPets.map((pet) => (pet.PetID === editPetId ? { ...pet, ...values } : pet))
      );
      setEditPetId(null);
      setIsEditModalVisible(false);
      message.success('Pet updated successfully');
      fetchPets();
    } catch (info) {
      console.log('Validate Failed:', info);
      message.error('Failed to update pet');
    }
    setOperationLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeletePetId) {
      await handleDeletePet(confirmDeletePetId);
      setConfirmDeletePetId(null); // Reset confirm delete pet id
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeletePetId(null); // Reset confirm delete pet id
  };

  const handleDeleteButtonClick = (id) => {
    setConfirmDeletePetId(id);
  };

  const handleDeletePet = async (id) => {
    setOperationLoading(true);
    try {
      const token = localStorage.getItem('token');

      await axios.delete(`${API_URL}/api/pets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPets((prevPets) => prevPets.filter((pet) => pet.PetID !== id));
      message.success('Pet deleted successfully');
    } catch (error) {
      console.error('Error deleting pet:', error);
      message.error('Failed to delete pet');
    }
    setOperationLoading(false);
  };

  const handleAddPet = async () => {
    setOperationLoading(true);
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('token');

      const newPet = { ...values, AccountID: accountID };
      console.log(newPet);

      const response = await axios.post(
        `${API_URL}/api/pets`,
        newPet,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPets((prevPets) => [...prevPets, response.data]);
      setIsAddModalVisible(false);
      form.resetFields();
      message.success('Pet added successfully');
      fetchPets();
    } catch (info) {
      console.log('Validate Failed:', info);
    }
    setOperationLoading(false);
  };

  const columns = [
    { title: t('name'), dataIndex: 'PetName', key: 'PetName' },
    {
      title: t('pet_type'),
      dataIndex: 'PetTypeID',
      key: 'PetTypeID',
      render: (text) => (text === 'PT001' ? t('dog') : text === 'PT002' ? t('cat') : text),
    },
    { title: t('gender'), dataIndex: 'Gender', key: 'Gender' },
    { title: t('status'), dataIndex: 'Status', key: 'Status' },
    { title: t('weight'), dataIndex: 'Weight', key: 'Weight' },
    { title: t('age'), dataIndex: 'Age', key: 'Age' },
    {
      title: t('actions'),
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="primary" onClick={() => handleUpdatePet(record)} className="mr-2" loading={operationLoading}>
            {t('update')}
          </Button>
          <Button danger onClick={() => handleDeleteButtonClick(record.PetID)} loading={operationLoading}>
            {t('delete')}
          </Button>
        </>
      ),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('account_id');
    localStorage.removeItem('fullname');
    localStorage.removeItem('email');
    localStorage.removeItem('user');
    setRole('Guest');
    navigate('/');
    window.location.reload();
  };

  return (
    <Layout className="min-h-screen">
      {!screens.xs && (
        <Sider width={220}>
          <div className="logo" />
          <Menu theme="dark" mode="inline">
            <Menu.Item
              key="profile"
              icon={<UserOutlined />}
              onClick={() => navigate('/user-profile')}
            >
              {t('user_information')}
            </Menu.Item>
            {role === 'Customer' && (
              <>
                <Menu.Item
                  key="pet-list"
                  icon={<UnorderedListOutlined />}
                  onClick={() => navigate('/pet-list')}
                >
                  {t('list_of_pets')}
                </Menu.Item>
                <Menu.Item
                  key="order-history"
                  icon={<HistoryOutlined />}
                  onClick={() => navigate('/order-history')}
                >
                  {t('order_history')}
                </Menu.Item>
                <Menu.Item key="spa-booking"
                  onClick={() => navigate('/spa-booking')}
                  icon={<HistoryOutlined />}>
                  {t('service_history')}
                </Menu.Item>
              </>
            )}
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              {t('log_out')}
            </Menu.Item>
          </Menu>
        </Sider>
      )}
      <Layout>
        <Content className="m-4 p-6 bg-white">
          <div className="flex flex-col items-center">
            <Title level={2} className="my-4">
              {t('list_of_pets')}
            </Title>
            {loading ? (
              <Spin size="large" />
            ) : (
              <div className="w-full overflow-x-auto">
                <Table columns={columns} dataSource={pets} rowKey="PetID" pagination={false} />
              </div>
            )}
            <div className="flex justify-end w-full mt-4">
              <Button type="primary" onClick={() => setIsAddModalVisible(true)} loading={operationLoading}>
                {t('add_pet')}
              </Button>
            </div>
          </div>
          {/* Add Pet */}
          <Modal
            title={t('add_pet')}
            visible={isAddModalVisible}
            onCancel={() => setIsAddModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setIsAddModalVisible(false)}>
                {t('cancel')}
              </Button>,
              <Button key="submit" type="primary" onClick={handleAddPet} loading={operationLoading}>
                {t('add')}
              </Button>,
            ]}
          >
            <Form form={form} layout="vertical">
              <Form.Item name="PetName" 
              rules={[{ required: true, message: t('name') + " " + t('can_not_blank') }]}
              label="Tên thú cưng">
                <Input placeholder={t('name')} />
              </Form.Item>
              <Form.Item name="PetTypeID" 
              rules={[{ required: true, message: t('pet_type')+ " " + t('can_not_blank') }]}
              label="Loại thú cưng">
                <Select placeholder={t('choose_pet_type')}>
                  <Option value="PT001">{t('dog')}</Option>
                  <Option value="PT002">{t('cat')}</Option>
                </Select>
              </Form.Item>
              <Form.Item name="Gender" 
              rules={[{ required: true, message: t('gender')+ " " + t('can_not_blank') }]}
              label="Giới tính">
                <Select placeholder={t('choose_gender')}>
                  {genders.map((gender, index) => (
                    <Option key={index} value={gender}>
                      {gender}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="Status" 
              rules={[{ required: true, message: t('status')+ " " + t('can_not_blank') }]}
              label="Trạng thái">
                <Input placeholder={t('status')} />
              </Form.Item>
              <Form.Item name="Weight" 
              rules={[{ required: true, message: t('weight')+ " " + t('can_not_blank') }]}
              label="Cân nặng thú cưng">
                <Input placeholder={t('weight')} type="number" />
              </Form.Item>
              <Form.Item name="Age" 
              rules={[{ required: true, message: t('age')+ " " + t('can_not_blank') }]}
              label="Tuổi thú cưng">
                <Input placeholder={t('age')} type="number" />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={t('cofirm_delete')}
            visible={confirmDeletePetId !== null}
            onOk={handleConfirmDelete}
            onCancel={handleCancelDelete}
            confirmLoading={operationLoading}
          >
            <p>{t('delete_pet_ask')}</p>
          </Modal>

          <Modal
            title={t('pet_update')}
            visible={isEditModalVisible}
            onCancel={() => setIsEditModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setIsEditModalVisible(false)}>
                {t('cancel')}
              </Button>,
              <Button key="submit" type="primary" onClick={handleSavePet} loading={operationLoading}>
                {t('save')}
              </Button>,
            ]}
          >
            <Form form={editForm} layout="vertical">
              <Form.Item name="PetID" hidden>
                <Input type="hidden" />
              </Form.Item>
              <Form.Item name="PetName" label="Tên thú cưng" rules={[{ required: true, message: t('name') + t('can_not_blank') }]}>
                <Input placeholder={t('name')} />
              </Form.Item>
              <Form.Item name="PetTypeID" label="Loại thú cưng" rules={[{ required: true, message: t('pet_type') + t('can_not_blank') }]}>
                <Select placeholder={t('choose_pet_type')}>
                  <Option value="PT001">{t('dog')}</Option>
                  <Option value="PT002">{t('cat')}</Option>
                </Select>
              </Form.Item>
              <Form.Item name="Gender" label="Giới tính" rules={[{ required: true, message: t('gender') + t('can_not_blank') }]}>
                <Select placeholder={t('choose_gender')}>
                  {genders.map((gender, index) => (
                    <Option key={index} value={gender}>
                      {gender}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="Status" label="Trạng thái" rules={[{ required: true, message: t('status') + t('can_not_blank') }]}>
                <Input placeholder={t('status')} />
              </Form.Item>
              <Form.Item name="Weight" label="Cân nặng thú cưng" rules={[{ required: true, message: t('weight') + t('can_not_blank') }]}>
                <Input placeholder={t('weight')} type="number" />
              </Form.Item>
              <Form.Item name="Age" label="Tuổi thú cưng" rules={[{ required: true, message: t('age') + t('can_not_blank') }]}>
                <Input placeholder={t('age')} type="number" />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PetList;
