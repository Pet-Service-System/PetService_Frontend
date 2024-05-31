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
            <a href={"/"} >
              <img className="h-20 w-20" src="/src/assets/image/iconPet.png" alt="Pet Service Logo" />
            </a>
            <a href={"/"}>
              <span className="text-4xl ml-2 px-7 cursor-pointer" onClick={clickTitle}>Pet Service</span>
            </a>
          </div>
          <button
            className="text-3xl md:hidden focus:outline-none"
            onClick={toggleMenu}
          >
            ☰
          </button>
        </div>
        <ul className={`flex-col md:flex md:flex-row md:items-center w-full md:w-auto ${isOpen || !isSmallScreen ? 'flex' : 'hidden'}`}>
          <div className='text-4xl cursor-pointer relative before:absolute before:bg-sky-200 before:bottom-0 before:left-0 before:h-full before:w-full before:origin-bottom before:scale-y-[0.35] hover:before:scale-y-100 before:transition-transform before:ease-in-out before:duration-500'>
            <li className="mx-4 my-3 md:my-0">
              <a onClick={() => { closeMenu(); navigate('/'); }} className="relative bold text-xl hover:text-cyan-500 duration-500">TRANG CHỦ</a>
            </li>
          </div>
          <div className='text-4xl cursor-pointer relative before:absolute before:bg-sky-200 before:bottom-0 before:left-0 before:h-full before:w-full before:origin-bottom before:scale-y-[0.35] hover:before:scale-y-100 before:transition-transform before:ease-in-out before:duration-500'>
            <li className="mx-4 my-3 md:my-0">
              <a onClick={() => { closeMenu(); navigate('/about'); }} className="relative bold text-xl hover:text-cyan-500 duration-500">GIỚI THIỆU</a>
            </li>
          </div>
          <div className="group relative cursor-pointer py-2">
            <div className="flex items-center justify-between space-x-5 bg-white px-4">
              <a className="menu-hover text-xl hover:text-cyan-500 duration-500" >
                DỊCH VỤ
              </a>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                  stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </div>

            <div
              className="invisible absolute z-50 flex w-full flex-col bg-gray-100 py-1 px-4 text-gray-800 shadow-xl group-hover:visible">

              <a onClick={() => { closeMenu(); navigate('/pet-service'); }} className="my-2 block border-b border-gray-100 py-1 font-semibold text-gray-500 hover:text-black md:mx-2">
                Dịch vụ thú cưng
              </a>

              <a onClick={() => { closeMenu(); navigate('/pet-hotel'); }} className="my-2 block border-b border-gray-100 py-1 font-semibold text-gray-500 hover:text-black md:mx-2">
                Khách sạn thú cưng
              </a>

            </div>
          </div>
          <div className="group relative cursor-pointer py-2">

            <div className="flex items-center justify-between space-x-5 bg-white px-4">
              <a className="menu-hover text-xl hover:text-cyan-500 duration-500" >
                CỬA HÀNG
              </a>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                  stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </span>
            </div>

            <div
              className="invisible absolute z-50 flex w-full flex-col bg-gray-100 py-1 px-4 text-gray-800 shadow-xl group-hover:visible">

              <a onClick={() => { closeMenu(); navigate('/for-dog'); }} className="my-2 block border-b border-gray-100 py-1 font-semibold text-gray-500 hover:text-black md:mx-2">
                Dành cho chó
              </a>

              <a onClick={() => { closeMenu(); navigate('/for-cat'); }} className="my-2 block border-b border-gray-100 py-1 font-semibold text-gray-500 hover:text-black md:mx-2">
                Dành cho mèo
              </a>

            </div>
          </div>
          <div className='text-4xl cursor-pointer relative before:absolute before:bg-sky-200 before:bottom-0 before:left-0 before:h-full before:w-full before:origin-bottom before:scale-y-[0.35] hover:before:scale-y-100 before:transition-transform before:ease-in-out before:duration-500'>
            <li className="mx-4 my-3 md:my-0">
              <a onClick={() => { closeMenu(); navigate('/contact'); }} className="relative bold text-xl hover:text-cyan-500 duration-500">LIÊN HỆ</a>
            </li>
          </div>
          <li className="mx-4 my-3 md:my-0">
            <button onClick={closeMenu} className="bg-cyan-400 text-white duration-500 px-6 py-2 hover:bg-cyan-500 rounded">
              <a onClick={() => { closeMenu(); navigate('/login'); }}>ĐĂNG NHẬP</a>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Banner;
