'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Session, Class, Course } from '@/types';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

/** Strip HTML tags and decode HTML entities for plain-text preview */
function stripHtml(html: string): string {
    if (!html) return '';
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '');
    // Decode common HTML entities
    const entities: Record<string, string> = {
        '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>',
        '&quot;': '"', '&#39;': "'", '&apos;': "'",
    };
    for (const [entity, char] of Object.entries(entities)) {
        text = text.split(entity).join(char);
    }
    // Decode numeric entities like &#160;
    text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
    // Collapse multiple spaces
    text = text.replace(/\s+/g, ' ').trim();
    return text;
}

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
        // Guard: skip API calls if not authenticated (layout will redirect to /login)
        if (!localStorage.getItem('access_token')) return;
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
        // Guard: skip API calls if not authenticated (layout will redirect to /login)
        if (!localStorage.getItem('access_token')) return;
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

    const [attachmentSession, setAttachmentSession] = useState<Session | null>(null);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Triggered handleFileUpload with files:", e.target.files);
        if (!attachmentSession || !e.target.files?.length) {
             console.log("Exited early because no session or no files.");
             return;
        }
        const file = e.target.files[0];
        console.log("Selected file:", file.name, "Size:", file.size);
        
        // max size 50MB
        if (file.size > 50 * 1024 * 1024) {
            alert('File quá lớn, dung lượng tối đa là 50MB');
            return;
        }

        try {
            setUploadingAttachment(true);
            const formData = new FormData();
            formData.append('file', file);
            
            await api.uploadAttachment(attachmentSession._id, formData);
            // Reload sessions to get updated attachments
            await loadSessions();
            
            // Also update the local state for the modal
            const updatedSessions = await api.getSessions(selectedClassId) as Session[];
            const updated = updatedSessions.find(s => s._id === attachmentSession._id);
            if (updated) setAttachmentSession(updated);
            
        } catch (error) {
            console.error('Failed to upload file:', error);
            alert('Có lỗi xảy ra khi tải lên: ' + (error as any).message);
        } finally {
            setUploadingAttachment(false);
            if (e.target) e.target.value = ''; // reset input
        }
    };

    const handleDeleteAttachment = async (sessionId: string, publicId: string) => {
        if (!confirm('Bạn có chắc muốn xoá file này?')) return;
        try {
            setActionLoading(true);
            await api.deleteAttachment(sessionId, publicId);
            await loadSessions();
            
            // local update
            const updatedSessions = await api.getSessions(selectedClassId) as Session[];
            const updated = updatedSessions.find(s => s._id === attachmentSession?._id);
            if (updated) setAttachmentSession(updated);
        } catch (error) {
            console.error('Failed to delete file:', error);
            alert('Có lỗi xảy ra khi xoá file');
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
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                                    {session.orderIndex}
                                                </span>
                                                <h4 className="font-semibold text-foreground truncate">{session.title}</h4>
                                            </div>
                                            <div className="ml-11 space-y-1">
                                                <p className="text-sm text-muted-foreground line-clamp-2 break-all">
                                                    {stripHtml(session.content)}
                                                </p>
                                                {session.videoUrl && (
                                                    <p className="text-xs text-blue-500 truncate">
                                                        🎥 {session.videoUrl}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => setAttachmentSession(session)}
                                                disabled={actionLoading}
                                                className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                                            >
                                                Tệp
                                                {session.attachments?.length ? (
                                                    <span className="bg-white text-green-600 text-xs rounded-full px-2 py-0.5 ml-1 font-bold">
                                                        {session.attachments.length}
                                                    </span>
                                                ) : null}
                                            </button>
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
                    <div className="bg-card border border-border rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
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
                                <div className="rounded-lg border border-border overflow-hidden">
                                    <RichTextEditor
                                        value={formData.content}
                                        onChange={(value) => setFormData({ ...formData, content: value })}
                                        placeholder="Nhập nội dung bài học..."
                                        minHeight="260px"
                                    />
                                </div>
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

            {/* Attachment Modal */}
            {attachmentSession && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">
                                Quản lý Tệp Đính Kèm - {attachmentSession.title}
                            </h3>
                            <button
                                onClick={() => setAttachmentSession(null)}
                                className="text-muted-foreground hover:text-foreground text-xl leading-none"
                            >
                                &times;
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto mb-6 pr-2">
                            {(!attachmentSession.attachments || attachmentSession.attachments.length === 0) ? (
                                <p className="text-center text-muted-foreground py-8">Chưa có tệp đính kèm nào.</p>
                            ) : (
                                <div className="space-y-3">
                                    {attachmentSession.attachments.map(att => (
                                        <div key={att.publicId} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="h-10 w-10 shrink-0 bg-primary/10 text-primary rounded flex items-center justify-center text-xs font-bold">
                                                    {att.mimetype.split('/')[1]?.substring(0, 4).toUpperCase() || 'FILE'}
                                                </div>
                                                <div className="min-w-0">
                                                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-500 hover:underline truncate block">
                                                        {att.filename}
                                                    </a>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(att.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAttachment(attachmentSession._id, att.publicId)}
                                                disabled={actionLoading}
                                                className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="pt-4 border-t border-border">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileUpload}
                                disabled={uploadingAttachment}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAttachment}
                                className={`w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 text-primary text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    uploadingAttachment ? '' : 'hover:bg-primary/10 cursor-pointer'
                                }`}
                            >
                                {uploadingAttachment ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                        <span>Đang tải lên...</span>
                                    </>
                                ) : (
                                    <span>📎 Click để chọn file (Tối đa 50MB)</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
