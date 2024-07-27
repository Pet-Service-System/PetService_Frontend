
import { Typography, Card } from 'antd';

const { Title, Paragraph } = Typography;

const Policy = () => {

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Title level={1} className="text-center mb-8">Chính Sách Hoàn Tiền</Title>
      
      <Card className="mb-4 p-4">
        <Title level={3}>1. Chính Sách Hoàn Tiền</Title>
        <Paragraph>
          Chúng tôi hiểu rằng có thể có những tình huống không mong muốn xảy ra, và chúng tôi cam kết hoàn tiền theo chính sách dưới đây:
        </Paragraph>
      </Card>

      <Card className="mb-4 p-4">
        <Title level={3}>2. Chính Sách Hoàn Tiền Theo Nguồn Hủy</Title>
        
        <Title level={4}>2.1 Hủy từ Khách Hàng</Title>
        <Paragraph>
          Nếu khách hàng hủy lịch với các lý do dưới đây, chính sách hoàn tiền sẽ được áp dụng như sau:
        </Paragraph>
        <ul className="list-disc pl-6">
          <li>
            <strong>Khách không đến tiệm để làm dịch vụ:</strong> Hoàn tiền 30% tổng số tiền đã thanh toán.
          </li>
          <li>
            <strong>Khách liên hệ hủy lịch do sự cố hoặc không còn nhu cầu nữa:</strong> Hoàn tiền 100% tổng số tiền đã thanh toán.
          </li>
          <li>
            <strong>Khách hủy lịch sau khi phát sinh chi phí:</strong> Hoàn tiền 70% tổng số tiền đã thanh toán.
          </li>
          <li>
            <strong>Thú cưng không hợp tác:</strong> Hoàn tiền 90% tổng số tiền đã thanh toán.
          </li>
          <li>
            <strong>Các lý do khác:</strong> Hoàn tiền sẽ được giải quyết tùy theo từng tình huống cụ thể. Quý khách vui lòng liên hệ trực tiếp với chúng tôi để thảo luận và giải quyết.
          </li>
        </ul>

        <Title level={4}>2.2 Hủy từ Tiệm</Title>
        <Paragraph>
          Nếu hủy lịch từ phía tiệm, khách hàng sẽ được hoàn tiền 100% tổng số tiền đã thanh toán.
        </Paragraph>
      </Card>

      <Card className="mb-4 p-4">
        <Title level={3}>3. Quy Định Chung</Title>
        <Paragraph>
          - Chính sách hoàn tiền có thể thay đổi tùy theo từng trường hợp cụ thể và theo quy định của pháp luật hiện hành.
        </Paragraph>
        <Paragraph>
          - Mọi yêu cầu hoàn tiền cần được gửi qua email hoặc liên hệ trực tiếp với chúng tôi trong thời gian quy định.
        </Paragraph>
      </Card>
    </div>
  );
};

export default Policy;
