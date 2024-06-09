import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Drawer, Badge, Popover } from 'antd';
import { MenuOutlined, UserOutlined, ShoppingCartOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';
import useShopping from '../../hook/useShopping';

const { Header } = Layout;

const Banner = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || 'guest');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const { shoppingCart } = useShopping();
  const productCount = shoppingCart.length;

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
    setRole('guest');
    setUser(null);
    navigate('/')
  };

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Thông tin người dùng', onClick: () => navigate('/user-profile') },
    ...(role === 'customer' ? [
      { key: 'pet-list', icon: <UnorderedListOutlined />, label: 'Danh sách thú cưng', onClick: () => navigate('/pet-list') },
      { key: 'transaction-history', icon: <HistoryOutlined />, label: 'Lịch sử giao dịch', onClick: () => navigate('/transaction-history') },
    ] : []),
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout }
  ];

  const renderUserMenu = () => (
    <Menu>
      {userMenuItems.map(item => (
        <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  const renderMenuItems = (isVertical) => {
    let menuItems = [];

    if (role === 'guest') {
      menuItems = [
        { key: 'home', label: 'TRANG CHỦ', path: '/' },
        { key: 'about', label: 'GIỚI THIỆU', path: '/about' },
        { key: 'pet-service', label: 'Dịch vụ thú cưng', path: '/pet-service', parent: 'DỊCH VỤ' },
        { key: 'pet-hotel', label: 'Khách sạn thú cưng', path: '/pet-hotel', parent: 'DỊCH VỤ' },
        { key: 'for-dog', label: 'Dành cho chó', path: '/for-dog-products', parent: 'CỬA HÀNG' },
        { key: 'for-cat', label: 'Dành cho mèo', path: '/for-cat-products', parent: 'CỬA HÀNG' },
        { key: 'contact', label: 'LIÊN HỆ', path: '/contact' },
      ];
    } else if (role === 'customer') {
      menuItems = [
        { key: 'home', label: 'TRANG CHỦ', path: '/' },
        { key: 'about', label: 'GIỚI THIỆU', path: '/about' },
        { key: 'pet-service', label: 'Dịch vụ thú cưng', path: '/pet-service', parent: 'DỊCH VỤ' },
        { key: 'pet-hotel', label: 'Khách sạn thú cưng', path: '/pet-hotel', parent: 'DỊCH VỤ' },
        { key: 'for-dog', label: 'Dành cho chó', path: '/for-dog-products', parent: 'CỬA HÀNG' },
        { key: 'for-cat', label: 'Dành cho mèo', path: '/for-cat-products', parent: 'CỬA HÀNG' },
        { key: 'contact', label: 'LIÊN HỆ', path: '/contact' },
      ];
    } else if (role === 'admin') {
      menuItems = [
        { key: 'schedule', label: 'LỊCH', path: '/staff-schedule' },
        { key: 'manage-accounts', label: 'QUẢN LÍ TÀI KHOẢN', path: '/manage-accounts' },
        { key: 'pet-service', label: 'Dịch vụ thú cưng', path: '/pet-service', parent: 'DỊCH VỤ' },
        { key: 'pet-hotel', label: 'Khách sạn thú cưng', path: '/pet-hotel', parent: 'DỊCH VỤ' },
        { key: 'for-dog', label: 'Dành cho chó', path: '/for-dog-products', parent: 'CỬA HÀNG' },
        { key: 'for-cat', label: 'Dành cho mèo', path: '/for-cat-products', parent: 'CỬA HÀNG' },
        { key: 'booking-list', label: 'QUẢN LÍ BOOKING', path: '/booking-list' },
      ];
    } else if (['sale staff', 'caretaker staff', 'manager'].includes(role)) {
      menuItems = [
        { key: 'schedule', label: 'LỊCH', path: '/staff-schedule' },
        { key: 'pet-service', label: 'Dịch vụ thú cưng', path: '/pet-service', parent: 'DỊCH VỤ' },
        { key: 'pet-hotel', label: 'Khách sạn thú cưng', path: '/pet-hotel', parent: 'DỊCH VỤ' },
        { key: 'for-dog', label: 'Dành cho chó', path: '/for-dog-products', parent: 'CỬA HÀNG' },
        { key: 'for-cat', label: 'Dành cho mèo', path: '/for-cat-products', parent: 'CỬA HÀNG' },
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
      <Menu mode={isVertical ? "vertical" : "horizontal"} onClick={closeMenu} className={isVertical ? '' : 'flex justify-end bg-cyan-400'} disabledOverflow={true}>
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
        {role === 'guest' && isVertical && (
          <Menu.Item key="login" onClick={handleLoginClick}>ĐĂNG NHẬP</Menu.Item>
        )}
        {role === 'customer' && isVertical && (
          <>
            <Menu.Item key="cart" onClick={() => navigate('/cart')}>GIỎ HÀNG</Menu.Item>
            <Menu.SubMenu key="user-profile" title="TÀI KHOẢN">
              {userMenuItems.map(item => (
                <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                  {item.label}
                </Menu.Item>
              ))}
            </Menu.SubMenu>
          </>
        )}
        {role === 'admin' && isVertical && (
          <Menu.SubMenu key="user-profile" title="TÀI KHOẢN">
            {userMenuItems.map(item => (
              <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        )}
        {['sale staff', 'caretaker staff', 'manager'].includes(role) && isVertical && (
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
      <Header className="flex justify-between items-center bg-cyan-400 shadow-md px-4 py-2 md:px-8 md:py-4">
        <div className="flex items-center">
          <img className="h-20 w-20" src="/src/assets/image/iconPet.png" alt="Pet Service Logo" />
          <span className="text-4xl ml-2 px-7 cursor-pointer text-white" onClick={clickTitle}>Pet Service</span>
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
            {role === 'guest' ? (
              // <Button type="primary" onClick={handleLoginClick} className="ml-4">ĐĂNG NHẬP</Button>
              <button 
                onClick={handleLoginClick}
                className="relative border-2 border-teal-600 rounded px-4 py-2 inline cursor-pointer text-2xl font-bold before:bg-teal-600 hover:rounded-b-none before:absolute before:-bottom-0 before:-left-0  before:block before:h-[4px] before:w-full before:origin-bottom-right before:scale-x-0 before:transition before:duration-300 before:ease-in-out hover:before:origin-bottom-left hover:before:scale-x-100">
                ĐĂNG NHẬP
              </button>
            ) : (
              <div className="flex items-center ml-4">
                {role === 'customer' && (
                  <>
                    <Badge count={productCount}>
                      <Button shape="circle" icon={<ShoppingCartOutlined />} onClick={() => navigate('/cart')} />
                    </Badge>

                  </>
                )}
                {role !== 'guest' && (
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
