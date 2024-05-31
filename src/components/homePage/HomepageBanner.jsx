import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

const HomePageBanner = () => {
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


  const clickTitle = () => {
    navigate('/');
  };

  return (
    <div className="jarallax bg-gray-200">
      <div className="p-5 bg-white shadow md:flex md:items-center md:justify-between">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center">
            <NavLink to={"/"} >
              <img className="h-20 w-20" src="/src/assets/image/iconPet.png" alt="Pet Service Logo" />
            </NavLink>
            <NavLink to={"/"}>
              <span className="text-4xl ml-2 px-7 cursor-pointer">Pet Service</span>
            </NavLink>
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
              <NavLink to="/" onClick={closeMenu} className="relative bold text-xl hover:text-cyan-500 duration-500">TRANG CHỦ</NavLink>
            </li>
          </div>
          <div className='text-4xl cursor-pointer relative before:absolute before:bg-sky-200 before:bottom-0 before:left-0 before:h-full before:w-full before:origin-bottom before:scale-y-[0.35] hover:before:scale-y-100 before:transition-transform before:ease-in-out before:duration-500'>
            <li className="mx-4 my-3 md:my-0">
              <NavLink to="about" onClick={closeMenu} className="relative bold text-xl hover:text-cyan-500 duration-500">GIỚI THIỆU</NavLink>
            </li>
          </div>
          <div className="group relative cursor-pointer py-2">
            <div className="flex items-center justify-between space-x-5 bg-white px-4">
              <a className="menu-hover text-xl hover:text-cyan-500 duration-500">
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

              <NavLink to={"pet-service"} className="my-2 block border-b border-gray-100 py-1 font-semibold text-gray-500 hover:text-black md:mx-2">
                Dịch vụ thú cưng
              </NavLink>

              <NavLink to={"pet-hotel"} className="my-2 block border-b border-gray-100 py-1 font-semibold text-gray-500 hover:text-black md:mx-2">
                Khách sạn thú cưng
              </NavLink>

            </div>
          </div>
          <div className="group relative cursor-pointer py-2">

            <div className="flex items-center justify-between space-x-5 bg-white px-4">
              <a className="menu-hover text-xl hover:text-cyan-500 duration-500">
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

              <NavLink to={"for-dog"} className="my-2 block border-b border-gray-100 py-1 font-semibold text-gray-500 hover:text-black md:mx-2">
                Dành cho chó
              </NavLink>

              <NavLink to={"for-cat"} className="my-2 block border-b border-gray-100 py-1 font-semibold text-gray-500 hover:text-black md:mx-2">
                Dành cho mèo
              </NavLink>

            </div>
          </div>
          <div className='text-4xl cursor-pointer relative before:absolute before:bg-sky-200 before:bottom-0 before:left-0 before:h-full before:w-full before:origin-bottom before:scale-y-[0.35] hover:before:scale-y-100 before:transition-transform before:ease-in-out before:duration-500'>
            <li className="mx-4 my-3 md:my-0">
              <NavLink to="/contact" onClick={closeMenu} className="relative bold text-xl hover:text-cyan-500 duration-500">LIÊN HỆ</NavLink>
            </li>
          </div>
          <li className="mx-4 my-3 md:my-0">
            <button onClick={closeMenu} className="bg-cyan-400 text-white duration-500 px-6 py-2 hover:bg-cyan-500 rounded">
              <NavLink to={"/login"}>ĐĂNG NHẬP</NavLink>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomePageBanner;
