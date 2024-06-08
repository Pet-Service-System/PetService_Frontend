import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Button, Input, Modal, Form, Card, Skeleton, Image } from 'antd';
import axios from 'axios';
const { Title } = Typography;

const ProductList = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'guest');
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [addMode, setAddMode] = useState(false); // false: view mode, true: add mode
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/products');
        const dogProducts = response.data.filter(product => product.PetTypeId === 'PT001');
        setProductData(dogProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (id) => {
    navigate(`/product-detail/${id}`);
  };

  const handleEditClick = (record) => {
    setEditMode(record.ProductID);
    form.setFieldsValue({
      ProductName: record.ProductName,
      Price: record.Price,
      Description: record.Description,
      ImageURL: record.ImageURL // Thêm URL hình ảnh vào form
    });
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
  };

  const handleSaveEdit = async (id) => {
    try {
      const values = await form.validateFields();
      const response = await axios.put(`http://localhost:3001/api/products/${id}`, values);
      setProductData(productData.map(product => product.ProductID === id ? response.data : product));
      setEditMode(null);
      form.resetFields();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteClick = (id) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3001/api/products/${id}`);
          setProductData(productData.filter(product => product.ProductID !== id));
        } catch (error) {
          console.error('Error deleting product:', error);
        }
      },
    });
  };

  const handleAddClick = () => {
    setAddMode(true);
  };

  const handleCancelAdd = () => {
    setAddMode(false);
    form.resetFields();
  };

  const handleSaveAdd = async () => {
    try {
      const values = await form.validateFields();
      const response = await axios.post('http://localhost:3001/api/products', values);
      setProductData([...productData, response.data]);
      setAddMode(false);
      form.resetFields();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'ProductName',
      key: 'ProductName',
      render: (text, record) => (
        editMode === record.ProductID ? (
          <Form.Item
            name="ProductName"
            rules={[{ required: true, message: 'Hãy nhập tên sản phẩm!' }]}
          >
            <Input placeholder="Product Name" />
          </Form.Item>
        ) : (
          <div className='hover:text-sky-600 hover:cursor-pointer' onClick={() => handleProductClick(record.ProductID)}>
            {text}
          </div>
        )
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'Price',
      key: 'Price',
      render: (text, record) => (
        editMode === record.ProductID ? (
          <Form.Item
            name="Price"
            rules={[{ required: true, message: 'Hãy nhập giá sản phẩm!' }]}
          >
            <Input placeholder="Price" />
          </Form.Item>
        ) : `$${text.toFixed(2)}`
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'Description',
      key: 'Description',
      render: (text, record) => (
        editMode === record.ProductID ? (
          <Form.Item
            name="Description"
            rules={[{ required: true, message: 'Hãy nhập mô tả sản phẩm!' }]}
          >
            <Input placeholder="Description" />
          </Form.Item>
        ) : text
      ),
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'ImageURL',
      key: 'ImageURL',
      render: (text, record) => (
        editMode === record.ProductID ? (
          <Form.Item
            name="ImageURL"
            rules={[{ required: true, message: 'Hãy tải hình ảnh sản phẩm!' }]}
          >
            <Input placeholder="Image URL" />
          </Form.Item>
        ) : (
          <>
            <Image src={text} alt={record.ProductName} style={{ width: '50px', cursor: 'pointer' }} />
          </>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        userRole === 'manager' && (
          editMode === record.ProductID ? (
            <div>
              <Button type="primary" onClick={() => handleSaveEdit(record.ProductID)} style={{ marginRight: '8px' }}>Lưu</Button>
              <Button onClick={handleCancelEdit}>Hủy</Button>
            </div>
          ) : (
            <div>
              <Button type="primary" onClick={() => handleEditClick(record)} style={{ marginRight: '8px' }}>Sửa</Button>
              <Button danger onClick={() => handleDeleteClick(record.ProductID)}>Xóa</Button>
            </div>
          )
        )
      ),
    },
  ];

  return (
    <div className="p-36">
      <Title level={2}>Danh sách sản phẩm</Title>
      <Form form={form}>
        {userRole === 'manager' ? (
          <>
            <Table
              dataSource={productData}
              columns={columns}
              rowKey="ProductID"
              pagination={false}
              loading={loading}
            />
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <Button type="primary" onClick={handleAddClick}>Thêm sản phẩm</Button>
            </div>
          </>
        ) : (
          <div className="card-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} style={{ width: 240, margin: '16px' }}>
                  <Skeleton.Image style={{ width: 240, height: 150 }} />
                  <Skeleton active />
                </Card>
              ))
            ) : (
              productData.map(product => (
                <Card
                  key={product.ProductID}
                  hoverable
                  style={{ width: 240, margin: '16px' }}
                  cover={<img alt={product.ProductName} src={product.ImageURL} />}
                  onClick={() => handleProductClick(product.ProductID)}
                >
                  <Card.Meta title={product.ProductName} description={`$${product.Price.toFixed(2)}`} />
                  <p>{product.Description}</p>
                </Card>
              ))
            )}
          </div>
        )}
      </Form>

      <Modal
        title="Thêm sản phẩm mới"
        visible={addMode}
        onCancel={handleCancelAdd}
        footer={[
          <Button key="cancel" onClick={handleCancelAdd}>Hủy</Button>,
          <Button key="submit" type="primary" onClick={handleSaveAdd}>Thêm</Button>,
        ]}
        style={{ textAlign: 'center' }}
      >
        <Form form={form}>
          <Form.Item
            name="ProductName"
            rules={[{ required: true, message: 'Hãy nhập tên sản phẩm!' }]}
          >
            <Input placeholder="Tên sản phẩm" />
          </Form.Item>
          <Form.Item
            name="Price"
            rules={[{ required: true, message: 'Hãy nhập giá sản phẩm!' }]}
          >
            <Input placeholder="Giá" />
          </Form.Item>
          <Form.Item
            name="Description"
            rules={[{ required: true, message: 'Hãy nhập mô tả sản phẩm' }]}
          >
            <Input placeholder="Mô tả" />
          </Form.Item>
          <Form.Item
            name="ImageURL"
            rules={[{ required: true, message: 'Hãy tải hình ảnh sản phẩm!' }]}
            >
              <Input placeholder="Hình ảnh" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };
  
  export default ProductList;
  
