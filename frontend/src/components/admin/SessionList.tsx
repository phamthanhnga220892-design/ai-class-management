import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Comment, CommentThread } from './CommentThread';

interface Session {
    _id: string;
    title: string;
    orderIndex: number;
    commentCount: number;
    createdAt: string;
}

interface SessionListProps {
    sessions: Session[];
}

export const SessionList: React.FC<SessionListProps> = ({ sessions }) => {
    const [expandedSession, setExpandedSession] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

    const toggleSession = async (sessionId: string) => {
        if (expandedSession === sessionId) {
            setExpandedSession(null);
            return;
        }

        setExpandedSession(sessionId);

        // Fetch comments if not already loaded
        if (!comments[sessionId]) {
            setLoadingComments(prev => ({ ...prev, [sessionId]: true }));
            try {
                const response = await api.getSessionComments(sessionId) as any;
                setComments(prev => ({ ...prev, [sessionId]: response.comments }));
            } catch (error) {
                console.error('Failed to load comments', error);
            } finally {
                setLoadingComments(prev => ({ ...prev, [sessionId]: false }));
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Danh sách bài học ({sessions.length})</h3>

            <div className="space-y-4">
                {sessions.map((session) => (
                    <div key={session._id} className="border rounded-lg overflow-hidden">
                        <div
                            className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleSession(session._id)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 font-bold rounded-full text-sm">
                                    {session.orderIndex}
                                </span>
                                <h4 className="font-medium">{session.title}</h4>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                    {session.commentCount} thảo luận
                                </span>
                                <svg
                                    className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedSession === session._id ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {expandedSession === session._id && (
                            <div className="p-4 bg-white border-t">
                                {loadingComments[session._id] ? (
                                    <div className="text-center py-4 text-gray-500">Đang tải thảo luận...</div>
                                ) : (
                                    <>
                                        {comments[session._id] && comments[session._id].length > 0 ? (
                                            <CommentThread comments={comments[session._id]} />
                                        ) : (
                                            <div className="text-center py-4 text-gray-500 italic">
                                                Chưa có thảo luận nào
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
