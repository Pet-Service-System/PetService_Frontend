import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Button, Input, Modal, Form, Card, Skeleton, Image, message, Select, Tabs, InputNumber } from 'antd';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../../../styles/style.css';

const { Option } = Select;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Search } = Input;
const { TabPane  } = Tabs;
const API_URL = import.meta.env.REACT_APP_API_URL;

const ProductList = () => {
  const [productData, setProductData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // State for API call status
  const [userRole] = useState(localStorage.getItem('role') || 'Guest');
  const [petTypeID] = useState('PT002');
  const [editMode, setEditMode] = useState(null); // null: view mode, id: edit mode
  const [addMode, setAddMode] = useState(false); // false: view mode, true: add mode
  const [form] = Form.useForm();
  const [productImg, setProductImg] = useState(""); // For image upload
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState([]); // State for filtered data
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [activeCategory, setActiveCategory] = useState('');
  const { t } = useTranslation();

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      const filteredProducts = response.data.filter(product => product.PetTypeID === petTypeID);
      setProductData(filteredProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Error fetching categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    // Filter products based on activeCategory whenever it changes
    const filteredData = activeCategory === 'all' 
      ? productData 
      : productData.filter(product => product.CategoryID === activeCategory);
    setFilteredProducts(filteredData);
  }, [activeCategory, productData]);
  

  useEffect(() => {
    const filteredData = productData.filter(product =>
      product.ProductName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filteredData);
  }, [searchQuery, productData]);

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
      formData.append('CategoryID', values.CategoryID); // Added CategoryID
      formData.append('Status', values.Status);
      if (productImg) {
        formData.append('image', productImg);
      } else {
        message.error(t('please_upload_product_image'));
        return;
      }
      message.warning(t('processing'));
      const response = await axios.post(`${API_URL}/api/products`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        message.success(t('product_added_successfully'))
        fetchProducts();
        form.resetFields();
        setProductImg("");
        setAddMode(false);
      } else {
        message.error(t('failed_to_add_product'));
      }
    } catch (error) {
      console.error('Error adding product:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error(t('unauthorized_please_log_in'));
        } else if (error.response.data && error.response.data.message) {
          message.error(`${t('error_adding_product')}: ${error.response.data.message}`);
        } else {
          message.error(t('error_adding_product'));
        }
      } else if (error.request) {
        message.error(t('error_adding_product_network_or_server_issue'));
      } else {
        message.error(`${t('error_adding_product')}: ${error.message}`);
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
      CategoryID: record.CategoryID, // Added CategoryID
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
      formData.append('CategoryID', values.CategoryID); // Added CategoryID
      if (productImg) {
        formData.append('image', productImg);
      }
      message.warning(t('processing'));
      for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }
      const response = await axios.patch(`${API_URL}/api/products/${editMode}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        message.success(t('product_updated_successfully'))
        form.resetFields();
        fetchProducts();
        setEditMode(null);
      } else {
        message.error(t('failed_to_update_product'));
      }
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.response) {
        if (error.response.status === 401) {
          message.error(t('unauthorized_please_log_in'));
        } else if (error.response.data && error.response.data.message) {
          message.error(`${t('error_updating_product')}: ${error.response.data.message}`);
        } else {
          message.error(t('error_updating_product'));
        }
      } else if (error.request) {
        message.error(t('error_updating_product_network_or_server_issue'));
      } else {
        message.error(`${t('error_updating_product')}: ${error.message}`);
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
      title: t('image_url'),
      dataIndex: 'ImageURL',
      key: 'ImageURL',
      fixed: 'left',
      className: 'sticky left-0 bg-white',
      render: (text, record) => (
        <Image src={text} alt={record.ProductName} style={{ width: '50px', cursor: 'pointer' }} />
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
        <span>{typeof text === 'number' ? `${text}` : '-'}đ</span>
      ),
    },
    {
      title: t('description'),
      dataIndex: 'Description',
      key: 'Description',
      ellipsis: true, // Enable ellipsis if description is too long
      render: (text) => (
        <Paragraph style={{ whiteSpace: 'pre-line' }} ellipsis={{ rows: 1, expandable: true, symbol: 'more' }}>
          {text}
        </Paragraph>
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
      title: t('category'),
      dataIndex: 'CategoryID',
      key: 'CategoryID',
      render: (text) => {
        const category = categories.find(cat => cat.CategoryID === text);
        return category ? category.Name : text;
      },
    },
    {
      title: t('actions'),
      key: 'actions',
      fixed: 'right',
      className: 'sticky right-0 bg-white',
      render: (_, record) => (
        userRole === 'Store Manager' && (
          <div>
            <Button type="primary" onClick={() => handleEditClick(record)} style={{ marginRight: '8px' }}>{t('edit')}</Button>
          </div>
        )
      ),
    },
  ];

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  return (
    <div className="p-10">
      <Title level={1} className='text-center'>{t('product_for_cat')}</Title>
      {/* Search box */}
      <div className="flex flex-row justify-end">
        <Search
          placeholder={t('search_by_product_name')}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: 16, width: 300 }}
        />
      </div>
      {/* Tabs for categories */}
      <Tabs
        activeKey={activeCategory}
        onChange={setActiveCategory}
        type="card"
        className="custom-tabs"
      >
        <TabPane tab={t('all')} key="all" />
        {categories.map(category => (
          <TabPane tab={category.Name} key={category.CategoryID} />
        ))}
      </Tabs>
      {/* Product list */}
      <Form form={form}>
        {userRole === 'Store Manager' ? (
          <>
            <Table
              dataSource={filteredProducts}
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} style={{ width: 240 }}>
                  <Skeleton.Image style={{ width: 240, height: 150 }} />
                  <Skeleton active />
                </Card>
              ))
            ) : (
              filteredProducts.map(product => (
                <Card
                  key={product.ProductID}
                  hoverable
                  className="bg-white rounded-lg shadow-md transition-transform transform-gpu hover:scale-105"
                  onClick={() => handleProductClick(product.ProductID)}
                >
                  <Image
                    alt={product.ProductName}
                    src={product.ImageURL}
                    preview={false}
                    className="rounded-t-lg w-full h-44 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-2xl font-semibold">{product.ProductName}</h3>
                    <p className="text-green-600 mt-2 text-3xl">{product.Price}đ</p>
                    {/* <p className="text-gray-500 mt-2">{product.Description}</p> */}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </Form>
      {/* Add/ Update modal */}
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
        <Form form={form} className="text-left" layout='vertical'>
          <Form.Item
            name="ProductName"
            label={t('product_name')}
            rules={[{ required: true, message: t('please_enter_product_name') }]}
            className="mb-4"
          >
            <Input placeholder={t('product_name')} className="w-full p-2 border border-gray-300 rounded" />
          </Form.Item>
          <Form.Item
            name="Price"
            label={t('price')}
            rules={[
              { required: true, message: t('please_enter_price') },
              { type: 'number', min: 0, message: t('price_must_be_positive') }
            ]}
           className="mb-4"
          >
            <InputNumber type='number' placeholder={t('price')} className="w-full p-2 border border-gray-300 rounded" />
          </Form.Item>
          <Form.Item
            name="Description"
            label={t('description')}
            rules={[
              { required: true, message: t('please_enter_description') },
              { max: 500, message: t('description_too_long') }
            ]}
           className="mb-4"
          >
            <TextArea rows={4} placeholder={t('description')} style={{ whiteSpace: 'pre-wrap' }} className="w-full p-2 border border-gray-300 rounded" />
          </Form.Item>
          <Form.Item
            name="Image"
            label={t('image')}
            rules={[
              { required: editMode == null, message: t('please_upload_product_image') }
            ]}
           className="mb-4"
          >
            <Input type="file" onChange={handleProductImageUpload} className="w-full p-2 border border-gray-300 rounded" />
            {productImg && (
              <Image src={URL.createObjectURL(productImg)} alt="Product Preview" style={{ width: '100px', marginTop: '10px' }} className="block" />
            )}
          </Form.Item>
          <Form.Item
            name="Quantity"
            label={t('quantity')}
            rules={[
              { required: true, message: t('enter_product_quantity') },
              { type: 'number', min: 0, message: t('quantity_must_be_positive') }
            ]}
           className="mb-4"
          >
            <InputNumber placeholder={t('quantity')} className="w-full p-2 border border-gray-300 rounded" />
          </Form.Item>
          <Form.Item
            name="Status"
            label={t('status')}
            rules={[
              { required: true, message: t('select_product_status') }
            ]}
           className="mb-4"
          >
            <Select placeholder={t('status')}>
              <Option value="Available">{t('available')}</Option>
              <Option value="Unavailable">{t('unavailable')}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="CategoryID"
            label={t('category')}
            rules={[{ required: true, message: t('please_select_category') }]}
            className="mb-4"
          >
            <Select placeholder={t('category')}>
              {categories.map(category => (
                <Option key={category.CategoryID} value={category.CategoryID}>{category.Name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;
