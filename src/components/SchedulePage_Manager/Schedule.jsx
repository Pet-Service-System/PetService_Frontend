import React from 'react';

const Schedule = () => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const dailyWorkHours = ['7:00 AM - 10:00 AM', '10:00 AM - 1:00 PM', '1:00 PM - 4:00 PM', '4:00 PM - 7:00 PM', '7:00 PM - 9:00 PM'];

    const workSchedule = {
        Monday: ['John', 'Doe', 'Smith', 'Taylor', 'Brown'],
        Tuesday: ['Jane', 'Smith', 'Taylor', 'Brown', 'Wilson'],
        Wednesday: ['David', 'Taylor', 'Brown', 'Wilson', 'Martinez'],
        Thursday: ['Emma', 'Brown', 'Wilson', 'Martinez', 'Anderson'],
        Friday: ['Michael', 'Wilson', 'Martinez', 'Anderson', 'Thomas'],
        Saturday: ['Olivia', 'Martinez', 'Anderson', 'Thomas', 'Hernandez'],
        Sunday: ['Sophia', 'Anderson', 'Thomas', 'Hernandez', 'White'],
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
                        {dailyWorkHours.map((hour) => (
                            <tr key={hour}>
                                <td className="border px-4 py-2">{hour}</td>
                                {daysOfWeek.map((day) => (
                                    <td key={`${day}-${hour}`} className="border px-4 py-2">{workSchedule[day][dailyWorkHours.indexOf(hour)]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Schedule;
