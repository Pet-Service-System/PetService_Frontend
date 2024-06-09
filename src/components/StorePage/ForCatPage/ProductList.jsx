import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Button, Input, Modal, Form, Card, Skeleton, Image, message } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const ProductList = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole] = useState(localStorage.getItem('role') || 'guest');
  const [petTypeId] = useState('PT002');
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [addMode, setAddMode] = useState(false); // false: view mode, true: add mode
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/products');
        const filteredProducts = response.data.filter(product => product.PetTypeId === petTypeId);
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
      ImageURL: record.ImageURL // Add ImageURL to form
    });
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
  };

  const handleSaveEdit = async (id) => {
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
        ImageURL: values.ImageURL
      };
  
      await axios.patch(`http://localhost:3001/api/products/${id}`, updatedProduct, {
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
  

  const handleDeleteClick = (id) => {
    Modal.confirm({
        title: 'Are you sure you want to delete this product?',
        onOk: async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    message.error('Authorization token not found. Please log in.');
                    return;
                }
                
                await axios.delete(`http://localhost:3001/api/products/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                
                message.success('Product deleted successfully', 0.5).then(() => {
                  window.location.reload(); 
                });
            } catch (error) {
                console.error('Error deleting product:', error);
                if (error.response && error.response.status === 401) {
                    message.error('Unauthorized. Please log in.');
                } else {
                    message.error('Error deleting product');
                }
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
        petTypeId: petTypeId // Bổ sung petTypeId vào giá trị sản phẩm mới
      };
      console.log(newProduct)
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
      title: 'Product Name',
      dataIndex: 'ProductName',
      key: 'ProductName',
      render: (text, record) => (
        editMode === record.ProductID ? (
          <Form.Item
            name="ProductName"
            rules={[{ required: true, message: 'Please enter the product name!' }]}
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
      title: 'Price',
      dataIndex: 'Price',
      key: 'Price',
      render: (text, record) => (
        editMode === record.ProductID ? (
          <Form.Item
            name="Price"
            rules={[{ required: true, message: 'Please enter the product price!' }]}
          >
            <Input placeholder="Price" />
          </Form.Item>
        ) : (
          <span>{typeof text === 'number' ? `$${text.toFixed(2)}` : '-'}</span>
        )
      ),
    },    
    {
      title: 'Description',
      dataIndex: 'Description',
      key: 'Description',
      render: (text, record) => (
        editMode === record.ProductID ? (
          <Form.Item
            name="Description"
            rules={[{ required: true, message: 'Please enter the product description!' }]}
          >
            <Input placeholder="Description" />
          </Form.Item>
        ) : text
      ),
    },
    {
      title: 'Image URL',
      dataIndex: 'ImageURL',
      key: 'ImageURL',
      render: (text, record) => (
        editMode === record.ProductID ? (
          <Form.Item
            name="ImageURL"
            rules={[{ required: true, message: 'Please upload the product image!' }]}
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
              <Button type="primary" onClick={() => handleSaveEdit(record.ProductID)} style={{ marginRight: '8px' }}>Save</Button>
              <Button onClick={handleCancelEdit}>Cancel</Button>
            </div>
          ) : (
            <div>
              <Button type="primary" onClick={() => handleEditClick(record)} style={{ marginRight: '8px' }}>Edit</Button>
              <Button danger onClick={() => handleDeleteClick(record.ProductID)}>Delete</Button>
            </div>
          )
        )
      ),
    },
  ];

  return (
    <div className="p-36">
      <Title level={2}>Product List</Title>
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
              <Button type="primary" onClick={handleAddClick}>Add Product</Button>
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
        title="Add New Product"
        visible={addMode}
        onCancel={handleCancelAdd}
        footer={[
          <Button key="cancel" onClick={handleCancelAdd}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleSaveAdd}>Add</Button>,
        ]}
        style={{ textAlign: 'center' }}
      >
        <Form form={form}>
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
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;
