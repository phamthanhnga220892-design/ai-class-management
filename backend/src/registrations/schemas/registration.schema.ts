
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Class } from '../../classes/schemas/class.schema';
import { Course } from '../../courses/schemas/course.schema';

export type RegistrationDocument = HydratedDocument<Registration>;

export enum RegistrationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Registration {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: User;

    @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
    class: Class;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    course: Course;

    @Prop({
        required: true,
        enum: RegistrationStatus,
        default: RegistrationStatus.PENDING,
    })
    status: RegistrationStatus;

    @Prop()
    adminNote: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    approvedBy: User;

    @Prop()
    approvedAt: Date;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);

// Create compound index to prevent duplicate registrations
RegistrationSchema.index({ user: 1, class: 1 }, { unique: true });
