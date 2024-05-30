import { useEffect, useState } from 'react';
import { getBooking } from '../../apis/ApiBooking.js';

const BookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        getBooking().then((data) => {
            setBookings(data);
        });
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

    return (
        bookings && (
            <div className="p-44">
                <h2 className="text-5xl text-center text-red-500 font-semibold mb-4">Danh sách đặt lịch của khách hàng</h2>
                <div className="flex justify-end mb-4">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleSort}
                    >
                        {sortOrder === 'asc' ? 'Sắp xếp: Ngày gần nhất' : 'Sắp xếp: Ngày xa nhất'}
                    </button>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Mã đặt lịch</th>
                            <th className="border px-4 py-2">Ngày đặt</th>
                            <th className="border px-4 py-2">Tổng tiền</th>
                            <th className="border px-4 py-2">Trạng thái</th>
                            <th className="border px-4 py-2">Chi tiết</th>
                            <th className="border px-4 py-2">Đánh giá</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td className="border px-4 py-2">{booking.id}</td>
                                <td className="border px-4 py-2">{formatDate(booking.date)}</td>
                                <td className="border px-4 py-2">${booking.amount}</td>
                                <td className="border px-4 py-2">{booking.status}</td>
                                <td className="border px-4 py-2">
                                    <a href={`/booking-detail/${booking.id}`} className="text-blue-500 hover:underline">Chi tiết</a>
                                </td>
                                <td className="border px-4 py-2">
                                    <a href={`/booking-feedback/${booking.id}`} className="text-blue-500 hover:underline">Xem đánh giá</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    );
};

export default BookingList;
