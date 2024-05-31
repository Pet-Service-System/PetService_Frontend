import { useEffect, useState } from 'react';
import { getSchedule } from '../../apis/ApiScheduel';

const Schedule = () => {
    const [scheduleData, setScheduleData] = useState([]); // Dữ liệu lịch ban đầu từ API
    const [workSchedule, setWorkSchedule] = useState({}); // Lịch làm việc của nhân viên
    const [editMode, setEditMode] = useState(false); // Chế độ chỉnh sửa
    // Các state để render các cột và dòng trên trang
    const [daysOfWeek, setDaysOfWeek] = useState([]); 
    const [dailyWorkHours, setDailyWorkHours] = useState([]); 
    const [employees, setEmployees] = useState([]); 
    useEffect(() => {
        // Gọi API để lấy dữ liệu lịch
        getSchedule().then((data) => {
            // Lưu dữ liệu lịch vào trạng thái
            setScheduleData(data);
            const initialSchedule = {};
            // Dùng set tránh trùng lặp dữ liệu
            const days = new Set();
            const hours = new Set();
            const employeeSet = new Set();

            // Xử lý dữ liệu lịch để tạo ra lịch làm việc, ngày trong tuần, giờ làm việc và danh sách nhân viên
            data.forEach((item) => {
                const { days_of_week, daily_work_hours, staff } = item;
                if (!initialSchedule[days_of_week]) { // Kiểm tra xem thứ trong tuần đã tồn tại chưa
                    initialSchedule[days_of_week] = {}; // Nếu chưa thì tạo mới
                }
                // Gán staff vào ngày giờ làm việc vào đối tượng initialSchedule
                initialSchedule[days_of_week][daily_work_hours] = staff;
                // Thêm staff, ngày, giờ vào các set
                days.add(days_of_week);
                hours.add(daily_work_hours);
                employeeSet.add(staff);
            });

            // Cập nhật trạng thái với dữ liệu đã được xử lý
            setWorkSchedule(initialSchedule);
            setDaysOfWeek(Array.from(days));
            setDailyWorkHours(Array.from(hours));
            setEmployees(Array.from(employeeSet));
        });
    }, []);

    // Hàm xử lý khi nhấn nút chỉnh sửa
    const handleEdit = () => {
        setEditMode(true);
    };

    // Hàm xử lý khi nhấn nút lưu
    const handleSave = () => {
        setEditMode(false);
    };

    // Hàm xử lý khi nhấn nút hủy
    const handleCancel = () => {
        setEditMode(false);
        // Khôi phục lại lịch làm việc ban đầu
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

    // Hàm xử lý khi thay đổi lịch làm việc
    const handleChange = (day, hour, employee) => {
        const updatedSchedule = { ...workSchedule };
        // if (!updatedSchedule[day]) {
        //     updatedSchedule[day] = {};
        // }
        updatedSchedule[day][hour] = employee;
        setWorkSchedule(updatedSchedule);
    };

    return (
        <div className="schedule p-24 overflow-x-auto">
            {/* Tiêu đề */}
            <h2 className="text-5xl text-center text-red-500 font-semibold mb-6">Lịch làm việc của nhân viên</h2>
            <div className="max-w-full overflow-x-auto">
                {/* Bảng hiển thị lịch làm việc */}
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
                        {dailyWorkHours.map((hour) => (
                            <tr key={hour}>
                                <td className="border px-4 py-2">{hour}</td>
                                {daysOfWeek.map((day) => (
                                    <td key={`${day}-${hour}`} className="border px-4 py-2">
                                        {editMode ? (
                                            <select
                                                value={workSchedule[day][hour] || ''}
                                                onChange={(e) => handleChange(day, hour, e.target.value)}
                                                className="p-2 bg-gray-200 rounded-md w-full"
                                            >
                                                {employees.map((employee) => (
                                                    <option key={employee} value={employee}>{employee}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span>{workSchedule[day][hour]}</span>
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Các nút chỉnh sửa và lưu */}
                {editMode ? (
                    <div className="flex justify-end mt-4">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" onClick={handleSave}>Lưu</button>
                        <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={handleCancel}>Hủy</button>
                    </div>
                ) : (
                    <div className="flex justify-end mt-4">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleEdit}>Cập nhật</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedule;
