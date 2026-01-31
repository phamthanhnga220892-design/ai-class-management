export class CommentWithRepliesDto {
    _id: string;
    user: {
        _id: string;
        fullName: string;
    };
    content: string;
    parentId: string | null;
    createdAt: Date;
    replies?: CommentWithRepliesDto[];
}

export class SessionCommentsResponseDto {
    session: {
        _id: string;
        title: string;
    };
    comments: CommentWithRepliesDto[];
    totalComments: number;
}
