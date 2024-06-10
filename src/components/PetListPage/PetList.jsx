import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Table, Button, Input, Select, Form, Typography, message } from 'antd';
import { UserOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios'; // Import axios for making API calls

const { Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const PetList = () => {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editPetId, setEditPetId] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const genders = ['Đực', 'Cái'];

  // Fetch pets from the server
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const accountId = user.id; // Lấy ID người dùng từ localStorage
        console.log(accountId)
        if (!token || !accountId) {
          console.error('Token or account ID not found in localStorage');
          return;
        }

        const response = await axios.get(`http://localhost:3001/api/pets/account/${accountId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPets(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching pets:', error);
        message.error('Failed to fetch pets');
      }
    };

    fetchPets();
  }, []);

  const handleUpdatePet = (pet) => {
    setEditPetId(pet.id);
    editForm.setFieldsValue(pet);
  };

  const handleSavePet = () => {
    editForm.validateFields().then((values) => {
      setPets(pets.map((pet) => (pet.id === editPetId ? { ...pet, ...values } : pet)));
      setEditPetId(null);
      message.success('Pet updated successfully');
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  const handleDeletePet = (id) => {
    setPets(pets.filter((pet) => pet.id !== id));
    message.success('Pet deleted successfully');
  };

  const handleAddPet = () => {
    form.validateFields().then((values) => {
      const newPet = { id: pets.length + 1, ...values };
      setPets([...pets, newPet]);
      setIsAddMode(false);
      form.resetFields();
      message.success('Pet added successfully');
    }).catch((info) => {
      console.log('Validate Failed:', info);
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'PetID', key: 'PetID' },
    { title: 'Tên', dataIndex: 'PetName', key: 'PetName' },
    { title: 'Giới tính', dataIndex: 'Gender', key: 'Gender' },
    { title: 'Trạng thái', dataIndex: 'Status', key: 'Status' },
    { title: 'Loại thú cưng', dataIndex: 'PetTypeID', key: 'PetTypeID', render: (petTypeID) => petTypeID === 'PT001' ? 'Chó' : petTypeID === 'PT002' ? 'Mèo' : petTypeID },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        record.PetID === editPetId ? (
          <>
            <Button type="primary" onClick={handleSavePet} className="mr-2">Lưu</Button>
            <Button onClick={() => setEditPetId(null)}>Hủy</Button>
          </>
        ) : (
          <>
            <Button type="primary" onClick={() => handleUpdatePet(record)} className="mr-2">Cập nhật</Button>
            <Button danger onClick={() => handleDeletePet(record.PetID)}>Xóa</Button>
          </>
        )
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
          <Title level={2} style={{ margin: '16px 0' }} className='text-center'>Danh sách thú cưng</Title>
          <Table columns={columns} dataSource={pets} rowKey="id" pagination={false} />
          {isAddMode && (
            <Form form={form} layout="inline" onFinish={handleAddPet} style={{ marginTop: '16px' }} className='justify-end'>
              <Form.Item name="name" rules={[{ required: true, message: 'Tên không được để trống' }]}>
                <Input placeholder="Tên" />
              </Form.Item>
              <Form.Item name="species" rules={[{ required: true, message: 'Chủng loại không được để trống' }]}>
                <Input placeholder="Chủng loại" />
              </Form.Item>
              <Form.Item name="gender" rules={[{ required: true, message: 'Giới tính không được để trống' }]}>
                <Select placeholder="Chọn giới tính">
                  {genders.map((gender, index) => (
                    <Option key={index} value={gender}>{gender}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">Thêm</Button>
              </Form.Item>
              <Form.Item>
                <Button onClick={() => setIsAddMode(false)}>Hủy</Button>
              </Form.Item>
            </Form>
          )}
          <div className="flex justify-end mt-4">
            {!isAddMode && <Button type="primary" onClick={() => setIsAddMode(true)}>Thêm thú cưng</Button>}
          </div>
          {editPetId && (
            <Form form={editForm} layout="inline" onFinish={handleSavePet} style={{ marginTop: '16px' }}>
              <Form.Item name="name" rules={[{ required: true, message: 'Tên không được để trống' }]}>
                <Input placeholder="Tên" />
              </Form.Item>
              <Form.Item name="species" rules={[{ required: true, message: 'Chủng loại không được để trống' }]}>
                <Input placeholder="Chủng loại" />
              </Form.Item>
              <Form.Item name="gender" rules={[{ required: true, message: 'Giới tính không được để trống' }]}>
                <Select placeholder="Chọn giới tính">
                  {genders.map((gender, index) => (
                    <Option key={index} value={gender}>{gender}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default PetList;
