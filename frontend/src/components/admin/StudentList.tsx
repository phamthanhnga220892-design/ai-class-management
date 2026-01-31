import React, { useState } from 'react';

interface Student {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    registeredAt: string;
}

interface StudentListProps {
    students: Student[];
}

export const StudentList: React.FC<StudentListProps> = ({ students }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm)
    );

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Danh sách học viên ({students.length})</h3>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email, sđt..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <tr key={student._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{student.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {new Date(student.registeredAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                    Không tìm thấy học viên nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
