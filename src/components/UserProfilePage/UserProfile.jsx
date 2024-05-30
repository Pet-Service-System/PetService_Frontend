import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

const UserProfile = ({ userData }) => {
  // State to manage the edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  // State to manage the form data
  const [formData, setFormData] = useState({ ...userData });

  // State to manage validation errors
  const [errors, setErrors] = useState({});

  // Hook for navigation
  const navigate = useNavigate();

  // Handle switching to edit mode
  const handleUpdateInfo = () => {
    setIsEditMode(true);
  };

  // Handle navigation to change password page
  const handleChangePassword = () => {
    navigate('/change-password');
  };

  // Handle canceling the edit
  const handleCancel = () => {
    setIsEditMode(false);
    setFormData({ ...userData });
    setErrors({});
  };

  // Handle saving the updated information
  const handleSave = () => {
    let newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'Tên không được để trống';
    if (!formData.last_name.trim()) newErrors.last_name = 'Họ không được để trống';
    if (!formData.email.trim()) newErrors.email = 'Email không được để trống';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Số điện thoại không được để trống';
    if (!formData.address.trim()) newErrors.address = 'Địa chỉ không được để trống';

    if (Object.keys(newErrors).length === 0) {
      // Update user logic (e.g., API call to save changes)
      // setUser(formData);
      setIsEditMode(false);
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  };

  // Handle change in form input fields
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
          <li className="mb-2 text-gray-500 cursor-pointer hover:text-blue-500 duration-500" onClick={() => navigate('/user-profile')}>Thông tin người dùng</li>
          <li className="mb-2 text-gray-500 cursor-pointer hover:text-blue-500 duration-500" onClick={() => navigate('/pet-list')}>Danh sách thú cưng</li>
          <li className="mb-2 text-gray-500 cursor-pointer hover:text-blue-500 duration-500" onClick={() => navigate('/transaction-history')}>Lịch sử giao dịch</li>
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
                  <label className="block mb-2 font-light" htmlFor="first_name">Tên:</label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    className="p-2 bg-gray-200 rounded-md w-full"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                  {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                </div>
                <div className="w-1/2 pl-2">
                  <label className="block mb-2 font-light" htmlFor="last_name">Họ:</label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    className="p-2 bg-gray-200 rounded-md w-full"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                  {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
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
                <label className="block mb-2 font-light" htmlFor="phone_number">Số điện thoại:</label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  className="p-2 bg-gray-200 rounded-md w-full"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
                {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
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
                  <p className="p-2 bg-gray-200 rounded-md">{userData.first_name}</p>
                </div>
                <div className="w-1/2 pl-2">
                  <label className="block mb-2 font-bold">Họ:</label>
                  <p className="p-2 bg-gray-200 rounded-md">{userData.last_name}</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">Email:</label>
                <p className="p-2 bg-gray-200 rounded-md">{userData.email}</p>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">Số điện thoại:</label>
                <p className="p-2 bg-gray-200 rounded-md">{userData.phone_number}</p>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-bold">Địa chỉ:</label>
                <p className="p-2 bg-gray-200 rounded-md">{userData.address}</p>
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

// PropTypes to enforce the type and structure of userData
UserProfile.propTypes = {
  userData: PropTypes.shape({
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone_number: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
  }).isRequired,
};

export default UserProfile;
