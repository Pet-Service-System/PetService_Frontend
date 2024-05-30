import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import { FaRegUserCircle } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";

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
  };

  const handleUserIconClick = () => {
    closeMenu();
    navigate('/user-profile');
  };

  const handleCartIconClick = () => {
    closeMenu();
    navigate('/cart');
  };

  return (
    <div className="jarallax bg-gray-200">
      <div className="p-5 bg-white shadow md:flex md:items-center md:justify-between">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center">
            <img className="h-20 w-20" src="/src/assets/image/iconPet.png" alt="Pet Service Logo" />
            <span className="text-4xl ml-2 px-7 cursor-pointer">Pet Service</span>
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
            {isSmallScreen ? (
              <button onClick={handleCartIconClick} className="text-xl hover:text-cyan-500 duration-500">GIỎ HÀNG</button>
            ) : (
              <IoCartOutline className="userIcon w-10 h-10 hover:text-cyan-500 duration-500" onClick={handleCartIconClick} />
            )}
          </li>
          <li className="mx-4 my-3 md:my-0">
            {isSmallScreen ? (
              <button onClick={handleUserIconClick} className="text-xl hover:text-cyan-500 duration-500">TÀI KHOẢN</button>
            ) : (
              <FaRegUserCircle className="userIcon w-10 h-10 hover:text-cyan-500 duration-500" onClick={handleUserIconClick} />
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Banner;
