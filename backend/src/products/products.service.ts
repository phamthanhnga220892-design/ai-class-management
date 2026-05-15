import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductFile } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
    private static readonly MAX_FILES = 5;

    constructor(
        @InjectModel(Product.name) private productModel: Model<Product>,
        private cloudinaryService: CloudinaryService,
    ) {}

    async getMyProducts(userId: string): Promise<Product[]> {
        return this.productModel.find({ user: userId }).sort({ createdAt: -1 }).lean().exec();
    }

    async getPublicPortfolio(userId: string): Promise<{ user: any; products: Product[] }> {
        const products = await this.productModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', 'fullName email')
            .lean()
            .exec();

        let userInfo: any = null;
        if (products.length > 0) {
            userInfo = products[0].user;
        } else {
            const User = this.productModel.db.model('User');
            userInfo = await User.findById(userId).select('fullName email').lean().exec();
        }

        return { user: userInfo, products };
    }

    async create(
        userId: string,
        createProductDto: CreateProductDto,
        files: Express.Multer.File[],
    ): Promise<Product> {
        if (files.length > ProductsService.MAX_FILES) {
            throw new BadRequestException(`Tối đa ${ProductsService.MAX_FILES} file cho mỗi sản phẩm`);
        }

        const uploadedFiles = await Promise.all(
            files.map((f) => this.cloudinaryService.uploadFile(f.buffer, f.originalname, f.mimetype)),
        );

        const product = new this.productModel({
            ...createProductDto,
            user: userId,
            files: uploadedFiles,
        });
        return product.save();
    }

    async update(
        userId: string,
        productId: string,
        updateProductDto: UpdateProductDto,
        newFiles: Express.Multer.File[],
    ): Promise<Product> {
        const product = await this.productModel.findById(productId).exec();
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        if (product.user.toString() !== userId) {
            throw new ForbiddenException('Bạn không có quyền chỉnh sửa sản phẩm này');
        }

        const deleteFileIds: string[] = Array.isArray(updateProductDto.deleteFileIds)
            ? updateProductDto.deleteFileIds
            : updateProductDto.deleteFileIds
              ? [updateProductDto.deleteFileIds]
              : [];

        const remainingFiles = product.files.filter((f) => !deleteFileIds.includes(f.publicId));

        if (remainingFiles.length + newFiles.length > ProductsService.MAX_FILES) {
            throw new BadRequestException(`Tối đa ${ProductsService.MAX_FILES} file cho mỗi sản phẩm`);
        }

        if (deleteFileIds.length > 0) {
            const toDelete = product.files.filter((f) => deleteFileIds.includes(f.publicId));
            await Promise.allSettled(
                toDelete.map((f) => this.cloudinaryService.deleteFile(f.publicId, f.fileType)),
            );
        }

        const uploadedFiles = await Promise.all(
            newFiles.map((f) => this.cloudinaryService.uploadFile(f.buffer, f.originalname, f.mimetype)),
        );

        const { deleteFileIds: _removed, ...fieldsToUpdate } = updateProductDto as any;
        Object.assign(product, fieldsToUpdate);
        product.files = [...remainingFiles, ...uploadedFiles] as ProductFile[];
        return product.save();
    }

    async delete(userId: string, productId: string): Promise<void> {
        const product = await this.productModel.findById(productId).exec();
        if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
        if (product.user.toString() !== userId) {
            throw new ForbiddenException('Bạn không có quyền xóa sản phẩm này');
        }

        await Promise.allSettled(
            product.files.map((f) => this.cloudinaryService.deleteFile(f.publicId, f.fileType)),
        );

        await this.productModel.findByIdAndDelete(productId).exec();
    }
}
