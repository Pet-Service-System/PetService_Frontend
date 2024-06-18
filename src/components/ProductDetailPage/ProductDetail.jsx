import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Image, Form, message, Typography, Skeleton, Select, Breadcrumb, List, Rate } from 'antd';
import useShopping from '../../hook/useShopping';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ProductDetail = () => {
    const { id } = useParams();
    const [productData, setProductData] = useState(null);
    const [comments, setComments] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const userRole = localStorage.getItem('role') || 'Guest';

    const fetchProductDetail = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/products/${id}`);
            setProductData(response.data);
            form.setFieldsValue(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching product detail:', error);
            message.error('Error fetching product detail');
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            const response = await axios.get(`http://localhost:3001/api/comments/product/${id}`, config);
            if (response.data && response.data.comments[0] && response.data.comments[0].CommentDetails) {
                const commentsData = response.data.comments[0].CommentDetails;
                const updatedComments = await Promise.all(
                    commentsData.map(async (comment) => {
                        // Fetch account information for each comment
                        const accountResponse = await axios.get(`http://localhost:3001/api/accounts/${comment.AccountID}`, config);
                        const accountName = accountResponse.data.user.fullname;
                        return { ...comment, username: accountName };
                    })
                );
                setComments(updatedComments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };    
    useEffect(() => {
        fetchProductDetail();
        fetchComments();
    }, [id]);

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
        message.success('Product added to cart successfully');
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
        await fetchProductDetail();
    };

    const handleSaveEdit = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authorization token not found. Please log in.');
                return;
            }

            const values = await form.validateFields();
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
                window.location.reload();
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

    if (loading) {
        return <Skeleton active />;
    }

    // Function to calculate average rating
    const calculateAverageRating = (comments) => {
        if (comments.length === 0) return 0;

        const totalRating = comments.reduce((acc, curr) => acc + curr.Rating, 0);
        return totalRating / comments.length;
    };

    
    const PetTypeID = productData.PetTypeID;
    return (
        productData && (
            <div>
                <div className="flex flex-col md:flex-row m-5 px-4 md:px-32">
                    <Breadcrumb style={{ marginBottom: '20px' }}>
                        <Breadcrumb.Item>
                            <Link to="/">Trang chủ</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            {PetTypeID === 'PT001' ? (
                                <Link to="/for-dog-products">Sản phẩm cho chó</Link>
                            ) : PetTypeID === 'PT002' ? (
                                <Link to="/for-cat-products">Sản phẩm cho mèo</Link>
                            ) : (
                                <Link to="/for-other-products">Danh sách sản phẩm</Link>
                            )}
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>{productData.ProductName}</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <div className="flex flex-col md:flex-row m-5 px-4 md:px-32">
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
                                <div className="flex items-center mb-6 p-14">
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
                                    <p className="text-red-500 text-right">Sản phẩm hiện đang tạm ngừng kinh doanh hoặc đã hết hàng.</p>
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
                                </div>
                            )
                        ) : null}
                    </div>
                </div>
                <div className="m-5 px-4 md:px-32">
                    <Title level={4}>Đánh giá sản phẩm</Title>
                    {comments.length > 0 && (
                        <div>
                            <Rate disabled allowHalf value={calculateAverageRating(comments)} />
                            <span style={{ marginLeft: '10px' }}>
                                {comments.length} {comments.length === 1 ? 'review' : 'reviews'}
                            </span>
                        </div>
                    )}
                    <List
                        dataSource={comments}
                        renderItem={(item) => (
                            <List.Item key={item.AccountID}>
                                <List.Item.Meta
                                    title={item.username}  // Display username here
                                    description={item.Comment}
                                />
                                <Rate disabled defaultValue={item.Rating} />
                            </List.Item>
                        )}
                    />
                </div>
            </div>
        )
    );
};

export default ProductDetail;
