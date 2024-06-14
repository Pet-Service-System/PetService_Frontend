import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Table, Button, Input, Select, Form, Typography, message, Modal, Spin, Grid } from 'antd';
import { UserOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios'; // Import axios for making API calls
import SubMenu from 'antd/es/menu/SubMenu';

const { Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { useBreakpoint } = Grid;

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

  const fetchPets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token || !accountID) {
        console.error('Token or account ID not found in localStorage');
        return;
      }

      const response = await axios.get(`http://localhost:3001/api/pets/account/${accountID}`, {
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
  
      await axios.patch(`http://localhost:3001/api/pets/${editPetId}`, petUpdateData, {
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

      await axios.delete(`http://localhost:3001/api/pets/${id}`, {
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
        'http://localhost:3001/api/pets',
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
    { title: 'Tên', dataIndex: 'PetName', key: 'PetName' },
    {
      title: 'Loại thú cưng',
      dataIndex: 'PetTypeID',
      key: 'PetTypeID',
      render: (text) => (text === 'PT001' ? 'Chó' : text === 'PT002' ? 'Mèo' : text),
    },
    { title: 'Giới tính', dataIndex: 'Gender', key: 'Gender' },
    { title: 'Trạng thái', dataIndex: 'Status', key: 'Status' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="primary" onClick={() => handleUpdatePet(record)} className="mr-2" loading={operationLoading}>
            Cập nhật
          </Button>
          <Button danger onClick={() => handleDeleteButtonClick(record.PetID)} loading={operationLoading}>
            Xóa
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
              Thông tin người dùng
            </Menu.Item>
            {role === 'Customer' && (
              <>
                <Menu.Item
                  key="pet-list"
                  icon={<UnorderedListOutlined />}
                  onClick={() => navigate('/pet-list')}
                >
                  Danh sách thú cưng
                </Menu.Item>
                <Menu.Item
                  key="orders-history"
                  icon={<HistoryOutlined />}
                  onClick={() => navigate('/orders-history')}
                >
                  Lịch sử đặt hàng
                </Menu.Item>
                <SubMenu
                  key="service-history"
                  icon={<HistoryOutlined />}
                  title="Lịch sử dịch vụ"
                >
                  <Menu.Item key="service-booking" onClick={() => navigate('/service-booking')}>
                    Dịch vụ thú cưng
                  </Menu.Item>
                  <Menu.Item key="hotel-booking" onClick={() => navigate('/hotel-booking')}>
                    Dịch vụ khách sạn
                  </Menu.Item>
                </SubMenu>
              </>
            )}
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
              Đăng xuất
            </Menu.Item>
          </Menu>
        </Sider>
      )}
      <Layout>
        <Content className="m-4 p-6 bg-white">
          <div className="flex flex-col items-center">
            <Title level={2} className="my-4">
              Danh sách thú cưng
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
                Thêm thú cưng
              </Button>
            </div>
          </div>

          <Modal
            title="Thêm thú cưng"
            visible={isAddModalVisible}
            onCancel={() => setIsAddModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setIsAddModalVisible(false)}>
                Hủy
              </Button>,
              <Button key="submit" type="primary" onClick={handleAddPet} loading={operationLoading}>
                Thêm
              </Button>,
            ]}
          >
            <Form form={form} layout="vertical">
              <Form.Item name="PetName" rules={[{ required: true, message: 'Tên không được để trống' }]}>
                <Input placeholder="Tên" />
              </Form.Item>
              <Form.Item name="PetTypeID" rules={[{ required: true, message: 'Loại thú cưng không được để trống' }]}>
                <Select placeholder="Chọn loại thú cưng">
                  <Option value="PT001">Chó</Option>
                  <Option value="PT002">Mèo</Option>
                </Select>
              </Form.Item>
              <Form.Item name="Gender" rules={[{ required: true, message: 'Giới tính không được để trống' }]}>
                <Select placeholder="Chọn giới tính">
                  {genders.map((gender, index) => (
                    <Option key={index} value={gender}>
                      {gender}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="Status" rules={[{ required: true, message: 'Trạng thái không được để trống' }]}>
                <Input placeholder="Trạng thái" />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Xác nhận xóa thú cưng"
            visible={confirmDeletePetId !== null}
            onOk={handleConfirmDelete}
            onCancel={handleCancelDelete}
            confirmLoading={operationLoading}
          >
            <p>Bạn có chắc chắn muốn xóa thú cưng này?</p>
          </Modal>

          <Modal
            title="Cập nhật thú cưng"
            visible={isEditModalVisible}
            onCancel={() => setIsEditModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setIsEditModalVisible(false)}>
                Hủy
              </Button>,
              <Button key="submit" type="primary" onClick={handleSavePet} loading={operationLoading}>
                Lưu
              </Button>,
            ]}
          >
            <Form form={editForm} layout="vertical">
              <Form.Item name="PetID" hidden>
                <Input type="hidden" />
              </Form.Item>
              <Form.Item name="PetName" rules={[{ required: true, message: 'Tên không được để trống' }]}>
                <Input placeholder="Tên" />
              </Form.Item>
              <Form.Item name="PetTypeID" rules={[{ required: true, message: 'Loại thú cưng không được để trống' }]}>
                <Select placeholder="Chọn loại thú cưng">
                  <Option value="PT001">Chó</Option>
                  <Option value="PT002">Mèo</Option>
                </Select>
              </Form.Item>
              <Form.Item name="Gender" rules={[{ required: true, message: 'Giới tính không được để trống' }]}>
                <Select placeholder="Chọn giới tính">
                  {genders.map((gender, index) => (
                    <Option key={index} value={gender}>
                      {gender}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="Status" rules={[{ required: true, message: 'Trạng thái không được để trống' }]}>
                <Input placeholder="Trạng thái" />
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PetList;
