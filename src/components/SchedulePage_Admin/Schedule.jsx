import React, { useState } from 'react';

const Schedule = () => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dailyWorkHours = ['7:00 AM - 10:00 AM', '10:00 AM - 1:00 PM', '1:00 PM - 4:00 PM', '4:00 PM - 7:00 PM', '7:00 PM - 9:00 PM'];

    const employees = ['John', 'Doe', 'Smith', 'Taylor', 'Brown', 'Jane', 'Wilson', 'David', 'Martinez', 'Emma', 'Anderson', 'Michael', 'Thomas', 'Olivia', 'Hernandez', 'Sophia', 'White'];

    const initialWorkSchedule = {
        Monday: ['John', 'Doe', 'Smith', 'Taylor', 'Brown'],
        Tuesday: ['Jane', 'Smith', 'Taylor', 'Brown', 'Wilson'],
        Wednesday: ['David', 'Taylor', 'Brown', 'Wilson', 'Martinez'],
        Thursday: ['Emma', 'Brown', 'Wilson', 'Martinez', 'Anderson'],
        Friday: ['Michael', 'Wilson', 'Martinez', 'Anderson', 'Thomas'],
        Saturday: ['Olivia', 'Martinez', 'Anderson', 'Thomas', 'Hernandez'],
        Sunday: ['Sophia', 'Anderson', 'Thomas', 'Hernandez', 'White'],
    };

    const [workSchedule, setWorkSchedule] = useState(initialWorkSchedule);
    const [editMode, setEditMode] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState('');

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleSave = () => {
        setEditMode(false);
    };

    const handleCancel = () => {
        setEditMode(false);
    };

    const handleChange = (day, hourIndex, employee) => {
        const updatedSchedule = { ...workSchedule };
        updatedSchedule[day][hourIndex] = employee;
        setWorkSchedule(updatedSchedule);
    };

    return (
        <div className="schedule p-24 overflow-x-auto">
            <h2 className="text-5xl text-center text-red-500 font-semibold mb-6">Lịch làm việc của nhân viên</h2>
            <div className="max-w-full overflow-x-auto">
                <table className="border-collapse border border-gray-300 w-full">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Thời gian</th>
                            {daysOfWeek.map((day) => (
                                <th key={day} className="border px-4 py-2">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dailyWorkHours.map((hour, hourIndex) => (
                            <tr key={hour}>
                                <td className="border px-4 py-2">{hour}</td>
                                {daysOfWeek.map((day) => (
                                    <td key={`${day}-${hour}`} className="border px-4 py-2">
                                        {editMode ? (
                                            <select
                                                value={workSchedule[day][hourIndex]}
                                                onChange={(e) => handleChange(day, hourIndex, e.target.value)}
                                                className="p-2 bg-gray-200 rounded-md w-full"
                                            >
                                                {employees.map((employee) => (
                                                    <option key={employee} value={employee}>{employee}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span>{workSchedule[day][hourIndex]}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* {editMode ? (
                    <div className="flex justify-end mt-4">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={handleSave}>Lưu</button>
                        <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={handleCancel}>Hủy</button>
                    </div>
                ) : (
                    <div className="flex justify-end mt-4">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleEdit}>Cập nhật</button>
                    </div>
                )} */}
            </div>
        </div>
    );
}

export default Schedule;
