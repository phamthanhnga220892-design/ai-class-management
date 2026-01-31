
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Course } from '../../courses/schemas/course.schema';

export type ClassDocument = HydratedDocument<Class>;

export enum ClassStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED',
}

@Schema({ timestamps: true })
export class Class {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    course: Course;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    mentorName: string;

    @Prop({ required: true })
    startDate: Date;

    @Prop()
    endDate: Date;

    @Prop()
    schedule: string; // e.g., "Thứ 7, 9:00-11:00"

    @Prop({ required: true, min: 1 })
    maxStudents: number;

    @Prop({ default: 0, min: 0 })
    currentStudents: number;

    @Prop({ required: true, enum: ClassStatus, default: ClassStatus.OPEN })
    status: ClassStatus;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
