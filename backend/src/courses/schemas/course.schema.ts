
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop()
    thumbnail: string;

    // Reference to Instructor (User)
    @Prop({ type: Types.ObjectId, ref: 'User' })
    instructor: User;

    @Prop({ default: 0 })
    totalSessions: number;

    @Prop({ default: 0 })
    totalDuration: number; // in minutes
}

export const CourseSchema = SchemaFactory.createForClass(Course);
