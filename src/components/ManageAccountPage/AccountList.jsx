import { useEffect, useState } from 'react';
import { getAccounts } from '../../apis/ApiAccount';

const AccountList = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAccounts().then((data) => {
            setAccounts(data);
            setLoading(false);
        });
    }, []);

    const roles = ['Customer', 'Sale Staff', 'Caretaker Staff', 'Store Manager', 'Administrator'];

    const [editingId, setEditingId] = useState(null);
    const [editedUser, setEditedUser] = useState({});

    const handleEditUser = (id) => {
        const userToEdit = accounts.find(user => user.id === id);
        setEditingId(id);
        setEditedUser(userToEdit);
    };

    const handleSaveUser = () => {
        const updatedUsers = accounts.map(user => {
            if (user.id === editedUser.id) {
                return editedUser;
            }
            return user;
        });
        setAccounts(updatedUsers);
        setEditingId(null);
        setEditedUser({});
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditedUser({});
    };

    const handleDeleteUser = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            setAccounts(accounts.filter(user => user.id !== id));
        }
    };

    const handleInputChange = (field, value) => {
        setEditedUser({ ...editedUser, [field]: value });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (accounts &&
        <div className="account-list p-40 overflow-x-auto">
            <h2 className="text-5xl text-center text-red-500 font-semibold mb-4">Danh sách người dùng</h2>
            <div className="max-w-full overflow-x-auto">
                <table className="border-collapse border border-gray-300 w-full">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Họ và Tên</th>
                            <th className="border px-4 py-2">Email</th>
                            <th className="border px-4 py-2">Số Điện Thoại</th>
                            <th className="border px-4 py-2">Địa Chỉ</th>
                            <th className="border px-4 py-2">Vai Trò</th>
                            <th className="border px-4 py-2">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((user) => (
                            <tr key={user.id}>
                                <td className="border px-4 py-2">
                                    {editingId === user.id ? (
                                        <input
                                            type="text"
                                            value={editedUser.fullname || ''}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="p-2 bg-gray-200 rounded-md w-full"
                                        />
                                    ) : (
                                        user.fullname
                                    )}
                                </td>
                                <td className="border px-4 py-2">
                                    {editingId === user.id ? (
                                        <input
                                            type="text"
                                            value={editedUser.email || ''}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="p-2 bg-gray-200 rounded-md w-full"
                                        />
                                    ) : (
                                        user.email
                                    )}
                                </td>
                                <td className="border px-4 py-2">
                                    {editingId === user.id ? (
                                        <input
                                            type="text"
                                            value={editedUser.phone_number || ''}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="p-2 bg-gray-200 rounded-md w-full"
                                        />
                                    ) : (
                                        user.phone_number
                                    )}
                                </td>
                                <td className="border px-4 py-2">
                                    {editingId === user.id ? (
                                        <input
                                            type="text"
                                            value={editedUser.address || ''}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            className="p-2 bg-gray-200 rounded-md w-full"
                                        />
                                    ) : (
                                        user.address
                                    )}
                                </td>
                                <td className="border px-4 py-2">
                                    {editingId === user.id ? (
                                        <select
                                            value={editedUser.role || ''}
                                            onChange={(e) => handleInputChange('role', e.target.value)}
                                            className="p-2 bg-gray-200 rounded-md w-full"
                                        >
                                            <option value="">Select Role</option>
                                            {roles.map((role, index) => (
                                                <option key={index} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        user.role
                                    )}
                                </td>
                                <td className="border px-4 py-2">
                                    {editingId === user.id ? (
                                        <div className='flex'>
                                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={handleSaveUser}>Lưu</button>
                                            <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={handleCancelEdit}>Hủy</button>
                                        </div>
                                    ) : (
                                        <div className='flex'>
                                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={() => handleEditUser(user.id)}>Sửa</button>
                                            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleDeleteUser(user.id)}>Xóa</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AccountList;
