import { useEffect, useState } from 'react';
import { Table, Button, Typography } from 'antd';
const { Title } = Typography;

const BookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc');
    const [role, setRole] = useState(localStorage.getItem('role') || 'guest');

    useEffect(() => {
        const sampleData = [
            { id: 1, fullname: 'John Doe', date: '2023-06-01', amount: 150.00, status: 'Confirmed' },
            { id: 2, fullname: 'Jane Smith', date: '2023-06-02', amount: 200.00, status: 'Pending' },
            { id: 3, fullname: 'Alice Johnson', date: '2023-06-03', amount: 100.00, status: 'Cancelled' },
            { id: 4, fullname: 'Bob Brown', date: '2023-06-04', amount: 250.00, status: 'Confirmed' },
        ];
        setBookings(sampleData);
    }, []);

    const handleSort = () => {
        const sortedBookings = [...bookings].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (sortOrder === 'asc') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });
        setBookings(sortedBookings);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const columns = [
        {
            title: 'Mã đặt lịch',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullname',
            key: 'fullname',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date',
            render: (text) => formatDate(text),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (text) => `$${text.toFixed(2)}`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Chi tiết',
            key: 'details',
            render: (text, record) => (
                <a href={`/booking-detail/${record.id}`} className="text-blue-500 hover:underline">Chi tiết</a>
            ),
        },
    ];

    if (role !== 'admin' && role !== 'sale staff') {
        columns.push({
            title: 'Đánh giá',
            key: 'feedback',
            render: (text, record) => (
                <a href={`/booking-feedback/${record.id}`} className="text-blue-500 hover:underline">Xem đánh giá</a>
            ),
        });
    }

    return (
        <div className="p-10">
            <Title className="text-center text-red-500 font-semibold mb-4" level={2}>
                Danh sách đặt lịch của khách hàng
            </Title>
            <div className="flex justify-end mb-4">
                <Button type="primary" onClick={handleSort}>
                    {sortOrder === 'asc' ? 'Sắp xếp: Ngày gần nhất' : 'Sắp xếp: Ngày xa nhất'}
                </Button>
            </div>
            <Table
                dataSource={bookings}
                columns={columns}
                rowKey="id"
                bordered
            />
        </div>
    );
};

export default BookingList;
