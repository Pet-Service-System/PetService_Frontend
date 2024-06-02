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
      // <div className="max-w-lg mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-24 mt-20">
      //   <h2 className="text-2xl font-semibold mb-4">Thông tin đặt lịch</h2>
      //   <div className="grid grid-cols-2 gap-4">
      //     <div className="flex items-center">
      //       <strong className="mr-2">Mã đặt lịch:</strong>
      //       <span>{bookingData.id}</span>
      //     </div>
      //     <div className="flex items-center">
      //       <strong className="mr-2">Dịch vụ:</strong>
      //       <span>{bookingData.service_name}</span>
      //     </div>
      //     <div className="flex items-center">
      //       <strong className="mr-2">Ngày đặt:</strong>
      //       <span>{formatDate(bookingData.date)}</span>
      //     </div>
      //     <div className="flex items-center">
      //       <strong className="mr-2">Tổng tiền:</strong>
      //       <span>${bookingData.amount}</span>
      //     </div>
      //     <div className="flex items-center">
      //       <strong className="mr-2">Thú cưng:</strong>
      //       <span>{bookingData.pet}</span>
      //     </div>
      //     <div className="flex items-center">
      //       <strong className="mr-2">Địa chỉ:</strong>
      //       <span>{bookingData.address}</span>
      //     </div>
      //     <div className="flex items-center">
      //       <strong className="mr-2">Trạng thái:</strong>
      //       <span>{bookingData.status}</span>
      //     </div>
      //   </div>
      //   <div className="flex justify-center mt-8">
      //     <button
      //       className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      //       onClick={handlePrint}
      //     >
      //       In hóa đơn
      //     </button>
      //   </div>
      // </div>
      <div className="bg-white rounded-lg shadow-lg px-8 py-10 max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <img className="h-20 w-20" src="/src/assets/image/iconPet.png" alt="Pet Service Logo" />
            <div className="text-gray-700 font-semibold text-lg pl-10">Thông tin đặt lịch</div>
          </div>
          <div className="text-gray-700 ">
            <div className="font-bold text-xl mb-2">INVOICE</div>
            <div className="text-sm">{formatDate(bookingData.date)}</div>
            <div className="text-sm">Mã đặt lịch: {bookingData.id}</div>
          </div>
        </div>
        <div className="border-b-2 border-gray-300 pb-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Bill To:</h2>

          <div className="text-gray-700 mb-2">{bookingData.address}</div>
        </div>
        <table className="w-full text-left mb-8">
          <thead>
            <tr>
              <th className="text-gray-700 font-bold uppercase py-2">Service</th>
              <th className="text-gray-700 font-bold uppercase py-2">Status</th>
              <th className="text-gray-700 font-bold uppercase py-2">pet</th>
              <th className="text-gray-700 font-bold uppercase py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-4 text-gray-700">{bookingData.service_name}</td>
              <td className="py-4 text-gray-700">{bookingData.status}</td>
              <td className="py-4 text-gray-700">{bookingData.pet}</td>
              <td className="py-4 text-gray-700">${bookingData.amount}</td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-end mb-8">
          <div className="text-gray-700 mr-2">Total:</div>
          <div className="text-gray-700 font-bold text-x5">{bookingData.amount}</div>
        </div>
        <div className="border-t-2 border-gray-300 pt-8 mb-8">
          <div className="text-gray-700 mb-2">Payment is due within 30 days. Late payments are subject to fees.</div>
          <div className="text-gray-700 mb-2">Please make checks payable to Your Company Name and mail to:</div>
          <div className="text-gray-700">{bookingData.address}</div>
        </div>
        <div className='text-center'>
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
