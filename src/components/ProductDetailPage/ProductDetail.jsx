import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Image, Modal, Form, message, Typography, Skeleton, Select } from 'antd';
import useShopping from '../../hook/useShopping';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ProductDetail = () => {
    const { id } = useParams();
    const [productData, setProductData] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const userRole = localStorage.getItem('role') || 'Guest';
    const navigate = useNavigate();

    const fetchProductDetail = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/products/${id}`);
            setProductData(response.data);
            form.setFieldsValue(response.data); // Set initial form values
            setLoading(false);
        } catch (error) {
            console.error('Error fetching product detail:', error);
            message.error('Error fetching product detail');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductDetail();
    }, [id, form]);

    const handleIncrease = () => setQuantity(quantity + 1);
    const handleDecrease = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

    const handleOrderNow = () => {
        console.log('Ordered:', productData, 'Quantity:', quantity);
    };

    const { handleAddItem } = useShopping();

    const handleAddToCart = () => {
        if (productData) {
            const productWithQuantity = { ...productData, quantity };
            handleAddItem(productWithQuantity);
        }
    };

    const handleChangeQuantity = (value) => {
        if (!isNaN(value) && value > 0) {
            setQuantity(value);
        }
    };

    const handleEditProduct = () => {
        setEditMode(true);
    };

    const handleCancelEdit = async () => {
        setEditMode(false);
        await fetchProductDetail(); // Reload product data from the database
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
                ImageURL: values.ImageURL,
                Status: values.Status
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

    const handleDeleteProduct = () => {
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

                    message.success('Product deleted successfully');
                    navigate(-1); // Redirect to product list after deletion
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

    if (loading) {
        return <Skeleton active />;
    }

    return (
        productData && (
            <div className="flex flex-col md:flex-row m-5 py-32 px-4 md:px-32">
                <div className="w-full md:w-1/2 flex justify-center">
                    <Image src={productData.ImageURL} alt={productData.ProductName} />
                </div>
                <div className="w-full md:w-1/2 p-5 md:ml-10">
                    {userRole === 'Store Manager' ? (
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="ProductName"
                                label="Tên sản phẩm"
                                rules={[{ required: true, message: 'Hãy nhập tên sản phẩm!' }]}
                            >
                                <Input disabled={!editMode} />
                            </Form.Item>
                            <Form.Item
                                name="Price"
                                label="Giá"
                                rules={[{ required: true, message: 'Hãy nhập giá sản phẩm!' }]}
                            >
                                <Input type="number" disabled={!editMode} />
                            </Form.Item>
                            <Form.Item
                                name="Description"
                                label="Mô tả"
                                rules={[{ required: true, message: 'Hãy nhập mô tả sản phẩm!' }]}
                            >
                                <Input disabled={!editMode} />
                            </Form.Item>
                            <Form.Item
                                name="ImageURL"
                                label="Hình ảnh"
                                rules={[{ required: true, message: 'Hãy tải hình ảnh sản phẩm!' }]}
                            >
                                <Input disabled={!editMode} />
                            </Form.Item>
                            <Form.Item
                                name="Status"
                                label="Status"
                                rules={[{ required: true, message: 'Please select the service status!' }]}
                                >
                                <Select placeholder="Select Status" disabled={!editMode}>
                                    <Option value="Available">Available</Option>
                                    <Option value="Unavailable">Unavailable</Option>
                                </Select>
                                </Form.Item>
                        </Form>
                    ) : (
                        <div>
                            <Title level={3}>{productData.ProductName}</Title>
                            <Paragraph>{`Giá: ${productData.Price}`}</Paragraph>
                            <Paragraph>{`Mô tả: ${productData.Description}`}</Paragraph>
                        </div>
                    )}

                    {userRole === 'Guest' || userRole === 'Customer' ? (
                        <>
                            <div className="flex items-center mb-6">
                                <Button onClick={handleDecrease}>-</Button>
                                <Input
                                    value={quantity}
                                    onChange={(e) => handleChangeQuantity(e.target.value)}
                                    className="mx-3 text-lg w-24 text-center"
                                    type="number"
                                    min="1"
                                />
                                <Button onClick={handleIncrease}>+</Button>
                            </div>
                            <div className="flex space-x-4 justify-end">
                                <Button type="primary" 
                                        onClick={handleAddToCart}
                                        disabled={productData.Status === 'Unavailable'}
                                >
                                        Thêm vào giỏ hàng
                                </Button>
                                <Button type="primary" 
                                        onClick={handleOrderNow}
                                        disabled={productData.Status === 'Unavailable'}
                                >
                                        Đặt ngay
                                </Button>
                            </div>
                            {productData.Status === 'Unavailable' && (
                                <p className="text-red-500 text-right"> Sản phẩm hiện đang tạm ngừng kinh doanh hoặc đã hết hàng.</p>
                            )}
                        </>
                    ) : userRole === 'Store Manager' ? (
                        editMode ? (
                            <div className="flex space-x-4 justify-end">
                                <Button type="primary" onClick={() => handleSaveEdit(id)}>Lưu</Button>
                                <Button onClick={handleCancelEdit}>Hủy</Button>
                            </div>
                        ) : (
                            <div className="flex space-x-4 justify-end">
                                <Button type="primary" onClick={handleEditProduct}>Sửa</Button>
                                <Button danger onClick={handleDeleteProduct}>Xóa</Button>
                            </div>
                        )
                    ) : null}
                </div>
            </div>
        )
    );
};

export default ProductDetail;
