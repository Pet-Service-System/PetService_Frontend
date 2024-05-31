import React from 'react';

const BookingDetail = ({ bookingData }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    bookingData && (
      <div className="max-w-lg mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-24 mt-20">
        <h2 className="text-2xl font-semibold mb-4">Thông tin đặt lịch</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <strong className="mr-2">Mã đặt lịch:</strong>
            <span>{bookingData.id}</span>
          </div>
          <div className="flex items-center">
            <strong className="mr-2">Dịch vụ:</strong>
            <span>{bookingData.service_name}</span>
          </div>
          <div className="flex items-center">
            <strong className="mr-2">Ngày đặt:</strong>
            <span>{formatDate(bookingData.date)}</span>
          </div>
          <div className="flex items-center">
            <strong className="mr-2">Tổng tiền:</strong>
            <span>${bookingData.amount}</span>
          </div>
          <div className="flex items-center">
            <strong className="mr-2">Thú cưng:</strong>
            <span>{bookingData.pet}</span>
          </div>
          <div className="flex items-center">
            <strong className="mr-2">Địa chỉ:</strong>
            <span>{bookingData.address}</span>
          </div>
          <div className="flex items-center">
            <strong className="mr-2">Trạng thái:</strong>
            <span>{bookingData.status}</span>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handlePrint}
          >
            In hóa đơn
          </button>
        </div>
      </div>
    )
  );
};

export default BookingDetail;
