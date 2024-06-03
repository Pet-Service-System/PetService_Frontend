import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Drawer, Badge, Popover } from 'antd';
import { MenuOutlined, UserOutlined, ShoppingCartOutlined, UnorderedListOutlined, HistoryOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header } = Layout;

const Banner = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role') || 'guest');
  const [accountId, setAccountId] = useState(localStorage.getItem('account_id'));
  const [fullName, setFullName] = useState(localStorage.getItem('fullname'));
  const [email, setEmail] = useState(localStorage.getItem('email'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

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

    console.log('Role:', role);
    console.log('Account ID:', accountId);
    console.log('Full Name:', fullName);
    console.log('Email:', email);
    console.log('User:', user);

    
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
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('account_id');
    localStorage.removeItem('fullname');
    localStorage.removeItem('email'); 
    localStorage.removeItem('user'); 
    setRole('guest');
    setAccountId(null);
    setFullName(null); 
    setEmail(null); 
    setUser(null); 
    navigate('/')
    window.location.reload();
  };

  const userMenu = (
    <Menu>
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => navigate('/user-profile')}
      >
        Thông tin người dùng
      </Menu.Item>
      <Menu.Item
        key="pet-list"
        icon={<UnorderedListOutlined />}
        onClick={() => navigate('/pet-list')}
      >
        Danh sách thú cưng
      </Menu.Item>
      <Menu.Item
        key="transaction-history"
        icon={<HistoryOutlined />}
        onClick={() => navigate('/transaction-history')}
      >
        Lịch sử giao dịch
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
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
        { key: 'for-dog', label: 'Dành cho chó', path: '/for-dog', parent: 'CỬA HÀNG' },
        { key: 'for-cat', label: 'Dành cho mèo', path: '/for-cat', parent: 'CỬA HÀNG' },
        { key: 'contact', label: 'LIÊN HỆ', path: '/contact' },
      ];
    } else if (role === 'customer') {
      menuItems = [
        { key: 'home', label: 'TRANG CHỦ', path: '/' },
        { key: 'about', label: 'GIỚI THIỆU', path: '/about' },
        { key: 'pet-service', label: 'Dịch vụ thú cưng', path: '/pet-service', parent: 'DỊCH VỤ' },
        { key: 'pet-hotel', label: 'Khách sạn thú cưng', path: '/pet-hotel', parent: 'DỊCH VỤ' },
        { key: 'for-dog', label: 'Dành cho chó', path: '/for-dog', parent: 'CỬA HÀNG' },
        { key: 'for-cat', label: 'Dành cho mèo', path: '/for-cat', parent: 'CỬA HÀNG' },
        { key: 'contact', label: 'LIÊN HỆ', path: '/contact' },
      ];
    } else if (role === 'admin') {
      menuItems = [
        { key: 'schedule', label: 'LỊCH', path: '/staff-schedule' },
        { key: 'manage-accounts', label: 'QUẢN LÍ TÀI KHOẢN', path: '/manage-accounts' },
        { key: 'pet-service', label: 'Dịch vụ thú cưng', path: '/pet-service', parent: 'DỊCH VỤ' },
        { key: 'pet-hotel', label: 'Khách sạn thú cưng', path: '/pet-hotel', parent: 'DỊCH VỤ' },
        { key: 'for-dog', label: 'Dành cho chó', path: '/for-dog', parent: 'CỬA HÀNG' },
        { key: 'for-cat', label: 'Dành cho mèo', path: '/for-cat', parent: 'CỬA HÀNG' },
        { key: 'manage-bookings', label: 'QUẢN LÍ BOOKING', path: '/manage-bookings' },
      ];
    } else if (role === 'staff') {
      menuItems = [
        { key: 'schedule', label: 'LỊCH', path: '/staff-schedule' },
        { key: 'pet-service', label: 'Dịch vụ thú cưng', path: '/pet-service', parent: 'DỊCH VỤ' },
        { key: 'pet-hotel', label: 'Khách sạn thú cưng', path: '/pet-hotel', parent: 'DỊCH VỤ' },
        { key: 'for-dog', label: 'Dành cho chó', path: '/for-dog', parent: 'CỬA HÀNG' },
        { key: 'for-cat', label: 'Dành cho mèo', path: '/for-cat', parent: 'CỬA HÀNG' },
        { key: 'manage-bookings', label: 'QUẢN LÍ BOOKING', path: '/manage-bookings' },
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
          <Menu.Item key="login">ĐĂNG NHẬP</Menu.Item>
        )}
        {role === 'customer' && isVertical && (
          <>
            <Menu.Item key="cart" onClick={() => navigate('/cart')}>GIỎ HÀNG</Menu.Item>
            <Menu.Item key="user-profile" onClick={() => navigate('/user-profile')}>TÀI KHOẢN</Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>ĐĂNG XUẤT</Menu.Item>
          </>
        )}
        {role === 'admin' && isVertical && (
          <>
            <Menu.Item key="user-profile" onClick={() => navigate('/user-profile')}>TÀI KHOẢN</Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>ĐĂNG XUẤT</Menu.Item>
          </>
        )}
        {role === 'staff' && isVertical && (
          <>
            <Menu.Item key="user-profile" onClick={() => navigate('/user-profile')}>TÀI KHOẢN</Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>ĐĂNG XUẤT</Menu.Item>
          </>
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
              <Button type="primary" onClick={handleLoginClick} className="ml-4">ĐĂNG NHẬP</Button>
            ) : (
              <div className="flex items-center ml-4">
                {role === 'customer' && (
                  <>
                    <Badge count={5}>
                      <Button shape="circle" icon={<ShoppingCartOutlined />} onClick={() => navigate('/cart')} />
                    </Badge>
                    <Popover content={userMenu} trigger="click" visible={visible} onVisibleChange={handleVisibleChange}>
                      <Button shape="round" className="ml-4 py-2 px-4">
                        <span className="text-black">{fullName}</span>
                      </Button>
                    </Popover>
                  </>
                )}
                {role === 'admin' && (
                  <>
                    <Popover content={userMenu} trigger="click">
                      <Button shape="circle" icon={<UserOutlined />} className="ml-4" />
                    </Popover>
                  </>
                )}
                {role === 'staff' && (
                  <Popover content={userMenu} trigger="click">
                    <Button shape="circle" icon={<UserOutlined />} className="ml-4" />
                  </Popover>
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
