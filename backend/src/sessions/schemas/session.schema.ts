import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Class } from '../../classes/schemas/class.schema';

export type SessionDocument = HydratedDocument<Session>;

export class Attachment {
    @Prop({ required: true })
    filename: string;

    @Prop({ required: true })
    url: string;

    @Prop({ required: true })
    publicId: string;

    @Prop({ required: true })
    mimetype: string;

    @Prop({ required: true })
    size: number;
}

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

    @Prop({
        type: [{
            filename: String,
            url: String,
            publicId: String,
            mimetype: String,
            size: Number,
        }],
        default: [],
    })
    attachments: Attachment[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);
