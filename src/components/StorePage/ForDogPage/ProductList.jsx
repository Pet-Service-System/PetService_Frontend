import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Button, Input, Modal, Form, Card, Skeleton, Image, message, Select } from 'antd';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const { Option } = Select;
const { Title } = Typography;

const ProductList = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // State for API call status
  const [userRole] = useState(localStorage.getItem('role') || 'Guest');
  const [petTypeID] = useState('PT001');
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [addMode, setAddMode] = useState(false); // false: view mode, true: add mode
  const [form] = Form.useForm();
  const [productImg, setProductImg] = useState(""); // For image upload
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    setProductImg("");
  };

  const handleSaveAdd = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error(t('authorization_token_not_found'));
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
        message.error(t('upload_product_image'));
        return;
      }
      message.warning(t('processing'));
      const response = await axios.post('http://localhost:3001/api/products', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 201) {
        message.success(t('product_added_successfully'), 0.5).then(() => {
          window.location.reload();
        });
      } else {
        message.error(t('failed_to_add_product'));
      }
    } catch (error) {
      console.error('Error adding product:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error(t('unauthorized'));
        } else if (error.response.data && error.response.data.message) {
          message.error(`${t('error_adding_product')}: ${error.response.data.message}`);
        } else {
          message.error(t('error_adding_product'));
        }
      } else if (error.request) {
        message.error(t('network_or_server_issue'));
      } else {
        message.error(`${t('error_adding_product')}: ${error.message}`);
      }
    } finally {
      setSaving(false);
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
    setProductImg("");
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    form.resetFields();
    setProductImg("");
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error(t('authorization_token_not_found'));
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
        message.success(t('product_updated_successfully'), 0.5).then(() => {
          window.location.reload();
        });
      } else {
        message.error(t('failed_to_update_product'));
      }
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error(t('unauthorized'));
        } else if (error.response.data && error.response.data.message) {
          message.error(`${t('error_updating_product')}: ${error.response.data.message}`);
        } else {
          message.error(t('error_updating_product'));
        }
      } else if (error.request) {
        message.error(t('network_or_server_issue'));
      } else {
        message.error(`${t('error_updating_product')}: ${error.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleProductImageUpload = (e) => {
    const file = e.target.files[0];
    setProductImg(file);
    form.setFieldsValue({ Image: file });
  };

  const columns = [
    {
      title: t('product_id'),
      dataIndex: 'ProductID',
      key: 'ProductID',
      render: (text, record) => (
        <div className='hover:text-sky-600 hover:cursor-pointer' onClick={() => handleProductClick(record.ProductID)}>
          {text}
        </div>
      ),
    },
    {
      title: t('product_name'),
      dataIndex: 'ProductName',
      key: 'ProductName',
      render: (text, record) => (
        <div className='hover:text-sky-600 hover:cursor-pointer' onClick={() => handleProductClick(record.ProductID)}>
          {text}
        </div>
      ),
    },
    {
      title: t('price'),
      dataIndex: 'Price',
      key: 'Price',
      render: (text) => (
        <span>{typeof text === 'number' ? `$${text.toFixed(2)}` : '-'}</span>
      ),
    },
    {
      title: t('description'),
      dataIndex: 'Description',
      key: 'Description',
    },
    {
      title: t('image_url'),
      dataIndex: 'ImageURL',
      key: 'ImageURL',
      render: (text, record) => (
        <Image src={text} alt={record.ProductName} style={{ width: '50px', cursor: 'pointer' }} />
      ),
    },
    {
      title: t('status'),
      dataIndex: 'Status',
      key: 'Status',
      render: (text) => (
        <span style={{ color: text === 'Available' ? 'green' : text === 'Unavailable' ? 'red' : 'black' }}>
          {text}
        </span>
      ),
    },
    {
      title: t('quantity'),
      dataIndex: 'Quantity',
      key: 'Quantity',
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => (
        userRole === 'Store Manager' && (
          <div>
            <Button type="primary" onClick={() => handleEditClick(record)} style={{ marginRight: '8px' }}>{t('edit')}</Button>
          </div>
        )
      ),
    },
  ];

  return (
    <div className="p-10">
      <Title level={1} className='text-center'>{t('product_for_dogs')}</Title>
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
              <Button type="primary" onClick={handleAddClick} disabled={loading}>{t('add_product')}</Button>
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
                    <h3 className="text-2xl font-semibold">{product.ProductName}</h3>
                    <p className="text-green-600 mt-2 text-3xl">${product.Price.toFixed(2)}</p>
                    <p className="text-gray-500 mt-2">{product.Description}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </Form>

      <Modal
        title={editMode ? t('edit_product') : t('add_new_product')}
        visible={addMode || editMode !== null}
        onCancel={editMode ? handleCancelEdit : handleCancelAdd}
        footer={[
          <Button key="cancel" onClick={editMode ? handleCancelEdit : handleCancelAdd} disabled={saving}>{t('cancel')}</Button>,
          <Button key="submit" type="primary" onClick={editMode ? handleSaveEdit : handleSaveAdd} disabled={saving}>
            {editMode ? t('save') : t('add')}
          </Button>,
        ]}
        style={{ textAlign: 'center' }}
      >
        <Form form={form} className='text-left'>
          <Form.Item
            name="ProductName"
            rules={[{ required: true, message: t('enter_product_name') }]}
          >
            <Input placeholder={t('product_name')} />
          </Form.Item>
          <Form.Item
            name="Price"
            rules={[{ required: true, message: t('enter_product_price') }]}
          >
            <Input placeholder={t('price')} />
          </Form.Item>
          <Form.Item
            name="Description"
            rules={[{ required: true, message: t('enter_product_description') }]}
          >
            <Input placeholder={t('description')} />
          </Form.Item>
          <Form.Item
            name="Image"
            rules={[{ required: true, message: t('upload_product_image') }]}
          >
            <Input type="file" onChange={handleProductImageUpload} />
            {productImg && (
              <Image src={URL.createObjectURL(productImg)} alt={t('product_preview')} style={{ width: '100px', marginTop: '10px' }} />
            )}
          </Form.Item>
          <Form.Item
            name="Quantity"
            rules={[{ required: true, message: t('enter_product_quantity') }]}
          >
            <Input placeholder={t('quantity')} />
          </Form.Item>
          <Form.Item
            name="Status"
            rules={[{ required: true, message: t('select_product_status') }]}
          >
            <Select placeholder={t('status')}>
              <Option value="Available">{t('available')}</Option>
              <Option value="Unavailable">{t('unavailable')}</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;
