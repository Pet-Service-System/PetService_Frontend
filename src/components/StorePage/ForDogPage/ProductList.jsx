import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography } from 'antd';
import axios from 'axios';
const { Title } = Typography;

const ProductList = () => {
  const [productData, setProductData] = useState([]);
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'customer'); // Get role from localStorage or default to 'customer'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/products');
        // Filter products for dogs (PetTypeId: PT001)
        const dogProducts = response.data.filter(product => product.PetTypeId === 'PT001');
        setProductData(dogProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (id) => {
    navigate(`/product-detail/${id}`);
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'ProductName',
      key: 'ProductName',
      render: (text, record) => (
        <div onClick={() => handleProductClick(record.ProductID)}>
          <img src={record.ImageURL} alt={record.ProductName} style={{ width: '50px' }} />
          {text}
        </div>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'Price',
      key: 'Price',
      render: (text) => `$${text.toFixed(2)}`,
    },
    {
      title: 'Mô tả',
      dataIndex: 'Description',
      key: 'Description',
    },
  ];

  return (
    <div className="p-36">
      {userRole === 'customer' ? ( // Render Card view for customer
        <Title level={2}>Product List</Title>
      ) : ( // Render Table view for other roles
        <Table
          dataSource={productData}
          columns={columns}
          rowKey="ProductID"
          pagination={false}
        />
      )}
    </div>
  );
};

export default ProductList;
