import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    ) { }

    async create(userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
        const commentData: any = {
            session: createCommentDto.sessionId,
            user: userId,
            content: createCommentDto.content,
        };

        if (createCommentDto.parentId) {
            commentData.parent = createCommentDto.parentId;
        }

        const createdComment = new this.commentModel(commentData);
        const saved = await createdComment.save();

        // Populate user info for response
        const populated = await this.commentModel
            .findById(saved._id)
            .populate('user', 'fullName email')
            .populate('parent')
            .lean()
            .exec();

        return populated as any;
    }

    async findBySession(sessionId: string): Promise<Comment[]> {
        return this.commentModel
            .find({ session: sessionId } as any)
            .populate('user', 'fullName email')
            .populate('parent')
            .sort({ createdAt: -1 })
            .lean()
            .exec() as any;
    }

    async delete(commentId: string, userId: string, isAdmin: boolean): Promise<void> {
        const comment = await this.commentModel.findById(commentId).exec();

        if (!comment) {
            throw new NotFoundException(`Comment with ID ${commentId} not found`);
        }

        // Only comment owner or admin can delete
        if (comment.user.toString() !== userId && !isAdmin) {
            throw new ForbiddenException('You can only delete your own comments');
        }

        await this.commentModel.findByIdAndDelete(commentId).exec();
    }

    async findSessionCommentsWithReplies(sessionId: string): Promise<any> {
        // Get ALL comments and filter manually (same fix as registrations)
        const allComments = await this.commentModel
            .find({})
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        // Filter by session ID
        const comments = allComments.filter((c: any) =>
            c.session && c.session.toString() === sessionId
        );

        console.log('Debug - Looking for session:', sessionId);
        console.log('Debug - Total comments in DB:', allComments.length);
        console.log('Debug - Comments for this session:', comments.length);

        // Build nested structure
        const commentMap = new Map();
        const rootComments: any[] = [];

        // First pass: create map of all comments
        comments.forEach((comment: any) => {
            comment.replies = [];
            commentMap.set(comment._id.toString(), comment);
        });

        // Second pass: organize into tree
        comments.forEach((comment: any) => {
            if (comment.parent) {
                const parentId = comment.parent.toString();
                if (commentMap.has(parentId)) {
                    commentMap.get(parentId).replies.push(comment);
                } else {
                    rootComments.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        // Sort replies by createdAt (oldest first usually for replies, but requirement said "Comment hiển thị theo thời gian")
        // Usually replies are oldest top, but main thread is newest top.
        // Requirement: "Xem Comments của từng bài học: Hiển thị tất cả comments theo thời gian (mới nhất trước)"
        // Let's keep replies newest first too for consistency with requirement unless specified otherwise.

        return {
            comments: rootComments,
            totalComments: comments.length
        };
    }
}
