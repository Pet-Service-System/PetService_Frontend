import PropTypes from 'prop-types';

const TransactionDetail = ({ transactionData }) => {
  // Chuyển đổi ngày thành định dạng day-month-year
  const formattedDate = new Date(transactionData.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  return (
    <div>
      <h1>ID: {transactionData.id}</h1>
      <h1>Date: {formattedDate}</h1>
      <h1>Status: {transactionData.status}</h1>
      <h1>Amount: {transactionData.amount}</h1>
      <h1>Pet Name: {transactionData.pet_name}</h1>
      <h1>Address: {transactionData.address}</h1>
    </div>
  );
};

// PropTypes để bắt buộc kiểu và cấu trúc của transactionData
TransactionDetail.propTypes = {
  transactionData: PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    pet_name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
  }).isRequired,
};

export default TransactionDetail;
