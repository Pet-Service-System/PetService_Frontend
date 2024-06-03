import { useState } from 'react';
import { Table, Input, Select, Button } from 'antd';
const { Option } = Select;

const AccountList = () => {
    const [accounts, setAccounts] = useState([
        { id: 1, fullname: 'John Doe', email: 'john@example.com', phone_number: '123456789', address: '123 Street, City', role: 'Administrator' },
        { id: 2, fullname: 'Jane Smith', email: 'jane@example.com', phone_number: '987654321', address: '456 Avenue, Town', role: 'Customer' },
        // Add more sample data here
    ]);
    const [editingId, setEditingId] = useState(null);
    const [editedUser, setEditedUser] = useState(null);
    const roles = ['Customer', 'Sale Staff', 'Caretaker Staff', 'Store Manager', 'Administrator'];

    const handleCancel = () => {
        setEditingId(null);
        setEditedUser(null);
    };

    const handleEditUser = (id) => {
        const userToEdit = accounts.find(user => user.id === id);
        setEditingId(id);
        setEditedUser(userToEdit);
    };

    const handleSaveUser = () => {
        // Validation to ensure no fields are empty
        if (!editedUser.fullname || !editedUser.email || !editedUser.phone_number || !editedUser.address || !editedUser.role) {
            alert('All fields are required');
            return;
        }

        const updatedUsers = accounts.map(user => {
            if (user.id === editedUser.id) {
                return editedUser;
            }
            return user;
        });
        setAccounts(updatedUsers);
        setEditingId(null);
        setEditedUser(null);
    };

    const handleInputChange = (field, value) => {
        setEditedUser({ ...editedUser, [field]: value });
    };

    const columns = [
        {
            title: 'Họ và Tên',
            dataIndex: 'fullname',
            key: 'fullname',
            render: (text, record) => (
                editingId === record.id ? (
                    <Input
                        value={editedUser.fullname}
                        onChange={(e) => handleInputChange('fullname', e.target.value)}
                    />
                ) : (
                    text
                )
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text, record) => (
                editingId === record.id ? (
                    <Input
                        value={editedUser.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                ) : (
                    text
                )
            ),
        },
        {
            title: 'Số Điện Thoại',
            dataIndex: 'phone_number',
            key: 'phone_number',
            render: (text, record) => (
                editingId === record.id ? (
                    <Input
                        value={editedUser.phone_number}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    />
                ) : (
                    text
                )
            ),
        },
        {
            title: 'Địa Chỉ',
            dataIndex: 'address',
            key: 'address',
            render: (text, record) => (
                editingId === record.id ? (
                    <Input
                        value={editedUser.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                ) : (
                    text
                )
            ),
        },
        {
            title: 'Vai Trò',
            dataIndex: 'role',
            key: 'role',
            render: (text, record) => (
                editingId === record.id ? (
                    <Select
                        value={editedUser.role}
                        onChange={(value) => handleInputChange('role', value)}
                        style={{ width: '100%' }} // Apply custom width style
                    >
                        <Option value="">Select Role</Option>
                        {roles.map((role, index) => (
                            <Option key={index} value={role}>{role}</Option>
                        ))}
                    </Select>
                ) : (
                    text
                )
            ),
        },
        {
            title: 'Hành Động',
            key: 'action',
            render: (text, record) => (
                editingId === record.id ? (
                    <>
                         <div className="flex space-x-2">
                            <Button type="primary" onClick={handleSaveUser}>Lưu</Button>
                            <Button onClick={handleCancel}>Hủy</Button>
                        </div>
                    </>
                ) : (
                    <Button type="primary" onClick={() => handleEditUser(record.id)}>Cập nhật</Button>
                )
            ),
        },
    ];

    return (
        <div className="account-list p-40 overflow-x-auto">
            <h2 className="text-5xl text-center text-red-500 font-semibold mb-4">Danh sách người dùng</h2>
            <div className="max-w-full overflow-x-auto">
                <Table dataSource={accounts} columns={columns} rowKey="id" />
            </div>
        </div>
    );
}

export default AccountList;
