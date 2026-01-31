import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 200 })
    title: string;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    description: string;

    @Prop({ required: true, trim: true })
    link: string;

    createdAt: Date;
    updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes
ProductSchema.index({ user: 1, createdAt: -1 });
