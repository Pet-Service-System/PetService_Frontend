import { useEffect, useState } from "react";
import { Layout, Table, Typography, message, Button, Space, Modal, Form, Input } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API_URL = import.meta.env.REACT_APP_API_URL;

const CategoryList = () => {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem("role") || "Guest");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const { t } = useTranslation();

  useEffect(() => {
    if (role === 'Customer' || role === 'Guest') {
      navigate('/');
    } else {
      fetchCategories();
    }
  }, [role, navigate]);

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

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    form.setFieldsValue({
      CategoryID: category.CategoryID,
      Name: category.Name,
      Description: category.Description,
    });
    setEditModalVisible(true);
  };

  const handleUpdateCategory = async () => {
    try {
      setModalLoading(true);
      const values = await form.validateFields();
      const token = localStorage.getItem('token');
      const updatedCategory = {
        ...selectedCategory,
        ...values,
      };
      await axios.put(`${API_URL}/api/categories/${selectedCategory._id}`, updatedCategory, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('Category updated successfully.');
      fetchCategories();
      setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating category:', error);
      message.error('Failed to update category.');
    } finally {
      setModalLoading(false);
    }
  };

  const cancelEditCategory = () => {
    form.resetFields();
    setEditModalVisible(false);
  };

  const handleAddCategory = () => {
    setAddModalVisible(true);
  };

  const handleSaveCategory = async () => {
    try {
      setModalLoading(true);
      const values = await addForm.validateFields();
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/categories`, values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('Category added successfully.');
      fetchCategories();
      setAddModalVisible(false);
      addForm.resetFields();
    } catch (error) {
      console.error('Error adding category:', error);
      message.error('Failed to add category.');
    } finally {
      setModalLoading(false);
    }
  };

  const cancelAddCategory = () => {
    addForm.resetFields();
    setAddModalVisible(false);
  };

  const handleDeleteCategory = async (category) => {
    try {
      const products = await fetchProducts();
      const productsWithCategory = products.filter(
        (product) => product.CategoryID === category.CategoryID
      );
  
      if (productsWithCategory.length > 0) {
        message.error(t('error_category_associated'));  // Updated with translation
        return;
      }
  
      Modal.confirm({
        title: t('confirm_deletion_title'),  // Updated with translation
        content: t('confirm_deletion_content'),  // Updated with translation
        okText: t('delete'),  // Updated with translation
        cancelText: t('cancel'),  // Updated with translation
        onOk: async () => {
          const token = localStorage.getItem('token');
          try {
            await axios.delete(`${API_URL}/api/categories/${category._id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            message.success(t('category_deleted_successfully'));  // Updated with translation
            fetchCategories();
          } catch (error) {
            console.error('Error deleting category:', error);
            message.error(t('failed_to_delete_category'));  // Updated with translation
          }
        },
      });
    } catch (error) {
      console.error('Error checking products:', error);
      message.error(t('failed_to_delete_category'));  // Updated with translation
    }
  };
  

  const columns = [
    {
      title: 'Category ID',
      dataIndex: 'CategoryID',
      key: 'CategoryID',
    },
    {
      title: 'Category Name',
      dataIndex: 'Name',
      key: 'Name',
    },
    {
      title: 'Description',
      dataIndex: 'Description',
      key: 'Description',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEditCategory(record)}>
            Edit
          </Button>
          <Button danger onClick={() => handleDeleteCategory(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="site-layout" style={{ minHeight: '100vh' }}>
      <div className="site-layout-background" style={{ padding: 24 }}>
        <Typography.Title className="text-center text-5xl">{t('category')}</Typography.Title>
        <Space className="mb-4 flex justify-end">
          <Button type="primary" onClick={handleAddCategory}>
            {t('add_category')}
          </Button>
        </Space>
        <Table dataSource={categories} columns={columns} rowKey="_id" loading={loading} />
        <Modal
          title="Edit Category"
          visible={editModalVisible}
          onOk={handleUpdateCategory}
          onCancel={cancelEditCategory}
          confirmLoading={modalLoading}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              CategoryID: selectedCategory?.CategoryID,
              Name: selectedCategory?.Name,
              Description: selectedCategory?.Description,
            }}
          >
            <Form.Item
              name="CategoryID"
              label="Category ID"
              rules={[
                { required: true, message: 'Please enter category ID' },
              ]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              name="Name"
              label="Category Name"
              rules={[
                { required: true, message: 'Please enter category name' },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="Description" label="Description">
              <Input.TextArea />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Add Category"
          visible={addModalVisible}
          onOk={handleSaveCategory}
          onCancel={cancelAddCategory}
          confirmLoading={modalLoading}
        >
          <Form form={addForm} layout="vertical">
            <Form.Item
              name="Name"
              label="Category Name"
              rules={[
                { required: true, message: 'Please enter category name' },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="Description" label="Description">
              <Input.TextArea />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default CategoryList;
