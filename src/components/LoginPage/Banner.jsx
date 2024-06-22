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
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const { shoppingCart } = useShopping();
  const productCount = shoppingCart.length;
  const dispatch = useDispatch()

  const handleVisibleChange = (visible) => {
    setVisible(visible);
  };


  useEffect(() => {
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
    navigate('/');
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin người dùng', onClick: () => navigate('/user-profile') },
    ...(role === 'Customer' ? [
      { key: 'pet-list', icon: <UnorderedListOutlined />, label: 'Danh sách thú cưng', onClick: () => navigate('/pet-list') },
      { key: 'orders-history', icon: <HistoryOutlined />, label: 'Lịch sử đặt hàng', onClick: () => navigate('/orders-history') },
      {
        key: 'service-history',
        icon: <HistoryOutlined />,
        label: 'Lịch sử dịch vụ',
        children: [
          { key: 'spa-booking', label: 'Dịch vụ spa', onClick: () => navigate('/spa-booking') },
          { key: 'hotel-booking', label: 'Dịch vụ khách sạn', onClick: () => navigate('/hotel-booking') },
        ],
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
        { key: 'hotel-service', label: 'Khách sạn thú cưng', path: '/hotel-service', parent: 'Dịch vụ thú cưng' },
        { key: 'for-dog', label: 'Dành cho chó', path: '/products-for-dog', parent: 'CỬA HÀNG' },
        { key: 'for-cat', label: 'Dành cho mèo', path: '/products-for-cat', parent: 'CỬA HÀNG' },
        { key: 'contact', label: 'LIÊN HỆ', path: '/contact' },
      ];
    } else if (role === 'Customer') {
      menuItems = [
        { key: 'home', label: 'TRANG CHỦ', path: '/' },
        { key: 'about', label: 'GIỚI THIỆU', path: '/about' },
        { key: 'dog-service', label: 'Dành cho chó', path: '/services-for-dog', parent: 'Dịch vụ thú cưng' },
        { key: 'cat-service', label: 'Dành cho mèo', path: '/services-for-cat', parent: 'Dịch vụ thú cưng' },
        { key: 'hotel-service', label: 'Khách sạn thú cưng', path: '/hotel-service', parent: 'Dịch vụ thú cưng' },
        { key: 'for-dog', label: 'Dành cho chó', path: '/products-for-dog', parent: 'CỬA HÀNG' },
        { key: 'for-cat', label: 'Dành cho mèo', path: '/products-for-cat', parent: 'CỬA HÀNG' },
        { key: 'contact', label: 'LIÊN HỆ', path: '/contact' },
      ];
    } else if (role === 'Administrator') {
      menuItems = [
        { key: 'schedule', label: 'LỊCH', path: '/staff-schedule' },
        { key: 'manage-accounts', label: 'QUẢN LÍ TÀI KHOẢN', path: '/manage-accounts' },
        { key: 'dog-service', label: 'Dành cho chó', path: '/services-for-dog', parent: 'Dịch vụ thú cưng' },
        { key: 'cat-service', label: 'Dành cho mèo', path: '/services-for-cat', parent: 'Dịch vụ thú cưng' },
        { key: 'hotel-service', label: 'Khách sạn thú cưng', path: '/hotel-service', parent: 'Dịch vụ thú cưng' },
        { key: 'for-dog', label: 'Dành cho chó', path: '/products-for-dog', parent: 'CỬA HÀNG' },
        { key: 'for-cat', label: 'Dành cho mèo', path: '/products-for-cat', parent: 'CỬA HÀNG' },
        { key: 'booking-list', label: 'QUẢN LÍ BOOKING', path: '/booking-list' },
      ];
    } else if (['Sales Staff', 'Caretaker Staff', 'Store Manager'].includes(role)) {
      menuItems = [
        { key: 'schedule', label: 'LỊCH', path: '/staff-schedule' },
        { key: 'dog-service', label: 'Dành cho chó', path: '/services-for-dog', parent: 'Dịch vụ thú cưng' },
        { key: 'cat-service', label: 'Dành cho mèo', path: '/services-for-cat', parent: 'Dịch vụ thú cưng' },
        { key: 'hotel-service', label: 'Khách sạn thú cưng', path: '/hotel-service', parent: 'Dịch vụ thú cưng' },
        { key: 'for-dog', label: 'Dành cho chó', path: '/products-for-dog', parent: 'CỬA HÀNG' },
        { key: 'for-cat', label: 'Dành cho mèo', path: '/products-for-cat', parent: 'CỬA HÀNG' },
        { key: 'booking-list', label: 'QUẢN LÍ BOOKING', path: '/booking-list' },
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
      <Menu mode={isVertical ? "vertical" : "horizontal"} onClick={closeMenu} className={isVertical ? '' : 'flex justify-center items-center bg-white'} disabledOverflow={true}>
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
              <Menu.Item onClick={() => { navigate('/orders-history') }}>Lịch sử đặt hàng</Menu.Item>
              <Menu.SubMenu title="Lịch sử dịch vụ">
                <Menu.Item onClick={() => { navigate('/spa-booking') }}>Dịch vụ thú cưng</Menu.Item>
                <Menu.Item onClick={() => { navigate('/hotel-booking') }}>Dịch vụ khách sạn</Menu.Item>
              </Menu.SubMenu>
              <Menu.Item onClick={handleLogout}>Đăng xuất</Menu.Item>
            </Menu.SubMenu>
          </>
        )}
        {role === 'Administrator' && isVertical && (
          <Menu.SubMenu key="user-profile" title="TÀI KHOẢN">
            {userMenuItems.map(item => (
              <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        )}
        {['Sale staff', 'Caretaker staff', 'Store Manager'].includes(role) && isVertical && (
          <Menu.SubMenu key="user-profile" title="TÀI KHOẢN">
            {userMenuItems.map(item => (
              <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        )}
      </Menu>
    );
  };

  return (
    <Layout>
      <Header className="flex justify-between items-center bg-white shadow-md px-4 py-2 md:px-8 md:py-4">
        <div className="flex items-center">
          {/* <img className="ml-20 h-20 w-20 cursor-pointer" src="/src/assets/image/iconPet.png" onClick={clickTitle} alt="Pet Service Logo" /> */}
          <span
            className="text-7xl ml-10 px-10 cursor-pointer text-black"
            style={{ fontFamily: 'Playground' }}
            onClick={clickTitle}
          >
            Pet <span style={{ color: 'cyan' }}>Service</span>
          </span>


        </div>
        {isSmallScreen ? (
          <>
            <Button type="primary" icon={<MenuOutlined />} onClick={() => setIsDrawerVisible(true)} />
            <Drawer title="Menu" placement="right" closable onClose={closeMenu} visible={isDrawerVisible}>
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
                        <span className="text-black">{user.fullname}</span>
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
