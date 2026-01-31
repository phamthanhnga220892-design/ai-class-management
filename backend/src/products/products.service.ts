import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
    ) { }

    // Get all products for current user
    async getMyProducts(userId: string): Promise<Product[]> {
        return this.productModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    // Get public portfolio for any user
    async getPublicPortfolio(userId: string): Promise<{ user: any; products: Product[] }> {
        const products = await this.productModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', 'fullName email')
            .lean()
            .exec();

        // Get user info
        let userInfo: any = null;
        if (products.length > 0) {
            userInfo = products[0].user;
        } else {
            // If no products, try to get user info from User model
            const User = this.productModel.db.model('User');
            userInfo = await User.findById(userId).select('fullName email').lean().exec();
        }

        return {
            user: userInfo,
            products
        };
    }

    // Create new product
    async create(userId: string, createProductDto: CreateProductDto): Promise<Product> {
        const product = new this.productModel({
            ...createProductDto,
            user: userId,
        });
        return product.save();
    }

    // Update product
    async update(userId: string, productId: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.productModel.findById(productId).exec();

        if (!product) {
            throw new NotFoundException('Không tìm thấy sản phẩm');
        }

        // Check ownership
        if (product.user.toString() !== userId) {
            throw new ForbiddenException('Bạn không có quyền chỉnh sửa sản phẩm này');
        }

        Object.assign(product, updateProductDto);
        return product.save();
    }

    // Delete product
    async delete(userId: string, productId: string): Promise<void> {
        const product = await this.productModel.findById(productId).exec();

        if (!product) {
            throw new NotFoundException('Không tìm thấy sản phẩm');
        }

        // Check ownership
        if (product.user.toString() !== userId) {
            throw new ForbiddenException('Bạn không có quyền xóa sản phẩm này');
        }

        await this.productModel.findByIdAndDelete(productId).exec();
    }
}
