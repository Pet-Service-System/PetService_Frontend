import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Image, Form, message, Typography, Skeleton, Select, List, Rate, Modal } from 'antd';
import useShopping from '../../hook/useShopping';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';


const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const API_URL = import.meta.env.REACT_APP_API_URL;

const ProductDetail = () => {
    const { id } = useParams();
    const [productData, setProductData] = useState(null);
    const [comments, setComments] = useState([]);
    const [Quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [productImg, setProductImg] = useState(""); // For image upload
    const [editMode, setEditMode] = useState(false);
    const { shoppingCart } = useShopping();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role') || 'Guest';
    const { t } = useTranslation();

    const fetchProductDetail = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/products/${id}`);
            setProductData(response.data);
            form.setFieldsValue(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching product detail:', error);
            message.error(t('error_fetching_product_detail'));
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
            const response = await axios.get(`${API_URL}/api/comments/product/${id}`, config);
            if (response.data && response.data.comments) {
                const commentsData = response.data.comments;
                console.log(commentsData)
                const updatedComments = await Promise.all(
                    commentsData.map(async (comment) => {
                        // Fetch account information for each comment
                        const accountResponse = await axios.get(`${API_URL}/api/accounts/${comment.AccountID}`, config);
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
            message.error(t('quantity_out_of_inventory'));
        }
    };

    const handleDecrease = () => setQuantity(Quantity > 1 ? Quantity - 1 : 1);

    const { handleAddItem } = useShopping();

    const handleProductImageUpload = (e) => {
        const file = e.target.files[0];
        setProductImg(file);
        form.setFieldsValue({ Image: file });
    };

    const handleAddToCart = () => {
        if (!localStorage.getItem('user')) {
            showLoginModal();
            return;
        }
        if (productData) {
            const cartQuantity = shoppingCart.reduce((total, item) => {
                if (item.ProductID === productData.ProductID) {
                    return total + item.Quantity;
                }
                return total;
            }, 0);
    
            const totalQuantity = Quantity + cartQuantity;
    
            if (totalQuantity > productData.Quantity) {
                message.error(t('quantity_out_of_inventory'));
                return;
            }
    
            const productWithQuantity = { ...productData, Quantity };
            handleAddItem(productWithQuantity);
            message.success(t('product_added_to_cart_successfully'));
        }
    };    

    const showLoginModal = () => {
        Modal.info({
            title: 'Thông báo',
            content: (
                <div>
                    <p>{t('plz_login_or_register_to_buy')}</p>
                    <div className="flex justify-end">
                        <Button type="primary" onClick={() => {
                            navigate('/login');
                            Modal.destroyAll();
                        }}>{t('log_in')}</Button>
                        <Button onClick={() => {
                            navigate('/register');
                            Modal.destroyAll();
                        }} className="ml-2">{t('register')}</Button>
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
            setQuantity(parseFloat(value));
        }
    };

    const handleEditProduct = () => {
        setEditMode(true);
    };

    const handleCancelEdit = async () => {
        setEditMode(false);
        setProductImg("");
        await fetchProductDetail();
    };

    const handleSaveEdit = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error(t('authorization_token_not_found'));
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

            await axios.patch(`${API_URL}/api/products/${id}`, updatedProduct, {
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
                message.error(t('unauthorized'));
            } else {
                message.error(t('error_updating_product'));
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
                {/* Go back button */}
                <div className="flex flex-row md:flex-row m-5 px-4 md:px-32">
                    <Button
                        onClick={() => navigate(-1)}
                        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
                        icon={<ArrowLeftOutlined />}
                        size="large"
                    >
                        {t('back')}
                    </Button>
                </div>
                {/* Product detail */}
                <div className="flex flex-col md:flex-row m-5 px-4 md:px-32">
                    <div className="w-full lg:w-1/2 h-full lg:h-1/2 flex justify-center">
                        <Image src={productData.ImageURL} alt={productData.ProductName} />
                    </div>
                    <div className="w-full md:w-1/2 p-5 md:ml-10">
                        {userRole === 'Store Manager' ? (
                            <Form form={form} layout="vertical">
                                <Form.Item
                                    name="ProductName"
                                    label={t('product_name')}
                                    rules={[{ required: true, message: t('please_enter_product_name') }]}
                                >
                                    <Input disabled={!editMode} />
                                </Form.Item>
                                <Form.Item
                                    name="Quantity"
                                    label={t('quantity')}
                                    rules={[{ required: true, message: t('please_enter_quantity') }]}
                                >
                                    <Input type='number' disabled={!editMode} placeholder= {t('quantity')} />
                                </Form.Item>
                                <Form.Item
                                    name="Price"
                                    label={t('price')}
                                    rules={[{ required: true, message: t('please_enter_price') }]}
                                >
                                    <Input suffix='đ' type="number" disabled={!editMode} />
                                </Form.Item>
                                <Form.Item
                                    name="Description"
                                    label={t('description')}
                                    rules={[{ required: true, message: t('please_enter_description') }]}
                                >
                                    <TextArea disabled={!editMode} rows={10} placeholder={t('description')} style={{ whiteSpace: 'pre-wrap' }} />
                                </Form.Item>
                                <Form.Item
                                    name="Image"
                                    label={t('image')}
                                    rules={[{ required: editMode == null, message: t('Please upload the product image!') }]}
                                    className="mb-4"
                                >
                                    <Input disabled={!editMode} type="file" onChange={handleProductImageUpload} className="w-full p-2 border border-gray-300 rounded" />
                                    {productImg && (
                                    <Image src={URL.createObjectURL(productImg)} alt="Product Preview" style={{ width: '100px', marginTop: '10px' }} className="block" />
                                    )}
                                </Form.Item>
                                <Form.Item
                                    name="Status"
                                    label={t('status')}
                                    rules={[{ required: true, message: t('please_select_status') }]}
                                >
                                    <Select placeholder={t('select_status')} disabled={!editMode}>
                                        <Option value="Available">{t('available')}</Option>
                                        <Option value="Unavailable">{t('unavailable')}</Option>
                                    </Select>
                                </Form.Item>
                            </Form>
                        ) : (
                            <div>
                                <Title level={3}>{productData.ProductName}</Title>
                                <Paragraph>{`${t('quantity_in_stock')}: ${productData.Quantity}`}</Paragraph>
                                <Paragraph className="text-green-600 text-4xl">{productData.Price.toLocaleString('en-US')}đ</Paragraph>
                                <Paragraph style={{ whiteSpace: 'pre-line' }} ellipsis={{ rows: 5, expandable: true, symbol: 'more' }}>{`${t('description')}: ${productData.Description}`}</Paragraph>
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
                                        min="1"
                                    />
                                    <Button onClick={handleIncrease}>+</Button>
                                </div>
                                <div className="flex space-x-4 justify-end">
                                    <Button type="primary"
                                        onClick={handleAddToCart}
                                        disabled={(productData.Status === 'Unavailable' || productData.Quantity === 0)}
                                    >
                                        {t('add_to_cart')}
                                    </Button>
                                </div>
                                {(productData.Status === 'Unavailable' || productData.Quantity === 0) && (
                                    <p className="text-red-500 text-right">{t('product_unavailable')}</p>
                                )}
                            </>
                        ) : userRole === 'Store Manager' ? (
                            editMode ? (
                                <div className="flex space-x-4 justify-end">
                                    <Button type="primary" onClick={() => handleSaveEdit(id)}>{t('save')}</Button>
                                    <Button onClick={handleCancelEdit}>{t('cancel')}</Button>
                                </div>
                            ) : (
                                <div className="flex space-x-4 justify-end">
                                    <Button type="primary" onClick={handleEditProduct}>{t('edit')}</Button>
                                </div>
                            )
                        ) : null}
                    </div>
                </div>
                {/* Comment section */}
                <div className="m-5 px-4 md:px-32">
                    <Title level={4}>{t('product_reviews')}</Title>
                    {comments.length > 0 && (
                        <div>
                            <Rate disabled allowHalf value={calculateAverageRating(comments)} />
                            <span style={{ marginLeft: '10px' }}>
                                {comments.length} {comments.length === 1 ? t('review') : t('reviews')}
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