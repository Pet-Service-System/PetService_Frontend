import { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Typography, Button, Modal, Form, Select, message } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { Option } = Select;
const API_URL = import.meta.env.REACT_APP_API_URL;

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleOfEmp, setRoleOfEmp] = useState('');
  const [roleOfUser] = useState(localStorage.getItem('role'));
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [accountID] = useState(user.id);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          message.error(t('authorization_token_not_found'));
          return;
        }

        const response = await axios.get(`${API_URL}/api/schedules`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSchedules(response.data);
      } catch (error) {
        console.error(t('error_fetching_schedules'), error);
        message.error(t('error_fetching_schedules'));
      }
    };

    fetchSchedules();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/accounts/role`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Users fetched:', response.data.accounts);
        setUsers(response.data.accounts);
      } catch (error) {
        console.error(t('error_fetching_users'), error);
        message.error(t('error_fetching_users'));
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
      message.error(t('no_permission_remove_schedule'));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error(t('authorization_token_not_found'));
        return;
      }

      await axios.post(
        `${API_URL}/api/schedules/remove`,
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
      const response = await axios.get(`${API_URL}/api/schedules`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success(t('remove_schedule_success'));
      setSchedules(response.data);
    } catch (error) {
      console.error(t('error_removing_employee'), error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error(t('error_removing_employee'));
      }
    }
  };

  const columns = [
    {
      title: t('time'),
      dataIndex: 'time',
      key: 'time',
      fixed: 'left',
      render: (text) => <strong>{text}</strong>,
      className: 'sticky left-0 bg-white',
    },
    ...days.map((day) => ({
      title: t(day.toLowerCase()),
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
                  {t('remove')}
                </Button>
              )}
            </div>
          ))
        ) : (
          <div>{t('no_employees')}</div>
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
      message.error(t('no_permission_schedule_employee'));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error(t('authorization_token_not_found'));
        return;
      }

      const { day, timeSlot, fullname } = values;
      const [start_time, end_time] = timeSlot.split(' - ');
      const accountId = selectedUser ? selectedUser.AccountID : null;
      setSaving(true)
      await axios.post(
        `${API_URL}/api/schedules/assign`,
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
      const response = await axios.get(`${API_URL}/api/schedules`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success(t('schedule_employee_success'));
      setSchedules(response.data);
      setSaving(false)
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error(t('error_scheduling_employee'), error);
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
      } else {
        message.error(t('error_scheduling_employee'));
      }
      setSaving(false)
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
        {t('employee_schedule')}
      </Title>
      {roleOfUser === 'Store Manager' && (
        <Button type="primary" onClick={() => setIsModalVisible(true)} className="mb-6 float-right">
          {t('schedule_employee')}
        </Button>
      )}
      <Table columns={columns} dataSource={data} bordered pagination={false} scroll={{ x: 'max-content' }} />
      {/* Schedule employee modal */}
      <Modal
        title={t('schedule_employee')}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSchedule}>
          <Form.Item name="day" label={t('day')} rules={[{ required: true, message: t('please_select_day') }]}>
            <Select placeholder={t('select_day')}>
              {days.map((day) => (
                <Option key={day} value={day}>
                  {day}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="timeSlot" label={t('time_slot')} rules={[{ required: true, message: t('please_select_time_slot') }]}>
            <Select placeholder={t('select_time_slot')}>
              {timeSlots.map((slot) => (
                <Option key={`${slot.start} - ${slot.end}`} value={`${slot.start} - ${slot.end}`}>
                  {slot.start} - {slot.end}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="fullname" label={t('full_name')} rules={[{ required: true, message: t('please_select_full_name') }]}>
            <Select placeholder={t('select_full_name')} onChange={handleFullnameChange}>
              {users.map((user) => (
                <Option key={user.AccountID} value={user.fullname}>
                  {user.fullname}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="role" label={t('role')}>
            <Select disabled>
              <Option value={roleOfEmp}>{roleOfEmp}</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="float-right" disabled={saving}>
              {t('submit')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Schedule;
