import React, { useEffect, useState } from 'react';
import { getSchedule } from '../../apis/ApiScheduel';
import { Table, Select, Button, Typography } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const Schedule = () => {
    const [scheduleData, setScheduleData] = useState([]);
    const [workSchedule, setWorkSchedule] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [daysOfWeek, setDaysOfWeek] = useState([]);
    const [dailyWorkHours, setDailyWorkHours] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [role, setRole] = useState(localStorage.getItem('role'))

    useEffect(() => {
        getSchedule().then((data) => {
            setScheduleData(data);
            const initialSchedule = {};
            const days = new Set();
            const hours = new Set();
            const employeeSet = new Set();

            data.forEach((item) => {
                const { days_of_week, daily_work_hours, staff } = item;
                if (!initialSchedule[days_of_week]) {
                    initialSchedule[days_of_week] = {};
                }
                initialSchedule[days_of_week][daily_work_hours] = staff;
                days.add(days_of_week);
                hours.add(daily_work_hours);
                employeeSet.add(staff);
            });

            setWorkSchedule(initialSchedule);
            setDaysOfWeek(Array.from(days));
            setDailyWorkHours(Array.from(hours));
            setEmployees(Array.from(employeeSet));
        });
    }, []);

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleSave = () => {
        setEditMode(false);
    };

    const handleCancel = () => {
        setEditMode(false);
        const initialSchedule = {};
        scheduleData.forEach((item) => {
            const { days_of_week, daily_work_hours, staff } = item;
            if (!initialSchedule[days_of_week]) {
                initialSchedule[days_of_week] = {};
            }
            initialSchedule[days_of_week][daily_work_hours] = staff;
        });
        setWorkSchedule(initialSchedule);
    };

    const handleChange = (day, hour, employee) => {
        const updatedSchedule = { ...workSchedule };
        updatedSchedule[day][hour] = employee;
        setWorkSchedule(updatedSchedule);
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'hour',
            key: 'hour',
            render: (text) => <strong>{text}</strong>,
        },
        ...daysOfWeek.map((day) => ({
            title: day,
            dataIndex: day,
            key: day,
            render: (text, record) => (
                editMode ? (
                    <Select
                        value={workSchedule[day][record.hour] || ''}
                        onChange={(value) => handleChange(day, record.hour, value)}
                        style={{ width: '100%' }}
                    >
                        {employees.map((employee) => (
                            <Option key={employee} value={employee}>
                                {employee}
                            </Option>
                        ))}
                    </Select>
                ) : (
                    <span>{workSchedule[day][record.hour]}</span>
                )
            ),
        })),
    ];

    const data = dailyWorkHours.map((hour) => {
        const rowData = { key: hour, hour };
        daysOfWeek.forEach((day) => {
            rowData[day] = workSchedule[day] ? workSchedule[day][hour] : '';
        });
        return rowData;
    });

    return (
        <div className="schedule p-24 overflow-x-auto">
            <Title level={2} className="text-center text-red-500 mb-6">
                Lịch làm việc của nhân viên
            </Title>
            <Table
                columns={columns}
                dataSource={data}
                bordered
                pagination={false}
                scroll={{ x: 'max-content' }}
            />
            <div className="flex justify-end mt-4">
                {editMode ? (
                    <>
                        <Button type="primary" onClick={handleSave} className="mr-2">
                            Lưu
                        </Button>
                        <Button onClick={handleCancel}>
                            Hủy
                        </Button>
                    </>
                ) : (
                    role === 'store manager' && (
                        <Button type="primary" onClick={handleEdit}>
                            Cập nhật
                        </Button>
                    )
                )}
            </div>
        </div>
    );
};

export default Schedule;
