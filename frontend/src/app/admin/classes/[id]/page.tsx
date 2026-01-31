'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { StudentList } from '@/components/admin/StudentList';
import { SessionList } from '@/components/admin/SessionList';

export default function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = React.use(params);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.getClassDetails(unwrappedParams.id);
                setData(response);
            } catch (err: any) {
                console.error('Error fetching class details:', err);
                setError(err.message || 'Failed to load class details');
            } finally {
                setLoading(false);
            }
        };

        if (unwrappedParams.id) {
            fetchData();
        }
    }, [unwrappedParams.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    Error: {error}
                </div>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                    &larr; Quay lại
                </button>
            </div>
        );
    }

    if (!data) return null;

    const { class: classInfo, students, sessions, totalStudents } = data;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
                    >
                        &larr; Quay lại danh sách
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">{classInfo.name}</h1>
                    <p className="text-gray-500 mt-1">
                        {classInfo.course.name} • {classInfo.mentorName}
                    </p>
                </div>
                <div className="flex gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${classInfo.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                        classInfo.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {classInfo.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Student List */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Thông tin chung</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Ngày bắt đầu:</span>
                                <span className="font-medium">
                                    {new Date(classInfo.startDate).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Sĩ số:</span>
                                <span className="font-medium text-blue-600">{totalStudents} học viên</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Bài học:</span>
                                <span className="font-medium">{sessions.length} bài</span>
                            </div>
                        </div>
                    </div>

                    <StudentList students={students} />
                </div>

                {/* Right Column: Sessions & Comments */}
                <div className="lg:col-span-2">
                    <SessionList sessions={sessions} />
                </div>
            </div>
        </div>
    );
}
