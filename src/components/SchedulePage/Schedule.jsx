import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Typography, Button, Modal, Form, Select, Skeleton, message } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error('Authorization token not found. Please log in.');
          return;
        }

        const response = await axios.get('http://localhost:3001/api/schedules', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        message.error('Error fetching schedules');
      }
      setLoading(false);
    };

    fetchSchedules();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/accounts/role', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Users fetched:', response.data.accounts);
        setUsers(response.data.accounts);
      } catch (error) {
        console.error('Error fetching users:', error);
        message.error('Error fetching users');
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const timeSlots = [
    { start: '08:00', end: '10:00' },
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' },
  ];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const columns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      render: (text) => <strong>{text}</strong>,
    },
    ...days.map((day) => ({
      title: day,
      dataIndex: day,
      key: day,
      render: (text) =>
        text && text.length > 0 ? (
          text.map((employee, index) => (
            <div key={index}>
              {employee.fullname} ({employee.role})
            </div>
          ))
        ) : (
          <div>No employees</div>
        ),
    })),
  ];

  const data = timeSlots.map((slot) => {
    const row = { key: slot.start, time: `${slot.start} - ${slot.end}` };
    days.forEach((day) => {
      const schedule = schedules.find((sch) => sch.day === day);
      if (schedule) {
        const timeSlot = schedule.slots.find((s) => s.start_time === slot.start && s.end_time === slot.end);
        row[day] = timeSlot ? timeSlot.employees : [];
      } else {
        row[day] = [];
      }
    });
    return row;
  });

  const handleSchedule = async (values) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authorization token not found. Please log in.');
        return;
      }

      const { day, timeSlot, fullname } = values;
      const [start_time, end_time] = timeSlot.split(' - ');
      const accountId = selectedUser ? selectedUser.account_id : null;
      const role = selectedUser ? selectedUser.role : null;

      await axios.post(
        'http://localhost:3001/api/schedules/assign',
        {
          day,
          slots: [{ start_time, end_time }],
          accountId,
          fullname,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const response = await axios.get('http://localhost:3001/api/schedules', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSchedules(response.data);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Employee scheduled successfully');
    } catch (error) {
      console.error('Error scheduling employee:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error scheduling employee');
      }
    }
  };

  const handleFullnameChange = (value) => {
    const user = users.find((user) => user.fullname === value);
    setSelectedUser(user);
    form.setFieldsValue({ account_id: user ? user.account_id : '' });
  };

  return (
    <div className="w-11/12 mx-auto mt-12 py-10">
      <Title level={2} className="text-center text-red-500 mb-6">
        Lịch làm việc của nhân viên
      </Title>
      <Button type="primary" onClick={() => setIsModalVisible(true)} className="mb-6 float-right">
        Schedule Employee
      </Button>
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <Table columns={columns} dataSource={data} bordered pagination={false} scroll={{ x: 'max-content' }} />
      )}
      <Modal
        title="Schedule Employee"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSchedule}>
          <Form.Item name="day" label="Day" rules={[{ required: true, message: 'Please select a day' }]}>
            <Select placeholder="Select a day">
              {days.map((day) => (
                <Option key={day} value={day}>
                  {day}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="timeSlot" label="Time Slot" rules={[{ required: true, message: 'Please select a time slot' }]}>
            <Select placeholder="Select time slot">
              {timeSlots.map((slot) => (
                <Option key={`${slot.start} - ${slot.end}`} value={`${slot.start} - ${slot.end}`}>
                  {slot.start} - {slot.end}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="fullname" label="Full Name" rules={[{ required: true, message: 'Please select a full name' }]}>
            <Select placeholder="Select full name" onChange={handleFullnameChange}>
              {users.map((user) => (
                <Option key={user.account_id} value={user.fullname}>
                  {user.fullname}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="account_id" label="Account ID">
            <Select disabled>
              <Option value={selectedUser ? selectedUser.account_id : ''}>{selectedUser ? selectedUser.account_id : ''}</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="float-right">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Schedule;
