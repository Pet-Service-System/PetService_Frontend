import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Drawer, Badge, Popover } from 'antd';
import { MenuOutlined, UserOutlined, ShoppingCartOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import useShopping from '../../hook/useShopping';
import SubMenu from 'antd/es/menu/SubMenu';
import { useDispatch } from 'react-redux';
import { setShoppingCart } from '../../redux/shoppingCart';
import '../../assets/fonts/fonts.css';
import axios from 'axios';


import { Dropdown } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Header } = Layout;
const API_URL = import.meta.env.REACT_APP_API_URL;

const Banner = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || 'Guest');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const { shoppingCart } = useShopping();
  const productCount = shoppingCart.length;
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };
  // Check token if expired
  // const checkTokenValidity = async () => {
  //   if (!token) {
  //     return;
  //   }
  //   try {
  //     const response = await fetch(`${API_URL}/api/auth/check-token`, {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });
  //     if (response.ok) {
  //       console.log('Token is valid');
  //     } else {
  //       if (response.status === 401) {
  //         // Perform logout when token was expired
  //         handleLogout()
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error checking token validity:', error);
  //   }
  // };

  useEffect(() => {
    // checkTokenValidity();
    //Check sreen size for responsive
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

  const handleLogout = async () => {
    const accountID = user.id;
    const cartItems = JSON.parse(localStorage.getItem('shoppingCart')) || []; // Parse the cart items from localStorage
    console.log('User ID:', accountID);
    console.log('Cart Items:', cartItems);
    // Store cart into db
    if (cartItems.length > 0) {
      try {
        const response = await axios.post(`${API_URL}/api/cart`, {
          AccountID: accountID, // Use accountID variable instead of undefined response.AccountID
          Items: cartItems, // Pass the parsed cartItems directly
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Cart saved successfully:', response.data);
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  
    localStorage.clear();
    dispatch(setShoppingCart([]));
    setRole('Guest');
    setUser(null);
    navigate('/', { replace: true });
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: t('user_information'), onClick: () => navigate('/user-profile') },
    ...(role === 'Customer' ? [
      { key: 'pet-list', icon: <UnorderedListOutlined />, label: t('list_of_pets'), onClick: () => navigate('/pet-list') },
      { key: 'order-history', icon: <HistoryOutlined />, label: t('order_history'), onClick: () => navigate('/order-history') },
      {
        key: 'service-history',
        icon: <HistoryOutlined />,
        label: t('service_history'),
        onClick: () => navigate('/spa-booking'),
      },
    ] : []),
    { key: 'logout', icon: <LogoutOutlined />, label: t('log_out'), onClick: handleLogout }
  ];

  // Render user menu by userMenuItems
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
        { key: 'home', label: t('HOME'), path: '/' },
        { key: 'dog-service', label: t('for_dog'), path: '/services-for-dog', parent: t('pet_service') },
        { key: 'cat-service', label: t('for_cat'), path: '/services-for-cat', parent: t('pet_service') },
        { key: 'dog-product', label: t('for_dog'), path: '/products-for-dog', parent: t('STORE') },
        { key: 'cat-product', label: t('for_cat'), path: '/products-for-cat', parent: t('STORE') },
     ];
    } else if (role === 'Customer') {
      menuItems = [
        { key: 'home', label: t('HOME'), path: '/' },
        { key: 'dog-service', label: t('for_dog'), path: '/services-for-dog', parent: t('pet_service') },
        { key: 'cat-service', label: t('for_cat'), path: '/services-for-cat', parent: t('pet_service') },
        { key: 'dog-product', label: t('for_dog'), path: '/products-for-dog', parent: t('STORE') },
        { key: 'cat-product', label: t('for_cat'), path: '/products-for-cat', parent: t('STORE') },
     ];
    } else if (role === 'Administrator') {
      menuItems = [
        { key: 'schedule', label: t('SCHEDULE'), path: '/staff-schedule' },
        { key: 'manage-accounts', label: t('MANAGE_ACCOUNT'), path: '/manage-accounts', parent: t('MANAGEMENT') },
        { key: 'dog-service', label: t('for_dog'), path: '/services-for-dog', parent: t('pet_service') },
        { key: 'cat-service', label: t('for_cat'), path: '/services-for-cat', parent: t('pet_service') },
        { key: 'dog-product', label: t('for_dog'), path: '/products-for-dog', parent: t('STORE') },
        { key: 'cat-product', label: t('for_cat'), path: '/products-for-cat', parent: t('STORE') },
        { key: 'manage-spa-booking', label: t('spa_booking'), path: '/manage-spa-bookings', parent: t('MANAGEMENT') },
        { key: 'manage-order', label: t('order'), path: '/manage-orders', parent: t('MANAGEMENT') },
        { key: 'statistics', label: t('statistics'), path: '/statistics' },
      ];
    } else if (['Sales Staff', 'Caretaker Staff', 'Store Manager'].includes(role)) {
      menuItems = [
        { key: 'schedule', label: t('SCHEDULE'), path: '/staff-schedule' },
        { key: 'dog-service', label: t('for_dog'), path: '/services-for-dog', parent: t('pet_service') },
        { key: 'cat-service', label: t('for_cat'), path: '/services-for-cat', parent: t('pet_service') },
        { key: 'dog-product', label: t('for_dog'), path: '/products-for-dog', parent: t('STORE') },
        { key: 'cat-product', label: t('for_cat'), path: '/products-for-cat', parent: t('STORE') },
        { key: 'manage-spa-booking', label: t('spa_booking'), path: '/manage-spa-bookings', parent: t('MANAGEMENT') },
        { key: 'manage-order', label: t('order'), path: '/manage-orders', parent: t('MANAGEMENT') },
        { key: 'statistics', label: t('statistics'), path: '/statistics' },
      ];
    }

    // Vertical menu for responsive
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

    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
      localStorage.setItem('language', lng);
    };

    const currentLanguage = i18n.language;

    return (
      <Menu mode={isVertical ? "inline" : "horizontal"} 
            onClick={closeMenu} 
            className={isVertical ? '' : 'flex justify-center items-center bg-cyan-400'} 
            disabledOverflow={true}>
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
          <Menu.Item key="login" onClick={handleLoginClick}>{t('LOG_IN')}</Menu.Item>
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
        {['Sales Staff', 'Caretaker Staff', 'Store Manager'].includes(role) && isVertical && (
          <>
            <Menu.Item onClick={() => { navigate('/user-profile') }}>TÀI KHOẢN</Menu.Item>
            <Menu.Item onClick={handleLogout}>ĐĂNG XUẤT</Menu.Item> 
          </>
        )}
        <Menu.Item key="language" className="language-menu">
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="en" onClick={() => changeLanguage('en')}>
                  English
                </Menu.Item>
                <Menu.Item key="vn" onClick={() => changeLanguage('vn')}>
                  Tiếng Việt
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <a className="ant-dropdown-link" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <GlobalOutlined /> {currentLanguage === 'en' ? 'English' : 'Tiếng Việt'}
            </a>
          </Dropdown>
        </Menu.Item>
      </Menu>
    );
  };

  return (
    <Layout>
      <Header className="flex justify-between items-center bg-cyan-400 shadow-md px-4 py-2 md:px-8 md:py-4">
        <div className="flex items-center">
          {/* <img className="ml-20 h-20 w-20 cursor-pointer" src="/src/assets/image/iconPet.png" onClick={clickTitle} alt="Pet Service Logo" /> */}
          <span
            className="text-4xl lg:text-7xl md:text-5xl cursor-pointer text-white"
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
              <Button type="primary" onClick={handleLoginClick} className="ml-4 relative">{t('LOG_IN')}</Button>
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
