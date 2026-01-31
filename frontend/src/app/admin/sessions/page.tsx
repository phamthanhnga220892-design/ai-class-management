'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Session, Class, Course } from '@/types';

export default function AdminSessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        videoUrl: '',
        orderIndex: 1,
    });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            loadSessions();
        }
    }, [selectedClassId]);

    const loadClasses = async () => {
        try {
            setLoading(true);
            const data = await api.getClasses() as Class[];
            setClasses(data);
            if (data.length > 0) {
                setSelectedClassId(data[0]._id);
            }
        } catch (error) {
            console.error('Failed to load classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSessions = async () => {
        try {
            setLoading(true);
            console.log('🔄 Loading sessions for class:', selectedClassId);
            const data = await api.getSessions(selectedClassId) as Session[];
            console.log('📚 Loaded sessions:', data);
            console.log('📊 Sessions count:', data.length);
            setSessions(data);
        } catch (error) {
            console.error('❌ Failed to load sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingSession(null);
        const nextOrder = sessions.length > 0 ? Math.max(...sessions.map(s => s.orderIndex)) + 1 : 1;
        setFormData({
            title: '',
            content: '',
            videoUrl: '',
            orderIndex: nextOrder,
        });
        setModalOpen(true);
    };

    const openEditModal = (session: Session) => {
        setEditingSession(session);
        setFormData({
            title: session.title,
            content: session.content,
            videoUrl: session.videoUrl || '',
            orderIndex: session.orderIndex,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClassId) return;

        try {
            setActionLoading(true);
            console.log('📝 Submitting session...', { editingSession, selectedClassId, formData });

            if (editingSession) {
                console.log('✏️ Updating session:', editingSession._id);
                await api.updateSession(editingSession._id, formData);
            } else {
                console.log('➕ Creating new session for class:', selectedClassId);
                const payload = {
                    classId: selectedClassId,
                    ...formData,
                };
                console.log('📦 Payload:', payload);
                const result = await api.createSession(payload);
                console.log('✅ Session created:', result);
            }
            setModalOpen(false);
            await loadSessions();
        } catch (error) {
            console.error('❌ Failed to save session:', error);
            alert('Có lỗi xảy ra khi lưu bài học: ' + (error as any).message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa bài học này?')) return;

        try {
            setActionLoading(true);
            await api.deleteSession(id);
            await loadSessions();
        } catch (error) {
            console.error('Failed to delete session:', error);
            alert('Có lỗi xảy ra khi xóa bài học');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && classes.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const selectedClass = classes.find(c => c._id === selectedClassId);
    const courseName = selectedClass ? (selectedClass.course as Course).title : '';

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Bài học</h1>
                <p className="text-muted-foreground">Tạo và quản lý nội dung bài học cho từng lớp</p>
            </div>

            {/* Class Selector */}
            <div className="mb-6 flex gap-4 items-center">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Chọn lớp học
                    </label>
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {classes.map((classData) => {
                            const courseData = classData.course as Course;
                            return (
                                <option key={classData._id} value={classData._id}>
                                    {classData.name} - {courseData.title}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <button
                    onClick={openCreateModal}
                    disabled={!selectedClassId}
                    className="mt-7 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    + Thêm bài học
                </button>
            </div>

            {/* Sessions List */}
            {selectedClassId && (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border bg-muted/30">
                        <h3 className="font-semibold text-foreground">
                            Danh sách bài học - {selectedClass?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Khóa học: {courseName}
                        </p>
                    </div>
                    <div className="divide-y divide-border">
                        {loading ? (
                            <div className="px-6 py-12 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="px-6 py-12 text-center text-muted-foreground">
                                Chưa có bài học nào. Hãy thêm bài học đầu tiên!
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div key={session._id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                                    {session.orderIndex}
                                                </span>
                                                <h4 className="font-semibold text-foreground">{session.title}</h4>
                                            </div>
                                            <div className="ml-11 space-y-1">
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {session.content.replace(/<[^>]*>/g, '')}
                                                </p>
                                                {session.videoUrl && (
                                                    <p className="text-xs text-blue-500">
                                                        🎥 {session.videoUrl}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => openEditModal(session)}
                                                disabled={actionLoading}
                                                className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(session._id)}
                                                disabled={actionLoading}
                                                className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-foreground mb-6">
                            {editingSession ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Tiêu đề bài học *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="Ví dụ: Bài 1: Giới thiệu về AI"
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Nội dung bài học *
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    required
                                    placeholder="Nhập nội dung bài học (hỗ trợ HTML)"
                                    rows={8}
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Bạn có thể sử dụng HTML tags như &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Video URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.videoUrl}
                                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Thứ tự bài học *
                                </label>
                                <input
                                    type="number"
                                    value={formData.orderIndex}
                                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                                    required
                                    min="1"
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? 'Đang lưu...' : (editingSession ? 'Cập nhật' : 'Thêm bài học')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
