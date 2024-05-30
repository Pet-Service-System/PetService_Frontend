import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

const Banner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleServiceDropdown = () => {
    setIsServiceDropdownOpen(!isServiceDropdownOpen);
    setIsStoreDropdownOpen(false); 
  };

  const toggleStoreDropdown = () => {
    setIsStoreDropdownOpen(!isStoreDropdownOpen);
    setIsServiceDropdownOpen(false); 
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
        setIsServiceDropdownOpen(false);
        setIsStoreDropdownOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
    setIsServiceDropdownOpen(false);
    setIsStoreDropdownOpen(false);
  };

  const handleLoginClick = () => {
    closeMenu();
    navigate('/login');
  };

  const clickTitle = () => {
    navigate('/');
  };

  return (
    <div className="jarallax bg-gray-200">
      <div className="p-5 bg-white shadow md:flex md:items-center md:justify-between">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center">
            <img className="h-20 w-20" src="/src/assets/image/iconPet.png" alt="Pet Service Logo" />
            <span className="text-4xl ml-2 px-7 cursor-pointer" onClick={clickTitle}>Pet Service</span>
          </div>
          <button
            className="text-3xl md:hidden focus:outline-none"
            onClick={toggleMenu}
          >
            ☰
          </button>
        </div>
        <ul className={`flex-col md:flex md:flex-row md:items-center w-full md:w-auto ${isOpen || !isSmallScreen ? 'flex' : 'hidden'}`}>
          <li className="mx-4 my-3 md:my-0">
            <a href="/" onClick={closeMenu} className="text-xl hover:text-cyan-500 duration-500">TRANG CHỦ</a>
          </li>
          <li className="mx-4 my-3 md:my-0">
            <a href="/about" onClick={closeMenu} className="text-xl hover:text-cyan-500 duration-500">GIỚI THIỆU</a>
          </li>
          <li className="relative mx-4 my-3 md:my-0">
            <button onClick={toggleServiceDropdown} className="text-xl hover:text-cyan-500 duration-500">
              DỊCH VỤ
            </button>
            {isServiceDropdownOpen && (
              <ul className="absolute bg-white shadow-lg rounded mt-2 w-60 z-10">
                <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { closeMenu(); navigate('/pet-service'); }}>
                  Dịch vụ thú cưng
                </li>
                <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { closeMenu(); navigate('/pet-hotel'); }}>
                  Khách sạn thú cưng
                </li>
              </ul>
            )}
          </li>
          <li className="relative mx-4 my-3 md:my-0">
            <button onClick={toggleStoreDropdown} className="text-xl hover:text-cyan-500 duration-500">
              CỬA HÀNG
            </button>
            {isStoreDropdownOpen && (
              <ul className="absolute bg-white shadow-lg rounded mt-2 w-60 z-10">
                <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { closeMenu(); navigate('/for-dog'); }}>
                  Dành cho chó
                </li>
                <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer" onClick={() => { closeMenu(); navigate('/for-cat'); }}>
                  Dành cho mèo
                </li>
              </ul>
            )}
          </li>
          <li className="mx-4 my-3 md:my-0">
            <a href="/contact" onClick={closeMenu} className="text-xl hover:text-cyan-500 duration-500">LIÊN HỆ</a>
          </li>
          <li className="mx-4 my-3 md:my-0">
            <button onClick={handleLoginClick} className="bg-cyan-400 text-white duration-500 px-6 py-2 hover:bg-cyan-500 rounded">
              ĐĂNG NHẬP
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Banner;
