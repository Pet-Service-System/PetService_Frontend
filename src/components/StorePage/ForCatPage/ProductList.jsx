import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Button, Input, Modal, Form, Card, Skeleton, Image, message, Select } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { Title } = Typography;

const ProductList = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole] = useState(localStorage.getItem('role') || 'Guest');
  const [petTypeId] = useState('PT002');
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [addMode, setAddMode] = useState(false); // false: view mode, true: add mode
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/products');
        const filteredProducts = response.data.filter(product => product.PetTypeID === petTypeId);
        setProductData(filteredProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [petTypeId]);

  const handleProductClick = (id) => {
    navigate(`/product-detail/${id}`);
  };

  const handleEditClick = (record) => {
    setEditMode(record.ProductID);
    form.setFieldsValue({
      ProductName: record.ProductName,
      Price: record.Price,
      Description: record.Description,
      ImageURL: record.ImageURL,
      Status: record.Status
    });
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authorization token not found. Please log in.');
        return;
      }

      const values = await form.validateFields(); // Validate form fields
      const updatedProduct = {
        ProductName: values.ProductName,
        Price: parseFloat(values.Price),
        Description: values.Description,
        ImageURL: values.ImageURL,
        Status: values.Status
      };

      await axios.patch(`http://localhost:3001/api/products/${editMode}`, updatedProduct, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      message.success('Product updated successfully', 0.5).then(() => {
        window.location.reload(); // Reload the page after successful update
      });
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.response && error.response.status === 401) {
        message.error('Unauthorized. Please log in.');
      } else {
        message.error('Error updating product');
      }
    }
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
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authorization token not found. Please log in.');
        return;
      }

      const values = await form.validateFields(); // Validate form fields
      const newProduct = {
        productName: values.ProductName,
        price: parseFloat(values.Price),
        description: values.Description,
        imageURL: values.ImageURL,
        petTypeID: petTypeId,
        status: values.Status
      };

      const response = await axios.post(`http://localhost:3001/api/products`, newProduct, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        message.success('Product added successfully', 0.5).then(() => {
          window.location.reload();
        });
      } else {
        message.error('Failed to add product: Unexpected server response');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      if (error.response && error.response.status === 401) {
        message.error('Unauthorized. Please log in.');
      } else if (error.response && error.response.data && error.response.data.message) {
        message.error(`Error adding product: ${error.response.data.message}`);
      } else {
        message.error('Error adding product');
      }
    }
  };

  const columns = [
    {
      title: 'Product ID',
      dataIndex: 'ProductID',
      key: 'ProductID',
      render: (text, record) => (
        <div className='hover:text-sky-600 hover:cursor-pointer' onClick={() => handleProductClick(record.ProductID)}>
          {text}
        </div>
      ),
    },
    {
      title: 'Product Name',
      dataIndex: 'ProductName',
      key: 'ProductName',
      render: (text, record) => (
        <div className='hover:text-sky-600 hover:cursor-pointer' onClick={() => handleProductClick(record.ProductID)}>
          {text}
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'Price',
      key: 'Price',
      render: (text) => (
        <span>{typeof text === 'number' ? `$${text.toFixed(2)}` : '-'}</span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'Description',
      key: 'Description',
    },
    {
      title: 'Image URL',
      dataIndex: 'ImageURL',
      key: 'ImageURL',
      render: (text, record) => (
        <Image src={text} alt={record.ProductName} style={{ width: '50px', cursor: 'pointer' }} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      render: (text) => (
        <span style={{ color: text === 'Available' ? 'green' : text === 'Unavailable' ? 'red' : 'black' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        userRole === 'Store Manager' && (
          <div>
            <Button type="primary" onClick={() => handleEditClick(record)} style={{ marginRight: '8px' }}>Edit</Button>
          </div>
        )
      ),
    },
  ];
  console.log(productData)
  return (
    <div className="p-24">
      <Title level={1} className='text-center'>Product for cats</Title>
      <Form form={form}>
        {userRole === 'Store Manager' ? (
          <>
            <Table
              dataSource={productData}
              columns={columns}
              rowKey="ProductID"
              pagination={false}
              loading={loading}
            />
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <Button type="primary" onClick={handleAddClick} disabled={loading}>Add Product</Button>
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
                  className="w-72 mx-4 my-6 bg-white rounded-lg shadow-md transition-transform transform-gpu hover:scale-105"
                  onClick={() => handleProductClick(product.ProductID)}
                >
                  <img 
                    alt={product.ProductName} 
                    src={product.ImageURL} 
                    className="rounded-t-lg w-full h-44 object-cover" 
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{product.ProductName}</h3>
                    <p className="text-gray-600 mt-2">${product.Price.toFixed(2)}</p>
                    <p className="text-gray-700 mt-2">{product.Description}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </Form>

      <Modal
        title="Add New Product"
        visible={addMode}
        onCancel={handleCancelAdd}
        footer={[
          <Button key="cancel" onClick={handleCancelAdd}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleSaveAdd}>Add</Button>,
        ]}
        style={{ textAlign: 'center' }}
      >
        <Form form={form} className='text-left'>
          <Form.Item
            name="ProductName"
            rules={[{ required: true, message: 'Please enter the product name!' }]}
          >
            <Input placeholder="Product Name" />
          </Form.Item>
          <Form.Item
            name="Price"
            rules={[{ required: true, message: 'Please enter the product price!' }]}
          >
            <Input placeholder="Price" />
          </Form.Item>
          <Form.Item
            name="Description"
            rules={[{ required: true, message: 'Please enter the product description' }]}
          >
            <Input placeholder="Description" />
          </Form.Item>
          <Form.Item
            name="ImageURL"
            rules={[{ required: true, message: 'Please upload the product image!' }]}
          >
            <Input placeholder="Image URL" />
          </Form.Item>
          <Form.Item
              name="Status"
              rules={[{ required: true, message: 'Please select the service status!' }]}
            >
              <Select placeholder="Select Status">
                <Option value="Available">Available</Option>
                <Option value="Unavailable">Unavailable</Option>
              </Select>
            </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Product"
        visible={editMode !== null}
        onCancel={handleCancelEdit}
        footer={[
          <Button key="cancel" onClick={handleCancelEdit}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleSaveEdit}>Save</Button>,
        ]}
        style={{ textAlign: 'center' }}
      >
        <Form form={form} className='text-left'>
          <Form.Item
            name="ProductName"
            rules={[{ required: true, message: 'Please enter the product name!' }]}
          >
            <Input placeholder="Product Name" />
          </Form.Item>
          <Form.Item
            name="Price"
            rules={[{ required: true, message: 'Please enter the product price!' }]}
          >
            <Input placeholder="Price" />
          </Form.Item>
          <Form.Item
            name="Description"
            rules={[{ required: true, message: 'Please enter the product description' }]}
          >
            <Input placeholder="Description" />
          </Form.Item>
          <Form.Item
            name="ImageURL"
            rules={[{ required: true, message: 'Please upload the product image!' }]}
          >
            <Input placeholder="Image URL" />
          </Form.Item>
          <Form.Item
              name="Status"
              rules={[{ required: true, message: 'Please select the service status!' }]}
            >
              <Select placeholder="Select Status">
                <Option value="Available">Available</Option>
                <Option value="Unavailable">Unavailable</Option>
              </Select>
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;
