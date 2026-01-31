import React from 'react';

interface User {
    _id: string;
    fullName: string;
}

export interface Comment {
    _id: string;
    user: User;
    content: string;
    parentId: string | null;
    createdAt: string;
    replies?: Comment[];
}

interface CommentThreadProps {
    comments: Comment[];
    depth?: number;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ comments, depth = 0 }) => {
    if (!comments || comments.length === 0) return null;

    return (
        <div className={`flex flex-col gap-4 ${depth > 0 ? 'ml-8 mt-4 border-l-2 border-gray-100 pl-4' : ''}`}>
            {comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-blue-600">{comment.user.fullName}</span>
                        <span className="text-xs text-gray-400">
                            {new Date(comment.createdAt).toLocaleString('vi-VN')}
                        </span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>

                    {comment.replies && comment.replies.length > 0 && (
                        <CommentThread comments={comment.replies} depth={depth + 1} />
                    )}
                </div>
            ))}
        </div>
    );
};
