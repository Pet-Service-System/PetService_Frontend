import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Typography, Button, Modal, Form, Select, message } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleOfEmp, setRoleOfEmp] = useState('');
  const [roleOfUser] = useState(localStorage.getItem('role'));
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [accountID] = useState(user.id);

  useEffect(() => {
    const fetchSchedules = async () => {
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
    };

    fetchSchedules();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
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

  const handleRemoveEmployee = async (day, slot, employee) => {
    if (roleOfUser !== 'Store Manager') {
      message.error('Bạn không có quyền xóa lịch của nhân viên.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authorization token not found. Please log in.');
        return;
      }

      await axios.post(
        'http://localhost:3001/api/schedules/remove',
        {
          day,
          start_time: slot.start,
          end_time: slot.end,
          accountId: employee.AccountID,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refetch schedules after successful removal
      const response = await axios.get('http://localhost:3001/api/schedules', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('Xóa lịch cho nhân viên thành công.');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error removing employee:', error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Error removing employee');
      }
    }
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      fixed: 'left',
      render: (text) => <strong>{text}</strong>,
      className: 'sticky left-0 bg-white',
    },
    ...days.map((day) => ({
      title: day,
      dataIndex: day,
      key: day,
      render: (text, record) =>
        text && text.length > 0 ? (
          text.map((employee, index) => (
            <div
              key={index}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              className={employee.AccountID === accountID ? 'bg-yellow-200' : ''}
            >
              <div>{employee.fullname} ({employee.role})</div>
              {roleOfUser === 'Store Manager' && (
                <Button type="link" onClick={() => handleRemoveEmployee(day, { start: record.key, end: record.time.split(' - ')[1] }, employee)}>
                  Remove
                </Button>
              )}
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
    if (roleOfUser !== 'Store Manager') {
      message.error('Bạn không có quyền lập lịch cho nhân viên.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authorization token not found. Please log in.');
        return;
      }

      const { day, timeSlot, fullname } = values;
      const [start_time, end_time] = timeSlot.split(' - ');
      const accountId = selectedUser ? selectedUser.AccountID : null;

      await axios.post(
        'http://localhost:3001/api/schedules/assign',
        {
          day,
          slots: [{ start_time, end_time }],
          accountId,
          fullname,
          role: roleOfEmp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refetch schedules after successful assignment
      const response = await axios.get('http://localhost:3001/api/schedules', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('Lập lịch cho nhân viên thành công.');
      setSchedules(response.data);
      setIsModalVisible(false);
      form.resetFields();
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
    setRoleOfEmp(user ? user.role : '');
    form.setFieldsValue({ AccountID: user ? user.AccountID : '', role: user ? user.role : '' });
  };

  return (
    <div className="w-11/12 mx-auto mt-12 py-10">
      <Title level={2} className="text-center text-red-500 mb-6">
        Lịch làm việc của nhân viên
      </Title>
      {roleOfUser === 'Store Manager' && (
        <Button type="primary" onClick={() => setIsModalVisible(true)} className="mb-6 float-right">
          Schedule Employee
        </Button>
      )}
      <Table columns={columns} dataSource={data} bordered pagination={false} scroll={{ x: 'max-content' }} />
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
                <Option key={user.AccountID} value={user.fullname}>
                  {user.fullname}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Select disabled>
              <Option value={roleOfEmp}>{roleOfEmp}</Option>
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
