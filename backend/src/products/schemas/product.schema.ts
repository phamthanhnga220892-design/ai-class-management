import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
export class ProductFile {
    @Prop({ required: true })
    publicId: string;

    @Prop({ required: true })
    url: string;

    @Prop({ required: true })
    filename: string;

    @Prop({ required: true, enum: ['image', 'video', 'document'] })
    fileType: 'image' | 'video' | 'document';
}

export const ProductFileSchema = SchemaFactory.createForClass(ProductFile);

@Schema({ timestamps: true })
export class Product extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true, trim: true, maxlength: 200 })
    title: string;

    @Prop({ required: true, trim: true, maxlength: 1000 })
    description: string;

    @Prop({ trim: true })
    link?: string;

    @Prop({ type: [ProductFileSchema], default: [] })
    files: ProductFile[];

    createdAt: Date;
    updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ user: 1, createdAt: -1 });
