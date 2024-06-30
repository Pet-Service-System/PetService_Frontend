import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Drawer, Badge, Popover } from 'antd';
import { MenuOutlined, UserOutlined, ShoppingCartOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import useShopping from '../../hook/useShopping';
import SubMenu from 'antd/es/menu/SubMenu';
import { useDispatch } from 'react-redux';
import { setShoppingCart } from '../../redux/shoppingCart';
import '../../assets/fonts/fonts.css';

const { Header } = Layout;

const Banner = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  // const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const { shoppingCart } = useShopping();
  const productCount = shoppingCart.length;
  const dispatch = useDispatch()

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };

  // const checkTokenValidity = async () => {
  //   if (!token) {
  //     return;
  //   }
  //   try {
  //     const response = await fetch('http://localhost:3001/api/auth/check-token', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });
  //     if (response.ok) {
  //       console.log('Token is valid');
  //     } else {
  //       if (response.status === 401) {
  //         console.error('Token is expired or invalid');
  //         // Perform logout
  //         localStorage.clear();
  //         dispatch(setShoppingCart([]));
  //         setRole('Guest');
  //         setUser(null);
  //         navigate('/login');
  //         // Inform the user
  //         alert('Your session has expired. Please log in again.');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error checking token validity:', error);
  //   }
  // };

  useEffect(() => {
    // checkTokenValidity();
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsDrawerVisible(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const closeMenu = () => setIsDrawerVisible(false);
  const handleLoginClick = () => { closeMenu(); navigate('/login'); };
  const clickTitle = () => navigate('/');

  const handleLogout = () => {
    localStorage.clear();
    dispatch(setShoppingCart([]));
    setRole('Guest');
    setUser(null);
    navigate('/', {replace: true});
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin người dùng', onClick: () => navigate('/user-profile') },
    ...(role === 'Customer' ? [
      { key: 'pet-list', icon: <UnorderedListOutlined />, label: 'Danh sách thú cưng', onClick: () => navigate('/pet-list') },
      { key: 'order-history', icon: <HistoryOutlined />, label: 'Lịch sử đặt hàng', onClick: () => navigate('/order-history') },
      {
        key: 'service-history',
        icon: <HistoryOutlined />,
        label: 'Lịch sử dịch vụ',
        onClick: () => navigate('/spa-booking'),
      },
    ] : []),
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout }
  ];

  const renderUserMenu = () => (
    <Menu>
      {userMenuItems.map(item => (
        item.children ? (
          <SubMenu key={item.key} icon={item.icon} title={item.label}>
            {item.children.map(child => (
              <Menu.Item key={child.key} onClick={child.onClick}>
                {child.label}
              </Menu.Item>
            ))}
          </SubMenu>
        ) : (
          <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
            {item.label}
          </Menu.Item>
        )
      ))}
    </Menu>
  );

  const renderMenuItems = (isVertical) => {
    let menuItems = [];

    if (role === 'Guest') {
      menuItems = [
        { key: 'home', label: 'TRANG CHỦ', path: '/' },
        { key: 'about', label: 'GIỚI THIỆU', path: '/about' },
        { key: 'dog-service', label: 'Dành cho chó', path: '/services-for-dog', parent: 'Dịch vụ thú cưng' },
        { key: 'cat-service', label: 'Dành cho mèo', path: '/services-for-cat', parent: 'Dịch vụ thú cưng' },
        { key: 'dog-product', label: 'Dành cho chó', path: '/products-for-dog', parent: 'CỬA HÀNG' },
        { key: 'cat-product', label: 'Dành cho mèo', path: '/products-for-cat', parent: 'CỬA HÀNG' },
      ];
    } else if (role === 'Customer') {
      menuItems = [
        { key: 'home', label: 'TRANG CHỦ', path: '/' },
        { key: 'about', label: 'GIỚI THIỆU', path: '/about' },
        { key: 'dog-service', label: 'Dành cho chó', path: '/services-for-dog', parent: 'Dịch vụ thú cưng' },
        { key: 'cat-service', label: 'Dành cho mèo', path: '/services-for-cat', parent: 'Dịch vụ thú cưng' },
        { key: 'dog-product', label: 'Dành cho chó', path: '/products-for-dog', parent: 'CỬA HÀNG' },
        { key: 'cat-product', label: 'Dành cho mèo', path: '/products-for-cat', parent: 'CỬA HÀNG' },
      ];
    } else if (role === 'Administrator') {
      menuItems = [
        { key: 'schedule', label: 'LỊCH', path: '/staff-schedule' },
        { key: 'manage-accounts', label: 'QUẢN LÍ TÀI KHOẢN', path: '/manage-accounts' },
        { key: 'dog-service', label: 'Dành cho chó', path: '/services-for-dog', parent: 'Dịch vụ thú cưng' },
        { key: 'cat-service', label: 'Dành cho mèo', path: '/services-for-cat', parent: 'Dịch vụ thú cưng' },
        { key: 'dog-product', label: 'Dành cho chó', path: '/products-for-dog', parent: 'CỬA HÀNG' },
        { key: 'cat-product', label: 'Dành cho mèo', path: '/products-for-cat', parent: 'CỬA HÀNG' },
        { key: 'manage-spa-booking', label: 'Đặt lịch dịch vụ', path: '/manage-spa-bookings', parent: 'QUẢN LÝ' },
        { key: 'manage-order', label: 'Đơn hàng', path: '/manage-orders', parent: 'QUẢN LÝ' },
      ];
    } else if (['Sales Staff', 'Caretaker Staff', 'Store Manager'].includes(role)) {
      menuItems = [
        { key: 'schedule', label: 'LỊCH', path: '/staff-schedule' },
        { key: 'dog-service', label: 'Dành cho chó', path: '/services-for-dog', parent: 'Dịch vụ thú cưng' },
        { key: 'cat-service', label: 'Dành cho mèo', path: '/services-for-cat', parent: 'Dịch vụ thú cưng' },
        { key: 'dog-product', label: 'Dành cho chó', path: '/products-for-dog', parent: 'CỬA HÀNG' },
        { key: 'cat-product', label: 'Dành cho mèo', path: '/products-for-cat', parent: 'CỬA HÀNG' },
        { key: 'manage-spa-booking', label: 'Đặt lịch dịch vụ', path: '/manage-spa-bookings', parent: 'QUẢN LÝ' },
        { key: 'manage-order', label: 'Đơn hàng', path: '/manage-orders', parent: 'QUẢN LÝ' },
      ];
    }

    const verticalMenu = menuItems.reduce((acc, item) => {
      if (item.parent) {
        const parent = acc.find((menu) => menu.key === item.parent);
        if (parent) {
          parent.children.push({ key: item.key, label: item.label, onClick: () => navigate(item.path) });
        } else {
          acc.push({ key: item.parent, label: item.parent.toUpperCase(), children: [{ key: item.key, label: item.label, onClick: () => navigate(item.path) }] });
        }
      } else {
        acc.push({ key: item.key, label: item.label, onClick: () => navigate(item.path) });
      }
      return acc;
    }, []);
    

    return (
      <Menu mode={isVertical ? "inline" : "horizontal"} onClick={closeMenu} className={isVertical ? '' : 'flex justify-center items-center bg-cyan-400'} disabledOverflow={true}>
        {verticalMenu.map(item => (
          item.children ? (
            <Menu.SubMenu key={item.key} title={item.label}>
              {item.children.map(child => (
                <Menu.Item key={child.key} onClick={child.onClick}>{child.label}</Menu.Item>
              ))}
            </Menu.SubMenu>
          ) : (
            <Menu.Item key={item.key} onClick={item.onClick}>{item.label}</Menu.Item>
          )
        ))}
        {role === 'Guest' && isVertical && (
          <Menu.Item key="login" onClick={handleLoginClick}>ĐĂNG NHẬP</Menu.Item>
        )}
        {role === 'Customer' && isVertical && (
          <>
            <Menu.Item key="cart" onClick={() => navigate('/cart')}>GIỎ HÀNG</Menu.Item>
            <Menu.SubMenu key="user-profile" title="TÀI KHOẢN">
              <Menu.Item onClick={() => { navigate('/user-profile') }}>Thông tin người dùng</Menu.Item>
              <Menu.Item onClick={() => { navigate('/pet-list') }}>Danh sách thú cưng</Menu.Item>
              <Menu.Item onClick={() => { navigate('/order-history') }}>Lịch sử đặt hàng</Menu.Item>
              <Menu.Item onClick={() => { navigate('/spa-booking') }}>Lịch sử dịch vụ</Menu.Item>
            </Menu.SubMenu>
            <Menu.Item onClick={handleLogout}>ĐĂNG XUẤT</Menu.Item>
          </>
        )}
        {role === 'Administrator' && isVertical && (
          <>
            <Menu.Item onClick={() => { navigate('/user-profile') }}>TÀI KHOẢN</Menu.Item>
            <Menu.Item onClick={handleLogout}>ĐĂNG XUẤT</Menu.Item> 
          </>
        )}
        {['Sale staff', 'Caretaker staff', 'Store Manager'].includes(role) && isVertical && (
          <>
            <Menu.Item onClick={() => { navigate('/user-profile') }}>TÀI KHOẢN</Menu.Item>
            <Menu.Item onClick={handleLogout}>ĐĂNG XUẤT</Menu.Item> 
          </>
        )}
      </Menu>
    );
  };

  return (
    <Layout>
      <Header className="flex justify-between items-center bg-cyan-400 shadow-md px-4 py-2 md:px-8 md:py-4">
        <div className="flex items-center">
          {/* <img className="ml-20 h-20 w-20 cursor-pointer" src="/src/assets/image/iconPet.png" onClick={clickTitle} alt="Pet Service Logo" /> */}
          <span
            className="text-5xl ml-10 px-10 cursor-pointer text-white"
            style={{ fontFamily: 'Playground' }}
            onClick={clickTitle}
          >
            Pet Bro
          </span>
        </div>
        {isSmallScreen ? (
          <>
            <Button type="primary" icon={<MenuOutlined />} onClick={() => setIsDrawerVisible(true)} />
            <Drawer title="Menu" placement="top" closable onClose={closeMenu} visible={isDrawerVisible}>
              {renderMenuItems(true)}
            </Drawer>
          </>
        ) : (
          <div className="flex items-center">
            {renderMenuItems(false)}
            {role === 'Guest' ? (
              <Button type="primary" onClick={handleLoginClick} className="ml-4 relative">ĐĂNG NHẬP</Button>
            ) : (
              <div className="flex items-center ml-4">
                {role === 'Customer' && (
                  <>
                    <Badge count={productCount}>
                      <Button shape="circle" icon={<ShoppingCartOutlined />} onClick={() => navigate('/cart')} />
                    </Badge>
                  </>
                )}
                {role !== 'Guest' && (
                  <>
                    <Popover content={renderUserMenu()} trigger="click" visible={visible} onVisibleChange={handleVisibleChange}>
                      <Button shape="round" className="ml-4 py-2 px-4">
                        <span className="text-black">{user?.fullname}</span>
                      </Button>
                    </Popover>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Header>
    </Layout>
  );
};

export default Banner;
