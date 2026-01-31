import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Class } from '../../classes/schemas/class.schema';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true })
export class Session {
    @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
    class: Class;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true, type: String })
    content: string; // HTML content or markdown

    @Prop()
    videoUrl?: string;

    @Prop({ required: true, min: 1 })
    orderIndex: number;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
