'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Class, Session, Comment, Course, User } from '@/types';
import { decodeHtmlEntities } from '@/lib/decode-html';

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const classId = params.classId as string;

    const [classData, setClassData] = useState<Class | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSession, setCurrentSession] = useState<Session | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [classId]);

    useEffect(() => {
        if (currentSession) {
            loadComments();
        }
    }, [currentSession]);

    const loadData = async () => {
        try {
            setLoading(true);
            console.log('🔍 Loading data for classId:', classId);
            const [classInfo, sessionsRes] = await Promise.all([
                api.getClass(classId),
                api.getSessions(classId),
            ]);

            const sessionsData = sessionsRes as Session[];
            console.log('📚 Class info:', classInfo);
            console.log('📝 Sessions data:', sessionsData);

            setClassData(classInfo as Class);
            setSessions(sessionsData);
            if (sessionsData.length > 0) {
                setCurrentSession(sessionsData[0]);
                console.log('✅ Set current session:', sessionsData[0]);
            } else {
                console.warn('⚠️ No sessions found for this class');
            }
        } catch (error: any) {
            console.error('❌ Failed to load data:', error);
            if (error.status === 403) {
                alert('Bạn chưa được duyệt vào lớp này');
                router.push('/courses');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        if (!currentSession) return;
        try {
            const data = await api.getComments(currentSession._id);
            setComments(data as Comment[]);
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentSession) return;

        try {
            setCommentLoading(true);
            await api.createComment(currentSession._id, newComment);
            setNewComment('');
            await loadComments();
        } catch (error) {
            console.error('Failed to post comment:', error);
            alert('Có lỗi khi đăng comment');
        } finally {
            setCommentLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const courseName = classData ? (classData.course as Course).title : '';

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar - Sessions List */}
            <aside className="w-80 border-r border-border bg-card/50 overflow-y-auto">
                <div className="p-6 border-b border-border">
                    <h2 className="font-bold text-lg text-foreground">{classData?.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{courseName}</p>
                </div>
                <nav className="p-4 space-y-2">
                    {sessions.map((session) => (
                        <button
                            key={session._id}
                            onClick={() => setCurrentSession(session)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${currentSession?._id === session._id
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'hover:bg-muted text-foreground'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                    {session.orderIndex}
                                </span>
                                <span className="font-medium text-sm">{decodeHtmlEntities(session.title)}</span>
                            </div>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {currentSession ? (
                    <div className="max-w-4xl mx-auto p-8">
                        {/* Session Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-foreground mb-2">{decodeHtmlEntities(currentSession.title)}</h1>
                        </div>

                        {/* Video Player */}
                        {currentSession.videoUrl && (
                            <div className="mb-8 bg-black rounded-xl overflow-hidden aspect-video">
                                <iframe
                                    src={currentSession.videoUrl.replace('watch?v=', 'embed/')}
                                    className="w-full h-full"
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="rich-content max-w-none mb-12 text-foreground"
                            dangerouslySetInnerHTML={{ __html: decodeHtmlEntities(currentSession.content) }}
                        />

                        {/* Attachments Section */}
                        {(currentSession.attachments && currentSession.attachments.length > 0) && (
                            <div className="mb-12">
                                <h3 className="text-xl font-bold text-foreground mb-4">Tài liệu đính kèm</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {currentSession.attachments.map(att => (
                                        <a
                                            key={att.publicId}
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center p-4 bg-card rounded-xl border border-border hover:border-primary transition-colors group"
                                        >
                                            <div className="h-10 w-10 shrink-0 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-xs mr-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                {att.mimetype.split('/')[1]?.substring(0, 4).toUpperCase() || 'FILE'}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                                    {att.filename}
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {(att.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="border-t border-border pt-8">
                            <h3 className="text-xl font-bold text-foreground mb-6">Thảo luận ({comments.length})</h3>

                            {/* Comment Form */}
                            <form onSubmit={handlePostComment} className="mb-8">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Viết câu hỏi hoặc chia sẻ suy nghĩ của bạn..."
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                    rows={3}
                                />
                                <button
                                    type="submit"
                                    disabled={commentLoading || !newComment.trim()}
                                    className="mt-3 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {commentLoading ? 'Đang đăng...' : 'Đăng comment'}
                                </button>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-6">
                                {comments.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        Chưa có comment nào. Hãy là người đầu tiên!
                                    </p>
                                ) : (
                                    comments.map((comment) => {
                                        const user = comment.user as User;
                                        return (
                                            <div key={comment._id} className="flex gap-4">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {user.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="bg-muted rounded-lg p-4">
                                                        <div className="font-semibold text-foreground mb-1">{user.fullName}</div>
                                                        <p className="text-foreground">{comment.content}</p>
                                                    </div>
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        {new Date(comment.createdAt).toLocaleString('vi-VN')}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Chọn một bài học để bắt đầu
                    </div>
                )}
            </main>
        </div>
    );
}
