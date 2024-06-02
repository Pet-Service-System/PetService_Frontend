import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Drawer, Badge } from 'antd';
import { MenuOutlined, UserOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { Header } = Layout;

const Banner = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [role, setRole] = useState('staff'); // 'guest', 'customer', 'admin', 'staff'
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsDrawerVisible(false);
      }
    };

    // const storedRole = localStorage.getItem('role');
    // setRole(storedRole);
    // console.log('Role retrieved from localStorage:', storedRole);

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const closeMenu = () => setIsDrawerVisible(false);
  const handleLoginClick = () => { closeMenu(); navigate('/login'); };
  const clickTitle = () => navigate('/');

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
          <Menu.Item key="login">
            <Button type="primary" onClick={handleLoginClick}>ĐĂNG NHẬP</Button>
          </Menu.Item>
        )}
        {role === 'customer' && isVertical && (
          <>
            <Menu.Item key="cart" onClick={() => navigate('/cart')}>GIỎ HÀNG</Menu.Item>
            <Menu.Item key="user-profile" onClick={() => navigate('/user-profile')}>TÀI KHOẢN</Menu.Item>
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
                    <Button shape="circle" icon={<UserOutlined />} onClick={() => navigate('/user-profile')} className="ml-4" />
                  </>
                )}
                {role === 'admin' && (
                  <>
                    <Button shape="circle" icon={<UserOutlined />} onClick={() => navigate('/user-profile')} className="ml-4" />
                  </>
                )}
                {role === 'staff' && (
                  <Button shape="circle" icon={<UserOutlined />} onClick={() => navigate('/user-profile')} className="ml-4" />
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
