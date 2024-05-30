import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

const UserProfile = () => {
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '123-456-7890',
    address: '123 Main St, Anytown, USA',
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleUpdateInfo = () => {
    setIsEditMode(true);
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setFormData({ ...user });
    setErrors({});
  };

  const handleSave = () => {
    let newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Tên không được để trống';
    if (!formData.lastName.trim()) newErrors.lastName = 'Họ không được để trống';
    if (!formData.email.trim()) newErrors.email = 'Email không được để trống';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Số điện thoại không được để trống';
    if (!formData.address.trim()) newErrors.address = 'Địa chỉ không được để trống';

    if (Object.keys(newErrors).length === 0) {
      setUser(formData);
      setIsEditMode(false);
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:h-15 bg-gray-200 w-full md:w-1/3 p-4 flex flex-col justify-center px-10 items-center md:items-start">
        <h2 className="text-4xl font-semibold mb-4">Tài khoản</h2>
        <ul className="list-disc pl-4">
          <li className="mb-2 text-gray-500 cursor-pointer hover:text-blue-500 duration-500" onClick={() => navigate('/user-profile-staff')}>Thông tin người dùng</li>
          <li className="mb-2 text-gray-500 cursor-pointer hover:text-blue-500 duration-500" onClick={() => navigate('/')}>Đăng xuất</li>
        </ul>
      </div>
      <div className="flex items-center justify-center min-h-3/4 py-6 bg-gray-100 w-full md:w-2/3">
        <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-center text-3xl font-semibold mb-6">Thông tin người dùng</h2>
          {isEditMode ? (
            <form>
              <div className="flex justify-between mb-4">
                <div className="w-1/2 pr-2">
                  <label className="block mb-2 font-light" htmlFor="firstName">Tên:</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className="p-2 bg-gray-200 rounded-md w-full"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div className="w-1/2 pl-2">
                  <label className="block mb-2 font-light" htmlFor="lastName">Họ:</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className="p-2 bg-gray-200 rounded-md w-full"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-light" htmlFor="email">Email:</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="p-2 bg-gray-200 rounded-md w-full"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-light" htmlFor="phoneNumber">Số điện thoại:</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  className="p-2 bg-gray-200 rounded-md w-full"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-light" htmlFor="address">Địa chỉ:</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="p-2 bg-gray-200 rounded-md w-full"
                  value={formData.address}
                  onChange={handleChange}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-1/2 bg-green-500 text-white py-2 px-4 rounded-md mr-2 hover:bg-green-700 transition duration-300"
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-1/2 bg-gray-500 text-white py-2 px-4 rounded-md ml-2 hover:bg-gray-700 transition duration-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-between mb-4">
                <div className="w-1/2 pr-2">
                  <label className="block mb-2 font-bold">Tên:</label>
                  <p className="p-2 bg-gray-200 rounded-md">{user.firstName}</p>
                </div>
                <div className="w-1/2 pl-2">
                  <label className="block mb-2 font-bold">Họ:</label>
                  <p className="p-2 bg-gray-200 rounded-md">{user.lastName}</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">Email:</label>
                <p className="p-2 bg-gray-200 rounded-md">{user.email}</p>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">Số điện thoại:</label>
                <p className="p-2 bg-gray-200 rounded-md">{user.phoneNumber}</p>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">Địa chỉ:</label>
                <p className="p-2 bg-gray-200 rounded-md">{user.address}</p>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleUpdateInfo}
                  className="w-1/2 bg-green-500 text-white py-2 px-4 rounded-md mr-2 hover:bg-green-700 transition duration-300"
                >
                  Cập nhật thông tin
                </button>
                <button
                  onClick={handleChangePassword}
                  className="w-1/2 bg-blue-500 text-white py-2 px-4 rounded-md ml-2 hover:bg-blue-700 transition duration-300"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );  
};

export default UserProfile;
