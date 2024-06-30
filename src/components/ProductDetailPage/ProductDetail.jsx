import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Image, Form, message, Typography, Skeleton, Select, List, Rate, Modal } from 'antd';
import useShopping from '../../hook/useShopping';
import { ArrowLeftOutlined } from '@ant-design/icons';


const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input

const ProductDetail = () => {
    const { id } = useParams();
    const [productData, setProductData] = useState(null);
    const [comments, setComments] = useState([]);
    const [Quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
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
            if (response.data && response.data.comments) {
                const commentsData = response.data.comments;
                console.log(commentsData)
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

    const handleIncrease = () => {
        if (Quantity < productData.Quantity) {
            setQuantity(Quantity + 1);
        } else {
            message.error('Số lượng yêu cầu vượt quá số lượng tồn kho');
        }
    };
    
    const handleDecrease = () => setQuantity(Quantity > 1 ? Quantity - 1 : 1);

    const handleOrderNow = () => {
        if (!localStorage.getItem('user')) {
            showLoginModal();
            return;
        }
        if (productData) {
            if (Quantity > productData.Quantity) {
                message.error('Số lượng yêu cầu vượt quá số lượng tồn kho');
                return;
            }
    
            const productWithQuantity = { ...productData, Quantity };
            handleAddItem(productWithQuantity);
            const totalAmount = productData.Price;
            localStorage.setItem('totalAmount', totalAmount.toFixed(2));
            navigate('/order');
        }
    };

    const { handleAddItem } = useShopping();

    const handleAddToCart = () => {
        if (!localStorage.getItem('user')) {
            showLoginModal();
            return;
        }
        if (productData) {
            if (Quantity > productData.Quantity) {
                message.error('Số lượng yêu cầu vượt quá số lượng tồn kho');
                return;
            }
    
            const productWithQuantity = { ...productData, Quantity };
            handleAddItem(productWithQuantity);
            message.success('Product added to cart successfully');
        }
    };

    const showLoginModal = () => {
        Modal.info({
            title: 'Thông báo',
            content: (
                <div>
                    <p>Vui lòng đăng nhập hoặc đăng ký để mua hàng.</p>
                    <div className="flex justify-end">
                        <Button type="primary" onClick={() => {
                            navigate('/login');
                            Modal.destroyAll();
                        }}>Đăng nhập</Button>
                        <Button onClick={() => {
                            navigate('/register');
                            Modal.destroyAll(); 
                        }} className="ml-2">Đăng ký</Button>
                    </div>
                </div>
            ),
            closable: true, 
            maskClosable: true, 
            footer: null,
        });
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
                Quantity: values.Quantity,
                Description: values.Description,
                ImageURL: values.ImageURL,
                Status: values.Status
            };

            await axios.patch(`http://localhost:3001/api/products/${id}`, updatedProduct, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            message.success('Product updated successfully')
            fetchProductDetail();
            setEditMode(false)
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
    return (
        productData && (
            <div>
                <div className="flex flex-row md:flex-row m-5 px-4 md:px-32">
                    <Button
                        onClick={() => navigate(-1)}
                        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
                        icon={<ArrowLeftOutlined />}
                        size="large"
                    >
                        Quay về
                    </Button>
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
                                    name="Quantity"
                                    label="Số lượng tồn kho"
                                    rules={[{ required: true, message: 'Hãy nhập số lượng tồn kho!' }]}
                                >
                                    <Input type='number' disabled={!editMode} placeholder='Quantity'/>
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
                                    <TextArea disabled={!editMode} rows={10} placeholder="Description" style={{ whiteSpace: 'pre-wrap' }} />
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
                                <Paragraph>{`Số lượng còn lại: ${productData.Quantity}`}</Paragraph>
                                <Paragraph className="text-green-600 text-4xl">${productData.Price}</Paragraph>
                                <Paragraph>{`Mô tả: ${productData.Description}`}</Paragraph>
                            </div>
                        )}

                        {userRole === 'Guest' || userRole === 'Customer' ? (
                            <>
                                <div className="flex items-center mb-6 p-14">
                                    <Button onClick={handleDecrease}>-</Button>
                                    <Input
                                        value={Quantity}
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
                                            disabled={(productData.Status === 'Unavailable' || productData.Quantity ===0)}
                                    >
                                        Thêm vào giỏ hàng
                                    </Button>
                                    <Button type="primary" 
                                            onClick={handleOrderNow}
                                            disabled={(productData.Status === 'Unavailable' || productData.Quantity ===0)}
                                    >
                                        Đặt ngay
                                    </Button>
                                </div>
                                {(productData.Status === 'Unavailable' || productData.Quantity ===0) && (
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
                                    description={item.CommentContent}
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
