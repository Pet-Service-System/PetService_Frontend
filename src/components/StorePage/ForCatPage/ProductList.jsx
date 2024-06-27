import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Button, Input, Modal, Form, Card, Skeleton, Image, message, Select } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { Title } = Typography;

const ProductList = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // State for API call status
  const [userRole] = useState(localStorage.getItem('role') || 'Guest');
  const [petTypeID] = useState('PT002');
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [addMode, setAddMode] = useState(false); // false: view mode, true: add mode
  const [form] = Form.useForm();
  const [productImg, setProductImg] = useState(""); // For image upload
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/products');
        const filteredProducts = response.data.filter(product => product.PetTypeID === petTypeID);
        setProductData(filteredProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [petTypeID]);

  const handleProductClick = (id) => {
    navigate(`/product-detail/${id}`);
  };

  const handleAddClick = () => {
    setAddMode(true);
  };

  const handleCancelAdd = () => {
    setAddMode(false);
    form.resetFields();
    setProductImg(""); // Reset image state
  };

  const handleSaveAdd = async () => {
    try {
      setSaving(true); // Start saving
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authorization token not found. Please log in.');
        return;
      }
  
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('ProductName', values.ProductName);
      formData.append('Price', parseFloat(values.Price));
      formData.append('Description', values.Description);
      formData.append('Quantity', parseInt(values.Quantity, 10));
      formData.append('PetTypeID', petTypeID);
      formData.append('Status', values.Status);
      if (productImg) {
        formData.append('image', productImg);
      } else {
        message.error('Please upload the product image!');
        return;
      }
      message.warning('Processing...')
      const response = await axios.post('http://localhost:3001/api/products', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
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
      if (error.response) {
        if (error.response.status === 401) {
          message.error('Unauthorized. Please log in.');
        } else if (error.response.data && error.response.data.message) {
          message.error(`Error adding product: ${error.response.data.message}`);
        } else {
          message.error('Error adding product');
        }
      } else if (error.request) {
        message.error('Error adding product: Network or server issue');
      } else {
        message.error(`Error adding product: ${error.message}`);
      }
    } finally {
      setSaving(false); // End saving
    }
  };

  const handleEditClick = (record) => {
    setEditMode(record.ProductID);
    form.setFieldsValue({
      ProductName: record.ProductName,
      Price: record.Price,
      Description: record.Description,
      Quantity: record.Quantity,
      Status: record.Status,
    });
    setProductImg(""); // Reset image state
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
    setProductImg(""); // Reset image state
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true); // Start saving
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authorization token not found. Please log in.');
        return;
      }

      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('ProductName', values.ProductName);
      formData.append('Price', parseFloat(values.Price));
      formData.append('Description', values.Description);
      formData.append('Quantity', parseInt(values.Quantity, 10));
      formData.append('Status', values.Status);
      if (productImg) {
        formData.append('image', productImg);
      }
      message.warning('Processing...')
      for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }    
      const response = await axios.patch(`http://localhost:3001/api/products/${editMode}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        message.success('Product updated successfully', 0.5).then(() => {
          window.location.reload();
        });
      } else {
        message.error('Failed to update product: Unexpected server response');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error('Unauthorized. Please log in.');
        } else if (error.response.data && error.response.data.message) {
          message.error(`Error updating product: ${error.response.data.message}`);
        } else {
          message.error('Error updating product');
        }
      } else if (error.request) {
        message.error('Error updating product: Network or server issue');
      } else {
        message.error(`Error updating product: ${error.message}`);
      }
    } finally {
      setSaving(false); // End saving
    }
  };

  const handleProductImageUpload = (e) => {
    const file = e.target.files[0];
    setProductImg(file);
    form.setFieldsValue({ Image: file });
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
      title: 'Quantity',
      dataIndex: 'Quantity',
      key: 'Quantity',
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

  return (
    <div className="p-10">
      <Title level={1} className='text-center'>Product for dogs</Title>
      <Form form={form}>
        {userRole === 'Store Manager' ? (
          <>
            <Table
              dataSource={productData}
              columns={columns}
              rowKey="ProductID"
              loading={loading}
              bordered
              scroll={{ x: 'max-content' }}
            />
            <div className="flex justify-end mt-4">
              <Button type="primary" onClick={handleAddClick} disabled={loading}>Add Product</Button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} style={{ width: 240 }}>
                  <Skeleton.Image style={{ width: 240, height: 150 }} />
                  <Skeleton active />
                </Card>
              ))
            ) : (
              productData.map(product => (
                <Card
                  key={product.ProductID}
                  hoverable
                  className="bg-white rounded-lg shadow-md transition-transform transform-gpu hover:scale-105"
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
        title={editMode ? "Edit Product" : "Add New Product"}
        visible={addMode || editMode !== null}
        onCancel={editMode ? handleCancelEdit : handleCancelAdd}
        footer={[
          <Button key="cancel" onClick={editMode ? handleCancelEdit : handleCancelAdd} disabled={saving}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={editMode ? handleSaveEdit : handleSaveAdd} disabled={saving}>
            {editMode ? "Save" : "Add"}
          </Button>,
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
            name="Image"
            rules={[{ required: true, message: 'Please upload the product image!' }]}
          >
            <Input type="file" onChange={handleProductImageUpload} />
            {productImg && (
              <Image src={URL.createObjectURL(productImg)} alt="Product Preview" style={{ width: '100px', marginTop: '10px' }} />
            )}
          </Form.Item>
          <Form.Item
            name="Quantity"
            rules={[{ required: true, message: 'Please enter the product quantity' }]}
          >
            <Input placeholder="Quantity" />
          </Form.Item>
          <Form.Item
            name="Status"
            rules={[{ required: true, message: 'Please select the product status' }]}
          >
            <Select placeholder="Status">
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
