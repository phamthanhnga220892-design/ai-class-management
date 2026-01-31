import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Session } from '../../sessions/schemas/session.schema';
import { User } from '../../users/schemas/user.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
    @Prop({ type: Types.ObjectId, ref: 'Session', required: true })
    session: Session;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: User;

    @Prop({ required: true })
    content: string;

    @Prop({ type: Types.ObjectId, ref: 'Comment' })
    parent?: Comment; // For nested replies

    createdAt?: Date;
    updatedAt?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
