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

  const handleEditClick = (record) => {
    setEditMode(record.ProductID);
    form.setFieldsValue({
      ProductName: record.ProductName,
      Price: record.Price,
      Description: record.Description,
      ImageURL: record.ImageURL,
      Status: record.Status,
      Quantity: record.Quantity
    });
    setProductImg(record.ImageURL); // Set initial image URL
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
    setProductImg(""); // Reset image state
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
        ImageURL: productImg,
        Status: values.Status,
        Quantity: parseInt(values.Quantity, 10)
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
    setProductImg(""); // Reset image state
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
        ProductName: values.ProductName,
        Price: parseFloat(values.Price),
        Description: values.Description,
        ImageURL: productImg,
        petTypeId: petTypeID,
        Status: values.Status,
        Quantity: parseInt(values.Quantity, 10)
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

  const handleProductImageUpload = (e) => {
    const file = e.target.files[0];
    transformFileData(file);
  };

  const transformFileData = (file) => {
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setProductImg(reader.result);
      };
    } else {
      setProductImg("");
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
      <Title level={1} className='text-center'>Product for cats</Title>
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
            <Input type="file" onChange={handleProductImageUpload} />
            {productImg && (
              <Image src={productImg} alt="Product Preview" style={{ width: '100px', marginTop: '10px' }} />
            )}
          </Form.Item>
          <Form.Item
            name="Quantity"
            rules={[{ required: true, message: 'Please enter the product quantity!' }]}
          >
            <Input placeholder="Quantity" />
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
            <Input type="file" onChange={handleProductImageUpload} />
            {productImg && (
              <Image src={productImg} alt="Product Preview" style={{ width: '100px', marginTop: '10px' }} />
            )}
          </Form.Item>
          <Form.Item
            name="Quantity"
            rules={[{ required: true, message: 'Please enter the product quantity!' }]}
          >
            <Input placeholder="Quantity" />
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
