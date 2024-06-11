import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Table, Button, Input, Select, Form, Typography, message, Modal } from 'antd';
import { UserOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios'; // Import axios for making API calls

const { Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const PetList = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editPetId, setEditPetId] = useState(null);
  const [confirmDeletePetId, setConfirmDeletePetId] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const genders = ['Đực', 'Cái'];

  // Fetch pets from the server
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const accountID = user.id;
        console.log(accountID); // Debugging statement

        if (!token || !accountID) {
          console.error('Token or account ID not found in localStorage');
          return;
        }

        const response = await axios.get(`http://localhost:3001/api/pets/account/${accountID}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Pets response:', response.data); // Debugging statement
        setPets(response.data);
      } catch (error) {
        console.error('Error fetching pets:', error);
        message.error('Failed to fetch pets');
      }
    };

    fetchPets();
  }, []);

  const handleUpdatePet = (pet) => {
    setEditPetId(pet.PetID);
    editForm.setFieldsValue(pet);
    setIsEditModalVisible(true);
  };

  const handleSavePet = async () => {
    try {
      const values = await editForm.validateFields();
      const token = localStorage.getItem('token');
      console.log(values)
      await axios.patch(`http://localhost:3001/api/pets/${editPetId}`, values, {
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
    } catch (info) {
      console.log('Validate Failed:', info);
    }
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
  };

  const handleAddPet = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const accountID = user.id;

      const response = await axios.post(
        'http://localhost:3001/api/pets',
        { ...values, AccountID: accountID },
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
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  const columns = [
    { title: 'Tên', dataIndex: 'PetName', key: 'PetName' },
    { title: 'Giới tính', dataIndex: 'Gender', key: 'Gender' },
    { title: 'Trạng thái', dataIndex: 'Status', key: 'Status' },
    {
      title: 'Loại thú cưng',
      dataIndex: 'PetTypeID',
      key: 'PetTypeID',
      render: (petTypeID) => petTypeID?.TypeName || 'Unknown',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="primary" onClick={() => handleUpdatePet(record)} className="mr-2">
            Cập nhật
          </Button>
          <Button danger onClick={() => handleDeleteButtonClick(record.PetID)}>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  const handleMenuClick = (key) => {
    if (key === 'logout') {
      navigate('/');
    } else {
      navigate(`/${key}`);
    }
  };

  return (
    <Layout style={{ minHeight: '80vh' }}>
      <Sider width={220}>
        <div className="logo" />
        <Menu theme="dark" mode="inline" onClick={({ key }) => handleMenuClick(key)}>
          <Menu.Item key="user-profile" icon={<UserOutlined />}>
            Thông tin người dùng
          </Menu.Item>
          <Menu.Item key="pet-list" icon={<UnorderedListOutlined />}>
            Danh sách thú cưng
          </Menu.Item>
          <Menu.Item key="transaction-history" icon={<HistoryOutlined />}>
            Lịch sử giao dịch
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />}>
            Đăng xuất
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ margin: '16px', padding: '24px', background: '#fff' }}>
          <Title level={2} style={{ margin: '16px 0' }} className="text-center">
            Danh sách thú cưng
          </Title>
          <Table columns={columns} dataSource={pets} rowKey="PetID" pagination={false} />
          <div className="flex justify-end mt-4">
            <Button type="primary" onClick={() => setIsAddModalVisible(true)}>
              Thêm thú cưng
            </Button>
          </div>

          <Modal
            title="Thêm thú cưng"
            visible={isAddModalVisible}
            onCancel={() => setIsAddModalVisible(false)}
            footer={[
              <Button key="back" onClick={() => setIsAddModalVisible(false)}>
                Hủy
              </Button>,
              <Button key="submit" type="primary" onClick={handleAddPet}>
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
              <Button key="submit" type="primary" onClick={handleSavePet}>
                Lưu
              </Button>,
            ]}
          >
            <Form form={editForm} layout="vertical">
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
